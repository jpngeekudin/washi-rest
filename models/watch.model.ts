import moment from 'moment';
import mongoose from 'mongoose';
import { UserInterface } from './user.model';

interface WatchInterface {
  title: string,
  type: 'anime' | 'dorama',
  cover?: string,
  start: number,
  end?: number,
  time?: number,
  totalEpisode?: number,
  source?: string,
  user: UserInterface,
}

const WatchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['anime', 'dorama'], required: true },
  cover: { type: String },
  start: { type: Number, required: true },
  end: { type: Number },
  time: { type: Number, default: moment().hour(7).startOf('hour').valueOf() },
  totalEpisode: { type: Number },
  source: { type: String },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

export type WatchDocument = mongoose.Document & WatchInterface;
export const WatchModel = mongoose.model<WatchDocument>('Watch', WatchSchema, 'watch');