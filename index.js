import express from 'express';

import mongoose from 'mongoose';
import fs from 'fs';
import multer from 'multer';
import cors from 'cors';

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

import {
  UserController,
  PostController,
  ProjectController,
} from './controllers/index.js';

mongoose
  .connect(
    'mongodb+srv://admin:9lEjqiXNwICdjFCt@cluster0.bps3ayw.mongodb.net/blog?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('db ok');
  })
  .catch((error) => {
    console.log('db error', error);
  });

//записываем всю логику экспресса в app
const app = express();

//хранилище для загрузки изображений
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors()); //node по умолчанию блокирует другие домены
// объясняем экспрессу, что по пути аплоадс надо возвращать статические картинки из папки аплоадс
app.use('/uploads', express.static('uploads'));

//по умолчанию express  не умеет читать жсон, так включается эта опция
app.use(express.json());

//работа с роутами (описывается логика)
//при обращении по пути "/" будет выполняться следующая команда
// req- все, что пришло с фронтенда
// res- то, что передам клиенту
app.get('/', (req, res) => {
  res.send('Hello, world');
});

app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
);

app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);

app.get('/auth/me', checkAuth, UserController.getMe);

//посты
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

app.get('/tags', PostController.getLastTags);

app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getPopularPosts);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

//projects

app.get('/projects', ProjectController.getAllProjects);
app.get('/projects/:id', ProjectController.getOneProject);

//загрузка файлов
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

//запуск вебсервера
//объясняем, на какой порт прикрепить наше приложение (любой)
// теперь мы можем открыть наш сайт в браузере http://localhost:4444/
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('server ok');
});
