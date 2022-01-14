import TelegramBot from 'node-telegram-bot-api';
import moment from 'moment';
import { UserModel } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();
const key: string = process.env.TELEGRAM_KEY || '';
export const telegramBot = new TelegramBot(key);

telegramBot.on('message', async (msg) => {
  console.log('ahoy');
  try {
    const userWithAuthCode = await UserModel.findOne({ 'telegramAuth.code': msg.text });
    if (!userWithAuthCode) return;
    
    const now = moment();
    const expire = moment(userWithAuthCode?.telegramAuth.expire);
    const chatId = msg.chat.id;

    if (now.isAfter(expire)) {
      telegramBot.sendMessage(chatId, 'Your code is expired, please sync again.');
      return;
    }
  
    const update = await userWithAuthCode.update({ telegram: chatId, telegramAuth: null });
    telegramBot.sendMessage(chatId, `Synced with account ${userWithAuthCode.username}!`);
  }

  catch(err) {
    console.log(`Error occured: ${err}`);
  }
});