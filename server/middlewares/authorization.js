function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied!' });
  }
  next();
}

function isCustomer(req, res, next) {
  if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Permission denied!' });
  }
  next();
}

module.exports = {
  isAdmin,
  isCustomer
};
