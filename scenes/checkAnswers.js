const { Scenes, Markup } = require("telegraf");
const { Test } = require("../model/Test");
const { User } = require("../model/User");

function formatDate(date) {
  // Extract date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Format the date as "YYYY-MM-DD HH:mm:ss"
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDate;
}

const checkAnswers = new Scenes.WizardScene(
  "checkAnswers",
  async (ctx) => {
    try {
      if (isNaN(ctx.message.text)) {
        return ctx.reply(
          `Faqat son kiriting`,
          Markup.keyboard(["Bekor qilish"]).resize()
        );
      }
      const test = await Test.findOne({ order_num: ctx.message.text });

      if (!test) {
        return ctx.reply(
          `Xatolik!\nTest bazadan topilmadi.\nTest kodini noto'g'ri yuborgan bo'lishingiz mumkin, iltimos tekshirib qaytadan yuboring.`
        );
      }
      ctx.wizard.state.test_id = test._id;

      // if(test.right_answers.length !== ctx.)

      const creater = await User.findOne({ telegram_id: test.creater_id });
      await ctx.replyWithHTML(
        `📚 Fan: ${test.name}\n✍️ Test muallifi: ${creater.fio}\n📖 Test kodi: <b>${test.order_num}</b>\n✏️ Jami savollar soni: ${test.right_answers.length} ta`,
        Markup.keyboard(["Bekor qilish"]).resize()
      );
      await ctx.reply(
        `Javoblaringizni quyidagi ko'rinishlarda yuborishingiz mumkin:\n\nabcdabcd...`
      );
      ctx.wizard.next();
    } catch (err) {
      console.error(new Error(err));
    }
  },
  async (ctx) => {
    try {
      const test = await Test.findById(ctx.wizard.state.test_id);
      const user = await User.findOne({ telegram_id: ctx.from.id });
      function getObjectById(id) {
        return test.players.find((obj) => obj.telegram_id === id);
      }

      if (!test.isActive) {
        return ctx.reply(
          `☹️☹️☹️\nAfsuski siz javob yuborishga kechikdingiz!!!\nTest yakunlangan.\n\nKeyingi testda chaqqonroq bo'ling hurmatli foydalanuvchi...`
        );
      }

      const player = getObjectById(ctx.from.id);

      if (player) {
        ctx.reply(
          `❗️❗️❗️\nSiz oldinroq bu testga javob yuborgansiz.\n\nBitta testga faqat bir marta javob yuborish mumkin!\n\nSizning oldingi natijangiz: ${player.countRights} ta ${player.ball} ball`
        );
        ctx.scene.leave();
        return ctx.reply(
          "Asosiy menyu",
          Markup.keyboard([
            ["➕ Test yaratish", "✅Javobni tekshirish"],
            [`👤 Mening ma'lumotlarim`],
          ]).resize()
        );
      }

      if (test.right_answers.length !== ctx.message.text.length) {
        return ctx.reply(`${test.order_num} kodli testda savollar soni ${test.right_answers.length} ta.
        ❌Siz esa ${ctx.message.text.length} ta javob yozdingiz!`);
      }

      const players = test.players;
      const wrongAnswers = [];
      let countRights = 0;
      let ball = 0;
      if (test.right_answers.length === 90) {
      }

      for (let i = 0; i < test.right_answers.length; i++) {
        const rightAnswer = test.right_answers[i];
        if (rightAnswer === ctx.message.text[i]) {
          countRights++;
          ball++;
        } else {
          wrongAnswers.push(i + 1);
        }
      }
      players.push({
        telegram_id: ctx.from.id,
        fio: user.fio,
        countRights,
        ball,
        wrongAnswers,
      });

      await test.updateOne({ $set: { players } });
      const creator = await User.findOne({ telegram_id: test.creater_id });

      await ctx.replyWithHTML(
        `👤 Foydalanuvchi: ${user.fio}\n\n📚 Fan: ${
          test.name
        }\n✍️ Test muallifi: ${creator.fio}\n📖 Test kodi: ${
          test.order_num
        }\n✏️ Jami savollar soni: ${
          test.right_answers.length
        } ta\n✅ To'g'ri javoblar soni: ${countRights} ta🔣 Foiz : ${Math.round(
          (countRights / test.right_answers.length) * 100
        )} %\n❓ Noto'g'ri javoblaringiz: ${JSON.stringify(
          wrongAnswers
        )}\n\n🕐 Sana, vaqt: ${formatDate(new Date())}`
      );

      await ctx.telegram.sendMessage(
        test.creater_id,
        `<a href="https://t.me/${ctx.from.username}">${user.fio}</a>  Informatika fanidan <b>${test.order_num}</b> kodli testning javoblarini yubordi.`,
        {
          reply_markup: Markup.inlineKeyboard([
            Markup.button.callback("Joriy holat", "now_" + test.order_num),
            Markup.button.callback("Yakunlash", "end_" + test.order_num),
          ]).reply_markup,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );
      ctx.scene.leave();
    } catch (err) {
      console.error(new Error(err));
    }
  }
);

checkAnswers.enter((ctx) => {
  ctx.reply(`Test kodini kiriting`, Markup.keyboard(["Bekor qilish"]).resize());
});

checkAnswers.on("text", (ctx, next) => {
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

checkAnswers.leave((ctx) => {
  ctx.reply(
    `Bosh sahifa`,
    Markup.keyboard([
      ["➕ Test yaratish", "✅Javobni tekshirish"],
      [`👤 Mening ma'lumotlarim`],
    ]).resize()
  );
});

module.exports = { checkAnswers };
