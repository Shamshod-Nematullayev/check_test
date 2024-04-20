const { Schema, model } = require("mongoose");

const schema = new Schema({
  telegram_id: {
    type: Number,
    required: true,
  },
  fio: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports.User = model("user", schema);
