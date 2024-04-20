const { Composer } = require("telegraf");
const { bot } = require("../core/bot");
const { User } = require("../model/User");
const { Markup } = require("telegraf");
const { Test } = require("../model/Test");
const pdf = require("pdf-creator-node");
const fs = require("fs");

const composer = new Composer();

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
composer.hears(`👤 Mening ma'lumotlarim`, async (ctx) => {
  try {
    const user = await User.findOne({ telegram_id: ctx.from.id });
    ctx.replyWithHTML(
      `Sizning ma'lumotlaringiz:\n---------------------------\n👤 Ism familiya:\n${
        user.fio
      }\n📞 Telefon raqam: ${user.phone}\n🆔 <code>${
        ctx.from.id
      }</code>\n\n---------------------------\nSana, vaqt: ${formatDate(
        new Date()
      )}`,
      Markup.inlineKeyboard([
        Markup.button.callback("✏️ Ism o'zgartirish", "changeName"),
      ])
    );
  } catch (err) {
    console.error(new Error(err));
  }
});
composer.action("changeName", (ctx) => {
  ctx.deleteMessage();
  ctx.scene.enter("changeName");
});

composer.hears("➕ Test yaratish", async (ctx) => {
  try {
    const admin = await User.findOne({
      telegram_id: ctx.from.id,
      isAdmin: true,
    });
    if (!admin) {
      return ctx.reply("Siz bunday huquqga ega emassiz");
    }

    ctx.scene.enter("createNewTest");
  } catch (err) {
    console.error(new Error(err));
  }
});

composer.hears("✅Javobni tekshirish", async (ctx) => {
  try {
    ctx.scene.enter("checkAnswers");
  } catch (err) {
    console.error(new Error(err));
  }
});

composer.action(/now_/, async (ctx) => {
  try {
    const test = await Test.findOne({
      order_num: ctx.update.callback_query.data.split("_")[1],
    });

    let results = ``;
    test.players.forEach((player, i) => {
      results += `${i + 1}. ${player.fio} - ${player.countRights} ta`;
    });
    await ctx.reply(
      `Test holati:\n\nFan: ${test.name}\nTest kodi: ${test.order_num}\nSavollar soni: ${test.right_answers.length}\n\nNatijalar:\n\n ${results}`
    );
  } catch (err) {
    console.error(new Error(err));
  }
});
composer.action(/end_/, async (ctx) => {
  try {
    const test = await Test.findOne({
      order_num: ctx.update.callback_query.data.split("_")[1],
    });
    if (!test.isActive) {
      return ctx.answerCbQuery(`Bu test allaqachon yakunlangan`);
    }
    const creater = await User.findOne({ telegram_id: test.creater_id });
    let html = fs.readFileSync("./lib/results.html", "utf8");
    let options = {
      format: "A3",
      orientation: "portrait",
      border: "0",
    };
    test.players.sort((a, b) => b.ball - a.ball);
    test.players.forEach((player, i) => {
      test.players[i] = {
        ...player,
        order: i + 1,
        procent:
          Math.floor((player.countRights / test.right_answers.length) * 1000) /
          10,
      };
    });
    let document = {
      html,
      data: {
        bot_username: ctx.botInfo.username,
        order_num: test.order_num,
        name: test.name,
        right_answers_count: test.right_answers.length,
        creater: creater.fio,
        players: test.players,
      },
      path: "./natijalar_" + test.order_num + ".pdf",
      type: "",
    };
    await pdf.create(document, options);

    let right_answers = ``;
    test.right_answers.split("").forEach((key, i) => {
      right_answers += `${i + 1}. ${key} `;
    });
    await ctx.replyWithDocument(
      { source: "./natijalar_" + test.order_num + ".pdf" },
      {
        caption: `Test natijalari.\n\n⛔️ Test yakunlandi.\n\nTest kodi: ${test.order_num}\nTo'g'ri javoblar:\n<code>${right_answers}</code>  \n\nTestda qatnashgan barcha ishtirokchilarga rahmat.\nIlmingiz ziyoda bo'lsin!!☺️`,
        reply_markup: Markup.inlineKeyboard([
          Markup.button.callback(
            "Sertifikatlarni olish",
            `getCertificate_` + test.order_num
          ),
        ]).reply_markup,
        parse_mode: "HTML",
      }
    );

    await test.updateOne({ $set: { isActive: false } });
    // mongodbda tugatildi qilish
  } catch (err) {
    console.error(new Error(err));
  }
});

bot.use(composer);
