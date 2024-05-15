const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PageSchema = new Schema({
  url: { type: String, required: true },
  websiteURL: { type: String, required: true },
  createdDate: { type: String, required: true },
  lastEvaluationDate: { type: String, required: false},
  state: { type: String, required: false}
});

module.exports = mongoose.model("Page", PageSchema);