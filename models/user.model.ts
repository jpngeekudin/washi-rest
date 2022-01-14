import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  telegram: { type: String },
  telegramAuth: {
    code: { type: String },
    expire: { type: Number }
  }
});

export interface UserInterface extends mongoose.Document {
  name: string,
  username: string,
  password: string,
  telegram: string,
  telegramAuth: {
    code: string,
    expire: number
  }
}

export const UserModel = mongoose.model<UserInterface>('User', UserSchema, 'user');