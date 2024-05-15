const express = require('express');
const router = express.Router();

const evaluation_controller = require("../controllers/evaluationController");

/** GET evaluation by id */
router.get('/id/:id', evaluation_controller.evaluation_get);

/** GET evaluation by page */
router.get('/page', evaluation_controller.evaluationPage_get);

/** DELETE evaluation by id */
router.delete('/id/:id', evaluation_controller.evaluation_delete);

/** POST evaluation */
router.post('/', evaluation_controller.evaluation_post);

module.exports = router;