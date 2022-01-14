import schedule from 'node-schedule';
import moment from 'moment';
import { WatchModel } from '../models/watch.model';

class Scheduler {
  scheduleList: schedule.Job[] = [];
  
  async reInitScheduler() {
    try {
      const scheduleList: any[] = [];
      const watchList = await WatchModel.find()
        .populate('user')
        .lean();

      watchList.forEach(watch => {
        const name = `${watch.user.username}-${watch.title}`;
        const day = moment(watch.start).day();
        const hour = moment(watch.time).hour();
        const minute = moment(watch.time).minute();
        const scheduleTime = `0 ${minute} ${hour} * * ${day}`;
        const job: schedule.Job = schedule.scheduleJob(name, scheduleTime, function() {
          const date = moment().format('YYYY-MM-DD HH:mm');
          console.log(`[${date}] ${watch.title} is aired!`);
        });
        scheduleList.push(job);
      });
      this.scheduleList = scheduleList;
      return true;
    }

    catch(err) {
      console.log(`Error occured: ${err}`);
      return false;
    }
  }

  clearSchedule() {
    this.scheduleList.forEach(schedule => {
      schedule.cancel();
    });
    this.scheduleList = [];
  }
}

export const scheduler = new Scheduler();