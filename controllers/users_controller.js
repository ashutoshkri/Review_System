const Review = require("../models/review");
const User = require("../models/user");

// Render the sign-in page
module.exports.signIn = (req, res) => {
  if (req.isAuthenticated()) {
    return req.user.role === "admin"
      ? res.redirect("/admin-dashboard")
      : res.redirect(`/employee-dashboard/${req.user.id}`);
  }

  return res.render("user_sign_in", {
    title: "Review System | Sign In",
    error: req.flash("error"),
  });
};

// Render the sign-up page
module.exports.signUp = (req, res) => {
  if (req.isAuthenticated()) {
    return req.user.role === "admin"
      ? res.redirect("/admin-dashboard")
      : res.redirect(`/employee-dashboard/${req.user.id}`);
  }

  return res.render("user_sign_up", {
    title: "Review System | Sign Up",
  });
};

// Render add employee page
module.exports.addEmployee = (req, res) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return res.render("add_employee", { title: "Add Employee" });
  }
  return res.redirect("/");
};

// Render edit employee page
module.exports.editEmployee = async (req, res) => {
  try {
    if (req.isAuthenticated() && req.user.role === "admin") {
      const employee = await User.findById(req.params.id).populate({
        path: "reviewsFromOthers",
        populate: { path: "reviewer", model: "User" },
      });

      return res.render("edit_employee", {
        title: "Edit Employee",
        employee,
        reviewsFromOthers: employee.reviewsFromOthers,
      });
    }
    return res.redirect("/");
  } catch (err) {
    console.error("Error fetching employee:", err);
    return res.redirect(req.get("Referrer") || "/");
  }
};

// Register a new user
module.exports.create = async (req, res) => {
  try {
    const { username, email, password, confirm_password, role } = req.body;

    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect(req.get("Referrer") || "/");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.flash("error", "User already registered!");
      return res.redirect(req.get("Referrer") || "/");
    }

    const user = new User({ email, username, role });
    await User.register(user, password);

    req.flash("success", "Account created successfully!");
    return res.redirect("/");
  } catch (err) {
    console.error("Signup Error:", err);
    req.flash("error", "Couldn't sign up");
    return res.redirect(req.get("Referrer") || "/");
  }
};

// Register an employee
module.exports.createEmployee = async (req, res) => {
  try {
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect(req.get("Referrer") || "/");
    }

    const existingEmployee = await User.findOne({ email });

    if (existingEmployee) {
      req.flash("error", "Employee already registered!");
      return res.redirect(req.get("Referrer") || "/");
    }

    const employee = new User({ email, username, role: "employee" });
    await User.register(employee, password);
    req.flash("success", "Employee added successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.error("Error adding employee:", err);
    req.flash("error", "Couldn't add employee");
    return res.redirect(req.get("Referrer") || "/");
  }
};

// Update employee details
module.exports.updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      req.flash("error", "Employee does not exist!");
      return res.redirect(req.get("Referrer") || "/");
    }

    employee.username = req.body.username;
    employee.role = req.body.role;
    await employee.save();

    req.flash("success", "Employee details updated!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.error("Error updating employee:", err);
    return res.redirect(req.get("Referrer") || "/");
  }
};

// Delete an employee and associated reviews
module.exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.deleteMany({ $or: [{ recipient: id }, { reviewer: id }] });
    await User.findByIdAndDelete(id);

    req.flash("success", "User and associated reviews deleted!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.redirect(req.get("Referrer") || "/");
  }
};

// Sign in and create a session
module.exports.createSession = (req, res) => {
  req.flash("success", "Logged in successfully");
  return res.redirect(
    req.user.role === "admin"
      ? "/admin-dashboard"
      : `/employee-dashboard/${req.user.id}`
  );
};

// Log out the user
module.exports.destroySession = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    return res.redirect("/");
  });
};
