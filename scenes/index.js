const { Scenes } = require("telegraf");
const { bot } = require("../core/bot");
const { changeName } = require("./changeName");
const { newUser } = require("./newUser");
const LocalSession = require("telegraf-session-local");
const { createNewTest } = require("./createNewTest");
const { checkAnswers } = require("./checkAnswers");

const stage = new Scenes.Stage([
  newUser,
  changeName,
  createNewTest,
  checkAnswers,
]);

bot.use(
  new LocalSession({
    database: "./config/session.json",
  }).middleware()
);
bot.use(stage.middleware());
