import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';

mongoose
  .connect(
    'mongodb+srv://admin:9lEjqiXNwICdjFCt@cluster0.bps3ayw.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('db ok');
  })
  .catch((error) => {
    console.log('db error', error);
  });

//записываем всю логику экспресса в app
const app = express();

//по умолчанию express  не умеет читать жсон, так включается эта опция
app.use(express.json());

//работа с роутами (описывается логика)
//при обращении по пути "/" будет выполняться следующая команда
// req- все, что пришло с фронтенда
// res- то, что передам клиенту
app.get('/', (req, res) => {
  res.send('Hello, world');
});

app.post('/auth/login', (req, res) => {
  console.log(req.body);
  //при создании токена в метод сайн передаем данные, которые хотим зашифровать
  const token = jwt.sign(
    {
      email: req.body.email,
      password: req.body.password,
    },
    'secret123' // вторым параметром указываем ключ для шифрования, рандомное значение может быть
  );
  //возвращаем все, что хотим
  res.json({
    success: true,
    token,
  });
});

app.post('/auth/register', registerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array);
  }
  res.json({
    success: true,
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
