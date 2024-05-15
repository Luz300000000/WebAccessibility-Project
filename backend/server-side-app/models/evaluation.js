const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EvaluationSchema = new Schema({
  websiteURL: { type: String, required: true },
  pageURL: { type: String, required: true },
  pageData: { type: mongoose.SchemaTypes.Mixed, required: true }
});

module.exports = mongoose.model("Evaluation", EvaluationSchema);