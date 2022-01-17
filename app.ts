import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { AuthRouter } from './routes/auth.route';
import { UserRouter } from './routes/user.route';
import { WatchRouter } from './routes/watch.route';
import { scheduler } from './scripts/scheduler';
import { telegramBot } from './scripts/telegram';

async function main() {
  const app = express();
  const port = 3000;

  const teleBot = telegramBot;
  scheduler.reInitScheduler();

  const mongoHost = process.env.MONGO_HOST;
  const mongoDB = process.env.MONGO_DB;
  await mongoose.connect(`mongodb://${mongoHost}/${mongoDB}`);
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  app.use('/user', UserRouter);
  app.use('/watch', WatchRouter);
  app.use('/auth', AuthRouter);
  
  try {
    app.listen(port, () => {
      console.log(`Listeing on port ${port}`);
    });
  }
  
  catch(err: any) {
    console.log(`Error occured: ${err.message}`);
  }
}

dotenv.config();
main();