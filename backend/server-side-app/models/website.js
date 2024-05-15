const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
  url: { type: String, required: true },
  createdDate: { type: String, required: true },
  lastEvaluationDate: { type: String, required: false},
  state: { type: String, required: true }
});

module.exports = mongoose.model("Website", WebsiteSchema);