// Pattern 2: Chain of Responsibility - logs every incoming request
const loggerMiddleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  next();
};

module.exports = { loggerMiddleware };
