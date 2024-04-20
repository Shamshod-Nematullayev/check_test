const { Schema, model } = require("mongoose");

const schema = new Schema({
  creater_id: {
    type: Number,
    required: true,
  },
  name: String,
  right_answers: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  players: {
    type: Array,
    default: [],
  },
  order_num: Number,
});

module.exports.Test = model("test", schema);
