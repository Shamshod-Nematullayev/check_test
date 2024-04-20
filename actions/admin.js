const { Composer } = require("telegraf");
const { bot } = require("../core/bot");
const { User } = require("../model/User");

const composer = new Composer();

composer.hears(/admin+/, async (ctx) => {
  const admin = await User.findOne({ telegram_id: ctx.from.id, isAdmin: true });
  if (!admin) {
    return ctx.reply("Siz bunday huquqga ega emassiz");
  }

  const user = await User.findOne({
    telegram_id: ctx.message.text.split("+")[1],
  });
  if (!user) {
    return ctx.reply(
      "Siz admin qilib tayinlamoqchi bo'lgan foydalanuvchi topilmadi. \n\n❗️ U hali botda ro'yxatdan o'tmagan yoki noto'g'ri id raqami kiritdingiz"
    );
  }

  if (user.isAdmin) {
    return ctx.replyWithHTML(
      `Ushbu foydalanuvchi (${user.fio}) allaqachon admin qilingan`
    );
  }
  await user.updateOne({ $set: { isAdmin: true } });
  await ctx.reply(`${user.fio} admin qilib tayinlandi`);
});

bot.use(composer);
