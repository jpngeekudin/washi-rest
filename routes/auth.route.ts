import express from 'express';
import moment from 'moment';
import { generateCode } from '../helpers/utils.helper';
import { UserModel } from '../models/user.model';
const router = express.Router();

router.post('/telegram', async function(req, res, next) {
  const username: string = req.body.username;

  try {
    const user = await UserModel.findOne({ username });
    const code = generateCode(6);
    const expire = moment().add(5, 'minute').valueOf();
    const update = await user?.update({ $set: { telegramAuth: { code, expire }}});
    const data = { code, expire };
    return res.json({
      status: true,
      data: data,
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

export const AuthRouter = router;