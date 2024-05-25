'use strict';

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

const { QualWeb, generateEARLReport } = require('@qualweb/core');

const Evaluation = require("../models/evaluation");
const Page = require("../models/page");

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
  try {
      const websiteURL = req.query.websiteURL;
      const websiteData = await fetchWebsiteData(websiteURL);
      res.send(websiteData);
  } catch (err) {
      err.status = err.message.includes('not found') ? 404 : 400;
      return next(err);
  }
});

/** GET html file from website evaluations data (json) */
exports.exportWebsiteData_get = asyncHandler(async (req, res, next) => {
  try {
      const websiteURL = req.query.websiteURL;
      const websiteData = await fetchWebsiteData(websiteURL);
      const htmlContent = process.getHtmlReport(websiteData, websiteURL);
      res.setHeader('Content-Disposition', 'attachment; filename="report.html"');
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
  } catch (err) {
      err.status = err.message.includes('not found') ? 404 : 400;
      return next(err);
  }
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
    const err = new Error(`Evaluation with pageURL ${pageURL} not found.`);
    err.status = 404;
    return next(err);
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
      console.log("ERROR IN EVALUATION POST");
      const pageError = await Page.findOneAndUpdate({ url: pageURL }, {state: 'Erro na avaliação'}, {new: true}).exec();
      await pageError.save();
      res.status(500).json({ errors: errors.array() });
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
  const errorCounters = process.getErrorCounters(report[`${pageURL}`]);
  let pageData = {
    "contains_errors": process.containsErrors(report[`${pageURL}`]),
    "errorsA": errorCounters[0],
    "errorsAA": errorCounters[1],
    "errorsAAA": errorCounters[2],
    "failed_rules_occurrences": errorCounters[3],
    "metadata_stats": process.getMetadataStats(report[`${pageURL}`]),
    "detailed_tests": process.getDetailedTests(report[`${pageURL}`])
  };
  return pageData;
};

/** Fetch website last evaluation data */
const fetchWebsiteData = async (websiteURL) => {
  if (!websiteURL) {
      throw new Error("Website URL is required.");
  }

  const evaluations = await Evaluation.find({ websiteURL: websiteURL }).exec();

  if (!evaluations) {
      throw new Error(`Evaluation with websiteURL ${websiteURL} not found.`);
  }

  // Gather all pages evaluations from this website
  // Retrieve 10 most common accessibility errors
  let pagesData = [];
  let pagesErrorsMaps = [];
  evaluations.forEach(evaluation => {
      pagesData.push(evaluation.pageData);
<<<<<<< Updated upstream
      pagesErrorsMaps.push(evaluation.pageData['failed-rules-occurrences']);
=======
      pagesErrorsMaps.push(evaluation.pageData['failed_rules_occurrences']);
>>>>>>> Stashed changes
  });
  const mostCommonErrorsMap = process.mergeSortPageErrorsMaps(pagesErrorsMaps);

  // Process previous data to create websiteData
  return process.websiteData(pagesData, mostCommonErrorsMap);
};

