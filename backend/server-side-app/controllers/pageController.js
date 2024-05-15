const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

const Page = require("../models/page");

/** GET pages */ 
exports.pages_list = asyncHandler(async (req, res, next) => {
	try {
		const pages = await Page.find({}).exec();
		res.send(pages);
	} catch (error) {
		console.error(error);
	}
});

/** GET page by id */ 
exports.page_get = asyncHandler(async (req,res,next) => {
	const page = await Page.findById(req.params.id).exec();

	if (page === null) {
		const err = new Error(`Page with id ${req.params.id} not found.`);
		err.status = 404;
		return next(err);
	}
	res.send(page);
});

/** GET page by url */ 
exports.pageUrl_get = asyncHandler(async (req,res,next) => {
	const pageURL = req.query.url; // url is passed as a query param

    if (!pageURL) {
        const err = new Error("Page URL is required.");
        err.status = 400;
        return next(err);
    }

    const page = await Page.findOne({ url: pageURL }).exec();

    if (!page) {
        const err = new Error(`Page with URL ${pageURL} not found.`);
        err.status = 404;
        return next(err);
    }

    res.send(page);
});

/** GET pages by websiteURL */
exports.pagesWebsite_get = asyncHandler(async (req,res,next) => {
	const websiteURL = req.query.websiteURL; // websiteURL is passed as a query param

    if (!websiteURL) {
        const err = new Error("Website URL is required.");
        err.status = 400;
        return next(err);
    }

    const pages = await Page.find({ websiteURL: websiteURL }).exec();

    if (!pages) {
        const err = new Error(`Pages with websiteURL ${websiteURL} not found.`);
        err.status = 404;
        return next(err);
    }

    res.send(pages);
});

/** POST page */ 
exports.page_post = [

	// Validate fields
	body("url", "url must not be empty.")
		.notEmpty(),
	body("websiteURL", "websiteURL must not be empty.")
		.notEmpty(),
	body("createdDate", "createdDate must not be empty.")
		.notEmpty(),
	body("modifiedDate")
		.optional(),
	body("state")
		.optional(),

 	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		const page = new Page({
			_id: new mongoose.Types.ObjectId(),
			url: req.body.url,
			websiteURL: req.body.websiteURL,
			createdDate: req.body.createdDate,
			lastEvaluationDate: req.body.lastEvaluationDate,
			state: req.body.state
		});
		if (errors.isEmpty()) {
			// Data is valid
			console.log(`Added Page: ${req.body.url}`);
			await page.save();
			res.send(page);
		}
	})
];

/** DELETE page by id */ 
exports.page_delete = asyncHandler(async (req, res, next) => {
	try {
		// Find the page by id and delete it
		const result = await Page.deleteOne({ _id: req.params.id }).exec();

		if (result) {
			console.log(`Page with id ${req.params.id} deleted successfully:`, result);
		}
		else
			console.log(`Page with id ${req.params.id} not found.`);

	} catch (error) {
		console.error('Error deleting page:', error);
	}
});

/** PUT page by id */
exports.page_put = asyncHandler(async (req, res, next) => {
    try {
        const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!page) {
            const err = new Error(`Page with id ${req.params.id} not found.`);
            err.status = 404;
            return next(err);
        }
		await page.save();
        res.send(page);
    } catch (error) {
        console.error('Error updating page:', error);
        next(error);
    }
});