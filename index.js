import express from 'express';
import jwt from 'jsonwebtoken';

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

//запуск вебсервера
//объясняем, на какой порт прикрепить наше приложение (любой)
// теперь мы можем открыть наш сайт в браузере http://localhost:4444/
app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('server ok');
});
