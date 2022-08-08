import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { registerValidation } from './validations/auth.js';

import UserModel from './models/User.js';
import checkAuth from './utils/checkAuth.js';

mongoose
  .connect(
    'mongodb+srv://admin:9lEjqiXNwICdjFCt@cluster0.bps3ayw.mongodb.net/blog?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('db ok');
  })
  .catch((error) => {
    console.log('db error', error);
  })
  .finally(() => {
    console.log('db test');
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

app.post('/auth/login', async (req, res) => {
  // console.log(req.body);
  // //при создании токена в метод сайн передаем данные, которые хотим зашифровать
  // const token = jwt.sign(
  //   {
  //     email: req.body.email,
  //     password: req.body.password,
  //   },
  //   'secret123' // вторым параметром указываем ключ для шифрования, рандомное значение может быть
  // );
  // //возвращаем все, что хотим
  // res.json({
  //   success: true,
  //   token,
  // });

  //при авторизации надо проверить, есть ли пользователь в базе данных
  try {
    const user = await UserModel.findOne({
      email: req.body.email,
    });
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не обнаружен',
      });
    }

    //проверяем сходится ли пароль
    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(404).json({
        message: 'Данные не совпадают',
      });
    }

    //если все ок
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Ошибка при авторизации',
    });
  }
});

app.post('/auth/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    // пароль шифруется на бэке, а не фронте
    const password = req.body.password;
    //соль - это алгоритм шифрования пароля
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    //создаем документ пользователя с помощью mongoDB
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarURL: req.body.avatarURL,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id, // _id - это ключ из монгодб
      },
      'secret123',
      {
        expiresIn: '30d', //сколько времени будет валиден токен
      }
    );

    //в юзер есть много полей, которые не надо возвращать на клиент
    // я не хочу возвращать passwordHash
    const { passwordHash, ...userData } = user._doc;

    //при создании роутов ответ сервера должно быть всегда один
    res.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Ошибка при регистрации',
    });
  }
});

app.get('/auth/me', checkAuth, (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: 'Информация не найдена',
    });
  }
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
