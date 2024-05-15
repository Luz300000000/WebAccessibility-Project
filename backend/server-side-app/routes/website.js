const express = require('express');
const router = express.Router();

const website_controller = require("../controllers/websiteController");

/** GET website by id */
router.get('/id/:id', website_controller.website_get);

/** GET website by url*/
router.get('/url/', website_controller.websiteUrl_get);

/** DELETE website by id */
router.delete('/id/:id', website_controller.website_delete);

/** POST website */
router.post('/', website_controller.website_post);

/** PUT website by id */
router.put('/id/:id', website_controller.website_put);

module.exports = router;