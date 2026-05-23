// Pattern 2: Chain of Responsibility - validates request body before reaching the controller

const validateExpense = (req, res, next) => {
  const { amount, category, date } = req.body;
  if (!amount || !category || !date)
    return res.status(400).json({ message: 'amount, category, and date are required' });
  if (isNaN(Number(amount)) || Number(amount) <= 0)
    return res.status(400).json({ message: 'amount must be a positive number' });
  next();
};

const validateIncome = (req, res, next) => {
  const { amount, source, date } = req.body;
  if (!amount || !source || !date)
    return res.status(400).json({ message: 'amount, source, and date are required' });
  if (isNaN(Number(amount)) || Number(amount) <= 0)
    return res.status(400).json({ message: 'amount must be a positive number' });
  next();
};

module.exports = { validateExpense, validateIncome };
