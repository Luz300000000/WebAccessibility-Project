'use strict';

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

const { QualWeb, generateEARLReport } = require('@qualweb/core');

const Evaluation = require("../models/evaluation");

const process = require("../processDataAux");

/** GET evaluations */
exports.evaluations_list = asyncHandler(async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({}).exec();
    res.send(evaluations);
  } catch (error) {
    console.error(error);
  }
});

/** GET evaluation by id */
exports.evaluation_get = asyncHandler(async (req, res, next) => {
  const evaluation = await Evaluation.findById(req.params.id).exec();

  if (evaluation === null) {
    const err = new Error(`Evaluation with id ${req.params.id} not found.`);
    err.status = 404;
    return next(err);
  }
  res.send(evaluation);
});

//** GET evaluations website data */
exports.evaluationsWebsiteData_get = asyncHandler(async (req, res, next) => {
  const websiteURL = req.query.websiteURL; // url is passed as a query param
  if (!websiteURL) {
    const err = new Error("Website URL is required.");
    err.status = 400;
    return next(err);
  }

  const evaluations = await Evaluation.find({ websiteURL: websiteURL }).exec();

  if (!evaluations) {
    const err = new Error(`Evaluation with websiteURL ${websiteURL} not found.`);
    err.status = 404;
    return next(err);
  }

  // Gather all pages evaluations from this website
  let pagesData = [];
  evaluations.forEach(evaluation => {
    pagesData.push(evaluation.pageData);
  });

  // Process previous data to create websiteData
  const websiteData = process.websiteData(pagesData);
  res.send(websiteData);
});

/** GET evaluation by page url */
exports.evaluationPage_get = asyncHandler(async (req, res, next) => {
  const pageURL = req.query.pageURL; // url is passed as a query param
  if (!pageURL) {
    const err = new Error("Page URL is required.");
    err.status = 400;
    return next(err);
  }

  const evaluation = await Evaluation.findOne({ pageURL: pageURL }).exec();

  if (!evaluation) {
    const msg = `Evaluation with pageURL ${pageURL} not found.`;
    return next;
  }

  res.send(evaluation);
});

/** DELETE evaluation by id */
exports.evaluation_delete = asyncHandler(async (req, res, next) => {
  try {
    // Find the evaluation by id and delete it
    const result = await Evaluation.deleteOne({ _id: req.params.id }).exec();

    if (result) {
      console.log(`Evaluation with id ${req.params.id} deleted successfully:`, result);
    }
    else
      console.log(`Evaluation with id ${req.params.id} not found.`);

  } catch (error) {
    console.error('Error deleting evaluation:', error);
  }
});

/** POST evaluation */
exports.evaluation_post = [

  // Validate fields
  body("websiteURL", "url must not be empty.")
    .notEmpty(),
  body("pageURL", "pageURL must not be empty")
    .notEmpty(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const websiteURL = req.body.websiteURL;
    const pageURL = req.body.pageURL;

    // checks if a evaluation of this page already exists
    // if exists --> delete evaluation
    try {
      const result = await Evaluation.deleteOne({ pageURL: pageURL }).exec();
  
      if (result) {
        console.log(`Evaluation with id ${req.params.id} deleted successfully:`, result);
      }
      else
        console.log(`Evaluation with id ${req.params.id} not found.`);
  
    } catch (error) {
      console.error('Error deleting evaluation:', error);
    }

    const report = await generateReport(pageURL);
    const pageData = processData(report, pageURL);

    const evaluation = new Evaluation({
      _id: new mongoose.Types.ObjectId(),
      websiteURL: websiteURL,
      pageURL: pageURL,
      pageData: pageData
    });

    console.log("--- CREATED EVALUATION ---\n", evaluation);

    if (errors.isEmpty()) {
      console.log(`Added new evaluation for the website: ${websiteURL}`);
      await evaluation.save();
      res.send(evaluation);
    } else {
      return res.status(400).json({ errors: errors.array() });
    }
  })
];

/** PUT evaluation by id */
exports.evaluation_put = asyncHandler(async (req, res, next) => {
  try {
      const evaluation = await Evaluation.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
      if (!evaluation) {
          const err = new Error(`Evaluation with id ${req.params.id} not found.`);
          err.status = 404;
          return next(err);
      }
  await evaluation.save();
      res.send(evaluation);
  } catch (error) {
      console.error('Error updating evaluation:', error);
      next(error);
  }
});

/** Generate report */
const generateReport = (async (pageURL) => {
  const plugins = {
    adBlock: false, // Default value = false
    stealth: true // Default value = false
  };
  const qualweb = new QualWeb(plugins);

  const clusterOptions = {
    maxConcurrency: 5, // Performs several urls evaluations at the same time - the higher the number given, more resources will be used. Default value = 1
    timeout: 60 * 1000, // Timeout for loading page. Default value = 30 seconds
    monitor: true // Displays urls information on the terminal. Default value = false
  };

  const launchOptions = { args: ['--no-sandbox', '--ignore-certificate-errors'] }

  // Starts the QualWeb core engine
  await qualweb.start(clusterOptions, launchOptions);

  // QualWeb evaluation report
  const qualwebOptions = {
    "url": pageURL,
    "log": {
      "console": false
    }
  };

  // Evaluates the given options - will only return after all urls have finished evaluating or resulted in an error
  const reports = await qualweb.evaluate(qualwebOptions);

  console.log(reports);

  // Stops the QualWeb core engine
  await qualweb.stop();

  return reports;
});

/** Process data of a generated report according to the required indicators in frontend */
const processData = (report, pageURL) => {
  const countErrorTypes = process.calculateErrorTypes(report[`${pageURL}`]);
  let pageData = {
    "contains-errors": process.containsErrors(report[`${pageURL}`]),
    "errorsA": countErrorTypes[0],
    "errorsAA": countErrorTypes[1],
    "errorsAAA": countErrorTypes[2]
  };

  // let websiteData = process.websiteData(pagesData);
  // TODO: insert mostCommonErrors list in websiteData

  // return [websiteData, pagesData];
  return pageData;
};