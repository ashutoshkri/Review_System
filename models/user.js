const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
      required: true,
    },
    assignedReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reviewsFromOthers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ✅ Passport-Local Mongoose plugin use karo (Ye password ko internally handle karega)
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", UserSchema);
