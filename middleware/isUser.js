const { User } = require("../model/User");

async function isUser(ctx, next) {
  try {
    const user = await User.findOne({ telegram_id: ctx.from.id });
    if (!user) {
      return ctx.scene.enter("newUser");
    }
    next();
  } catch (error) {
    console.error(new Error(error));
  }
}
module.exports = { isUser };
