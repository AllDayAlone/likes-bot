import Joi from 'joi';
import { session, Scenes, Composer, Telegram, Telegraf } from 'telegraf'
import { SignupContext } from './types';
import { token, privateChatId } from './config';
import { createUser } from './db';

const api = new Telegram(token);

const nameStep = new Composer<SignupContext>()
nameStep.on('text', (ctx) => {
  try {
    ctx.session.name = Joi.attempt(ctx.update.message.text, Joi.string());
    ctx.reply(`Hi, ${ctx.session.name}. What is your email?`)
    ctx.wizard.next();
  } catch (err) {
    console.log(err);
    ctx.reply('Try again')
  }
})

const emailStep = new Composer<SignupContext>()
emailStep.on('text', async (ctx) => {
  try {
    ctx.session.email = Joi.attempt(ctx.update.message.text, Joi.string().email());
    ctx.session.inviteLink = (await api.createChatInviteLink(privateChatId, { member_limit: 1 })).invite_link;
    createUser({
      name: ctx.session.name,
      email: ctx.session.email,
      inviteLink: ctx.session.inviteLink,
      telegramId: ctx.update.message.from.id,
    })
    ctx.reply(`Perfect! Thank you for applying. You can now join the club ${ctx.session.inviteLink}`)
    ctx.wizard.next()
  } catch (err) {
    console.log(err);
    ctx.reply('Try again')
  }
})

const finalStep = new Composer<SignupContext>()
finalStep.use(ctx => ctx.reply(`Registration is finished, ${ctx.session.name}. Join the club ${ctx.session.inviteLink}`));

const signupWizard = new Scenes.WizardScene('signup-wizard', nameStep, emailStep, finalStep);
const stage = new Scenes.Stage<SignupContext>([signupWizard], { default: 'signup-wizard' });
const bot = new Telegraf<SignupContext>(token)

bot.use(Telegraf.log())
bot.use(session())
bot.start(async (ctx) => ctx.reply('Hello! Join our private club after a short registration. What is your name?'));
bot.use(stage.middleware())
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
