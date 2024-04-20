const { Scenes, Markup } = require("telegraf");
const { User } = require("../model/User");

const newUser = new Scenes.WizardScene(`newUser`, async (ctx) => {
  try {
    if (!ctx.message.contact) {
      return ctx.reply(
        `Assalomu alaykum hurmatli foydalanuvchi.\n\nBotdan foydalanish uchun iltimos telefon raqamingizni yuboring.\nShunchaki "Telefon raqamni jo'natish" tugmasini bossangiz kifoya...`,
        Markup.keyboard([
          Markup.button.contactRequest("Telefon raqamni jo'natish"),
        ]).resize()
      );
    }
    await User.create({
      fio: ctx.message.contact.first_name,
      phone: ctx.message.contact.phone_number,
      telegram_id: ctx.message.contact.user_id,
    });

    ctx.scene.leave();
    ctx.reply("Ro'yxatdan o'tkazildi");
    ctx.scene.enter("changeName");
  } catch (err) {
    console.log(new Error(err));
  }
});

newUser.enter((ctx) => {
  ctx.reply(
    `Assalomu alaykum hurmatli foydalanuvchi.\n\nBotdan foydalanish uchun iltimos telefon raqamingizni yuboring.\nShunchaki "Telefon raqamni jo'natish" tugmasini bossangiz kifoya...`,
    Markup.keyboard([
      Markup.button.contactRequest("Telefon raqamni jo'natish"),
    ]).resize()
  );
});

module.exports = { newUser };
