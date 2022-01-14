import express from 'express';
import { UserModel } from '../models/user.model';

const router = express.Router();

router.get('/get', async function(req, res, next) {
  try {
    const userTotal = await UserModel.count();
    const userList = await UserModel.find().select('-__v');

    return res.json({
      status: true,
      data: userList,
      message: 'success',
      total: userTotal
    });
  }

  catch(err) {
    return res.json({
      status: false,
      data: [],
      message: err,
      total: 0
    });
  }
});

router.post('/create', async function(req, res, next) {
  const name: string = req.body.name;
  const username: string = req.body.username;
  const password: string = req.body.password;
  
  if (!name || !username || !password) return res.status(400).json({
    message: 'Bad Request'
  });

  const userWithSameUsername = await UserModel.find({ username: username });
  if (userWithSameUsername.length) throw('Username already exists');

  try {
    const user = new UserModel({ name, username, password });
    const save = await user.save();
    return res.json({
      status: true,
      data: save,
      message: 'success'
    });
  }

  catch(err) {
    res.status(500).json({
      status: false,
      data: null,
      message: err,
    });
  }
});

router.post('/update/:id', async function(req, res, next) {
  const id: string = req.params.id;
  const name: string = req.body.name;
  const username: string = req.body.username;
  const password: string = req.body.password;

  try {
    const update = await UserModel.updateOne({ _id: id }, { name, username, password });
    return res.json({
      status: true,
      data: update,
      message: 'success'
    });
  }

  catch(err) {
    return res.json({
      status: false,
      data: null,
      messagae: err
    });
  }
});

router.delete('/delete/:id', async function(req, res, next) {
  const id = req.params.id;
  
  try {
    const del = await UserModel.deleteOne({ _id: id });
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

export const UserRouter = router;