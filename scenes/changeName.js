const { Scenes, Markup } = require("telegraf");
const { User } = require("../model/User");

const changeName = new Scenes.WizardScene("changeName", async (ctx) => {
  try {
    if (!ctx.message) {
      return ctx.replyWithHTML(
        `Familiya ismingizni kiriting.. Masalan: <code>Azamat Muxtorov</code>`,
        Markup.keyboard([["Bekor qilish"]])
          .oneTime()
          .resize()
      );
    }

    if (ctx.message.text.length < 3) {
      return ctx.reply(`Eng kamida 3 ta harf kiriting`);
    }
    if (ctx.message.text.length > 30) {
      return ctx.reply(`30 tadan ortiq belgi kiritish mumkin emas`);
    }

    await User.findOneAndUpdate(
      { telegram_id: ctx.from.id },
      { $set: { fio: ctx.message.text } }
    );
    ctx.reply(`✅ Ism familiyangiz o'zgartirildi.`);
    ctx.scene.leave();
  } catch (err) {
    ctx.reply("here 2");
    console.error(new Error(err));
  }
});

changeName.enter((ctx) => {
  ctx.replyWithHTML(
    `Familiya ismingizni kiriting.. Masalan: <code>Azamat Muxtorov</code>`,
    Markup.keyboard([["Bekor qilish"]])
      .oneTime()
      .resize()
  );
});
changeName.leave((ctx) => {
  ctx.reply(
    `Bosh sahifa`,
    Markup.keyboard([
      ["➕ Test yaratish", "✅Javobni tekshirish"],
      [`👤 Mening ma'lumotlarim`],
    ]).resize()
  );
});

changeName.on("text", (ctx, next) => {
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

module.exports = { changeName };
