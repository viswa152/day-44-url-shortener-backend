const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  longURL: {
    type: String,
    required: true,
  },
  shortURL: {
    type: String,
  },
  randomToken: {
    type: String,
  },
  hitCount: {
    type: Number,
    default: 0,
  },
  createdOn: {
    type: Date,
    default: Date.now(),
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Url", urlSchema, "urls");
