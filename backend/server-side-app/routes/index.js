const express = require('express');
const router = express.Router();

const website_controller = require("../controllers/websiteController");
const page_controller = require("../controllers/pageController");
const evaluation_controller = require("../controllers/evaluationController");

/* GET home page */
router.get('/', function(req, res, next) {
  res.sendStatus(200);
});

/* GET websites list */
router.get('/websites', website_controller.websites_list);

/* GET pages by website */
router.get('/pages/website', page_controller.pagesWebsite_get);

/* GET pages list */
router.get('/pages', page_controller.pages_list);

/** GET website evaluations data */
router.get('/evaluations/website', evaluation_controller.evaluationsWebsiteData_get);

/** GET website exported data as html list */
router.get('/evaluations/download/website', evaluation_controller.exportWebsiteData_get);

/** GET evaluations list */
router.get('/evaluations', evaluation_controller.evaluations_list);


module.exports = router;
