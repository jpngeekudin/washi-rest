import express from 'express';
import moment from 'moment';
import { WatchModel } from '../models/watch.model';
import { scheduler } from '../scripts/scheduler';
const router = express.Router();

router.get('/get', async function(req, res, next) {
  const userId: string = req.query.user as string;
  const type: string = req.query.type as string;
  const search: string = req.query.search as string;

  const andQuery = [];
  if (userId) andQuery.push({ user: userId });
  if (type) andQuery.push({ type: type });
  if (search) {
    const regx = new RegExp(search, 'i');
    andQuery.push({
      '$or': [
        { title: regx },
        { source: regx }
      ]
    });
  }

  const query: any = {};
  if (andQuery.length) query['$and'] = andQuery;

  try {
    const watchCount = await WatchModel.count(query);
    const watchList = await WatchModel.find(query)
      .select('-__v')
      .populate({
        path: 'user',
        select: '-__v'
      })
      .lean();

    const watchListCounted = watchList.map(watch => {
      let currentEpisode: number;
      const start = moment(watch.start);
      const now = moment();
      const diffWeek = now.diff(start, 'week');
      if (watch.totalEpisode) {
        const episode = diffWeek + 1;
        if (episode <= watch.totalEpisode) currentEpisode = episode;
        else currentEpisode = watch.totalEpisode;
      }

      else if (watch.end) {
        const end = moment(watch.end);
        if (now.isBefore(end)) {
          currentEpisode = diffWeek + 1;
        } else {
          const diffWeekWithEnd = end.diff(start, 'week');
          currentEpisode = diffWeekWithEnd + 1;
        }
      }

      else currentEpisode = diffWeek + 1;

      return { ...watch, currentEpisode };
    })

    return res.json({
      status: true,
      data: watchListCounted,
      messagae: 'success',
      total: watchCount
    });
  }

  catch(err) {
    return res.status(500).json({
      status: false,
      data: null,
      message: err,
      total: 0
    });
  }
});

router.post('/create', async function(req, res, next) {
  const title: string = req.body.title;
  const type: 'anime' | 'dorama' = req.body.type;
  const start: number = req.body.start;
  const end: number = req.body.end;
  const time: number = req.body.time;
  const totalEpisode: number = req.body.totalEpisode;
  const source: string = req.body.source;
  const userid: string = req.body.user;
  const roundedStart = moment(start).startOf('day').valueOf();
  const roundedTime = time && moment(time).startOf('minute').valueOf();

  if (!title || !type || !start) return res.status(400).json({
    status: false,
    message: 'Bad Request'
  });

  try {
    const watch = new WatchModel({
      title, type, start: roundedStart, end, time: roundedTime, totalEpisode, source, user: userid
    });
    const save = await watch.save();
    const reschedule = await scheduler.reInitScheduler();
    return res.json({
      status: true,
      message: 'success',
      data: save
    });
  }

  catch(err) {
    return res.status(500).json({
      status: false,
      message: err,
      data: null
    });
  }
});

router.post('/update/:id', async function(req, res, next) {
  const id: string = req.params.id;
  const title: string = req.body.title;
  const type: 'anime' | 'dorama' = req.body.type;
  const start: number = req.body.start;
  const end: number = req.body.end;
  const time: number = req.body.time;
  const totalEpisode: number = req.body.totalEpisode;
  const source: string = req.body.source;
  const userid: string = req.body.user;
  const roundedStart = start && moment(start).startOf('day').valueOf();
  const roundedTime = time && moment(time).startOf('minute').valueOf();

  try {
    const update = await WatchModel.updateOne({ _id: id }, {
      title, type, start: roundedStart, end, time: roundedTime, totalEpisode, source, user: userid
    });
    const reschedule = await scheduler.reInitScheduler();
    return res.json({
      status: true,
      data: update,
      message: 'success'
    });
  }

  catch(err) {
    return res.status(500).json({
      status: false,
      data: null,
      message: err
    });
  }
});

router.delete('/delete/:id', async function(req, res, next) {
  const id: string = req.params.id;

  try {
    const del = await WatchModel.deleteOne({ _id: id });
    const reschedule = await scheduler.reInitScheduler();
    return res.json({
      status: true,
      data: del,
      message: 'success'
    });
  }

  catch(err) {
    return res.status(500).json({
      status: false,
      data: null,
      message: err
    });
  }
});

export const WatchRouter = router;