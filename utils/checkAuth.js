import jwt from 'jsonwebtoken';
//функция определяет, можно ли передавать информацию, проверив токен
export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  console.log(token);

  if (token) {
    res.send(token);
  } else {
    res.status(403).json({
      message: 'Доступа нет',
    });
  }

  //это middleware. next делает возможным переход к следующей функции
  next();
};
