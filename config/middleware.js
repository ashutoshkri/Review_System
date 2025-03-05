module.exports.setFlash = function (req, res, next) {
  res.locals.flash = {
    success: req.flash("success")[0] || "",
    error: req.flash("error")[0] || "",
  };
  next();
};
