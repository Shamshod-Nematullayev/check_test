const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    value: Number,
    name: String,
    last_update: Date,
  },
  { timestamps: true }
);

// auto incement uchun yaratilgan model
// name: counter nomi boshqalaridan ajratib olish uchun
// value: counter qiymati
// last_update: ohirgi marta qachon yangilanganligi
module.exports.Counter = mongoose.model("counter", schema);

(async () => {
  const counter = await this.Counter.findOne({
    name: "test_order_num",
  });
  if (!counter) {
    await this.Counter.create({ name: "test_order_num", value: 0 });
  }
})();
