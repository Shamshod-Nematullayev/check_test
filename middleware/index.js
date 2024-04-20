const { bot } = require("../core/bot");
const { isJoinChannel } = require("./isJoinChannel");
const { isUser } = require("./isUser");

bot.use(isUser);
bot.use(isJoinChannel);
