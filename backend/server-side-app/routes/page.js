const express = require('express');
const router = express.Router();

const page_controller = require("../controllers/pageController");

/** GET page by id */
router.get('/id/:id', page_controller.page_get);

/** GET page by url*/
router.get('/url/', page_controller.pageUrl_get);

/** DELETE page by id */
router.delete('/id/:id', page_controller.page_delete);

/** POST page */
router.post('/', page_controller.page_post);

/** PUT page by id */
router.put('/id/:id', page_controller.page_put);

module.exports = router;