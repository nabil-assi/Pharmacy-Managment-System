function authMiddleware(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.message = {
        type: "error",
        text: "Access denied: please log in again!",
      };
      return res.redirect("/login");
    }
    if (req.session.user.is_active == 0) {
      req.session.message = {
        type: "error",
        text: "This user Inactive!",
      };
      return res.redirect("/login");
    }
    if (role && req.session.user.role !== role) {
      req.session.message = {
        type: "warning",
        text: "You do not have permission!",
      };

      return res.redirect("/dashboard");
      //   console.log(
      //     `Access denied: User role "${req.session.user.role}" cannot access this page`
      //   );
      //   return res.status(403).send("Forbidden: You do not have permission");
    }

    next();
  };
}
module.exports = { authMiddleware };
