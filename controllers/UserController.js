import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

import UserModel from '../models/User.js';
import User from '../models/User.js';

export const register = async (req, res) => {
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
};

export const login = async (req, res) => {
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
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: 'Информация не найдена',
    });
  }
};
