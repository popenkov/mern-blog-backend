import jwt from 'jsonwebtoken';
//функция определяет, можно ли передавать информацию, проверив токен
export default (req, res, next) => {
  const token = (req.headers.authorisation || '').replace(/Bearer\s?/, '');

  res.send(token);

  //это middleware. next делает возможным переход к следующей функции
  next();
};
