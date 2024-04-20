const { Composer, Markup } = require("telegraf");
const { bot } = require("../core/bot");

const composer = new Composer();

composer.on("message", (ctx) => {
  console.log(ctx.update.message);
  ctx.reply(
    `Bosh sahifa`,
    Markup.keyboard([
      ["➕ Test yaratish", "✅Javobni tekshirish"],
      [`👤 Mening ma'lumotlarim`],
    ]).resize()
  );
});

bot.use(composer);
