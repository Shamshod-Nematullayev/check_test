const { Markup } = require("telegraf");
const { bot } = require("../core/bot");

const channels = [-1001332428170];

async function isJoinChannel(ctx, next) {
  try {
    let counter1 = 0;
    console.log(ctx.message);
    const results = [];
    async function check_chat_member(channel_id) {
      if (counter1 == channels.length) return;
      try {
        const res = await ctx.telegram.getChatMember(channel_id, ctx.from.id);
        if (res.status == "left") {
          let buttons = [];
          let counter2 = 0;
          async function addButton() {
            if (counter2 == channels.length) return;
            const channel = await bot.telegram.getChat(channels[counter2]);
            buttons.push([
              Markup.button.url(channel.title, channel.invite_link),
            ]);
            counter2++;
            await addButton();
          }
          await addButton();
          await ctx.reply(
            `Siz botdan foydalanish uchun avval uchbu kanallarga obuna bo'lishingiz kerak\nQayta ishga tushirish /start`,
            Markup.inlineKeyboard(buttons)
          );
          counter1++;
          results.push(false);
          return await check_chat_member(channels[counter1]);
        }

        counter1++;
        results.push(true);
        return await check_chat_member(channels[counter1]);
      } catch (err) {
        if (err.description == `Bad Request: user not found`) {
          let buttons = [];
          let counter = 0;
          async function addButton() {
            if (counter == channels.length) return;
            const channel = await bot.telegram.getChat(channels[counter]);
            buttons.push([
              Markup.button.url(channel.title, channel.invite_link),
            ]);
          }
          await addButton();
          await ctx.reply(
            `Siz botdan foydalanish uchun avval uchbu kanallarga obuna bo'lishingiz kerak\nQayta ishga tushirish /start`,
            Markup.inlineKeyboard(buttons)
          );
          counter1++;
          results.push(false);
          return await check_chat_member(channels[counter1]);
        }
        console.error(err.description);
      }
    }
    await check_chat_member(channels[counter1]);
    function checkArray(arr) {
      for (let i = 0; i < arr.length; i++) {
        if (!arr[i]) {
          return false;
        }
      }
      return true;
    }
    if (checkArray(results)) {
      next();
    }
  } catch (err) {
    console.error(new Error(err));
  }
}
module.exports = { isJoinChannel };
