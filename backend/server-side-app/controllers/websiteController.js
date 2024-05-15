const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");

const Website = require("../models/website");
const Page = require("../models/page");

/** GET websites */ 
exports.websites_list = asyncHandler(async (req, res, next) => {
	try {
		let websites = await Website.find({}).exec();

    // Check if any page has an error in evaluation and update state
    await Promise.all(websites.map(async (website) => {
      const websitePages = await Page.find({ websiteURL: website.url }).exec();
      websitePages.forEach(page => {
        if (page.state === 'Erro na avaliação')
            website.state = 'Erro na avaliação';
      });
    }));
		res.send(websites);
	} catch (error) {
		console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
	}
});

/** GET website by id */ 
exports.website_get = asyncHandler(async (req,res,next) => {
	const website = await Website.findById(req.params.id).exec();

	if (website === null) {
		const err = new Error(`Website with id ${req.params.id} not found.`);
		err.status = 404;
		return next(err);
	}

	const websitePages = await Page.find({ websiteURL: website.url }).exec();
      websitePages.forEach(page => {
        if (page.state === 'Erro na avaliação')
            website.state = 'Erro na avaliação';
      });

	res.send(website);
});

/** GET website by url */ 
exports.websiteUrl_get = asyncHandler(async (req,res,next) => {
	const websiteURL = req.query.url; // url is passed as a query param

    if (!websiteURL) {
        const err = new Error("Website URL is required.");
        err.status = 400;
        return next(err);
    }

    const website = await Website.findOne({ url: websiteURL }).exec();

    if (!website) {
        const err = new Error(`Website with URL ${websiteURL} not found.`);
        err.status = 404;
        return next(err);
    }

	const websitePages = await Page.find({ websiteURL: website.url }).exec();
      websitePages.forEach(page => {
        if (page.state === 'Erro na avaliação')
            website.state = 'Erro na avaliação';
      });

    res.send(website);
});

/** POST website */ 
exports.website_post = [

	// Validate fields
	body("url", "url must not be empty.")
		.notEmpty(),
	body("createdDate", "createdDate must not be empty.")
		.notEmpty(),
	body("modifiedDate")
		.optional(),
	body("state", "state must not be empty.")
		.notEmpty(),

 	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);

		const website = new Website({
			_id: new mongoose.Types.ObjectId(),
			url: req.body.url,
			createdDate: req.body.createdDate,
			lastEvaluationDate: req.body.lastEvaluationDate,
			state: req.body.state
		});
		if (errors.isEmpty()) {
			console.log(`Added Website: ${req.body.url}`);
			await website.save();
			res.send(website);
		}
	})
];

/** DELETE website by id */ 
exports.website_delete = asyncHandler(async (req, res, next) => {
	try {
		// Find the website by id and delete it
		const result = await Website.deleteOne({ _id: req.params.id }).exec();

		if (result) {
			console.log(`Website with id ${req.params.id} deleted successfully:`, result);
		}
		else
			console.log(`Website with id ${req.params.id} not found.`);

	} catch (error) {
		console.error('Error deleting website:', error);
	}
});

/** PUT website by id */
exports.website_put = asyncHandler(async (req, res, next) => {
    try {
        const website = await Website.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
        if (!website) {
            const err = new Error(`Website with id ${req.params.id} not found.`);
            err.status = 404;
            return next(err);
        }
		await website.save();
        res.send(website);
    } catch (error) {
        console.error('Error updating website:', error);
        next(error);
    }
});
