const { Scenes, Markup } = require("telegraf");
const { Counter } = require("../model/Counter");
const { Test } = require("../model/Test");
const { User } = require("../model/User");
const createNewTest = new Scenes.WizardScene(
  "createNewTest",
  async (ctx) => {
    try {
      ctx.wizard.state.test_name = ctx.message.text;
      await ctx.reply(
        `To'g'ri javoblarni abc... ko'rinishida yuboring.\n\nMisol:\nabbccdd`,
        Markup.keyboard(["Bekor qilish"]).resize()
      );
      ctx.wizard.next();
    } catch (err) {
      console.log(new Error(err));
    }
  },
  async (ctx) => {
    const counter = await Counter.findOne({ name: "test_order_num" });
    const user = await User.findOne({ telegram_id: ctx.from.id });
    await Test.create({
      name: ctx.wizard.state.test_name,
      creater_id: ctx.from.id,
      right_answers: ctx.message.text,
      order_num: counter.value + 1,
    });

    await ctx.reply(
      `✅Test bazaga qo'shildi.\nTest kodi: ${
        counter.value + 1
      }\nSavollar soni: ${
        ctx.message.text.length
      } ta.\n\nQuyidagi tayyor izohni o'quvchilaringizga yuborishingiz mumkin\n👇👇👇`
    );
    await ctx.replyWithHTML(
      `📝📝Test boshlandi.\n\nTest muallifi: ${user.fio}\n\nFan: ${
        ctx.wizard.state.test_name
      }\nSavollar soni: ${ctx.message.text.length} ta\nTest kodi: ${
        counter.value + 1
      }\n\n\nJavoblaringizni @${
        ctx.botInfo.username
      } ga quyidagi ko'rinishlarda yuborishingiz mumkin.\n\n☝️ Eslatma!\nJavoblar aynan @${
        ctx.botInfo.username
      } ga yuborilishi shart, boshqasiga emas.`
    );
    await Counter.updateOne(
      { name: "test_order_num" },
      { $set: { value: counter.value + 1 } }
    );
    ctx.scene.leave();
  }
);

createNewTest.enter((ctx) => {
  ctx.reply(
    `Test uchun nom kiriting. \n\nMasalan: Informatika`,
    Markup.keyboard(["Bekor qilish"]).resize()
  );
});

createNewTest.on("text", (ctx, next) => {
  if (ctx.message.text === "Bekor qilish") {
    ctx.scene.leave();
    return ctx.reply(
      "Asosiy menyu",
      Markup.keyboard([
        ["➕ Test yaratish", "✅Javobni tekshirish"],
        [`👤 Mening ma'lumotlarim`],
      ]).resize()
    );
  }
  next();
});

createNewTest.leave((ctx) => {
  ctx.reply(
    `Bosh sahifa`,
    Markup.keyboard([
      ["➕ Test yaratish", "✅Javobni tekshirish"],
      [`👤 Mening ma'lumotlarim`],
    ]).resize()
  );
});

module.exports = { createNewTest };
