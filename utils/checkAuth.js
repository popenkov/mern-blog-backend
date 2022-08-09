import jwt from 'jsonwebtoken';
//функция определяет, можно ли передавать информацию, проверив токен
export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123');
      req.userId = decoded._id;
      next(); //это middleware. next делает возможным переход к следующей функции
    } catch (error) {
      return res.status(403).json({
        message: 'Доступа нет',
      });
    }
  } else {
    return res.status(403).json({
      message: 'Доступа нет',
    });
  }
};
