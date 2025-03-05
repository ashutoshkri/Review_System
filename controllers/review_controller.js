const User = require("../models/user");
const Review = require("../models/review");

// Assign a review
module.exports.assignReview = async (req, res) => {
  const { recipient_email } = req.body;
  try {
    if (req.isAuthenticated()) {
      const reviewer = await User.findById(req.params.id);
      const recipient = await User.findOne({ email: recipient_email });

      // Check if review already assigned
      const alreadyAssigned = reviewer.assignedReviews.some(
        (userId) => userId.toString() === recipient.id.toString()
      );

      // If found, prevent from assigning duplicate review
      if (alreadyAssigned) {
        req.flash("error", `Review already assigned!`);
        return res.redirect(req.get("Referer") || "/");
      }

      // Update reviewer's assignedReviews field by putting reference of recipient
      await reviewer.updateOne({
        $push: { assignedReviews: recipient._id },
      });

      req.flash("success", `Review assigned successfully!`);
      return res.redirect(req.get("Referer") || "/");
    } else {
      req.flash("error", `Couldn't assign the review`);
      return res.redirect(req.get("Referer") || "/");
    }
  } catch (err) {
    console.log("error: ", err);
    return res.redirect(req.get("Referer") || "/");
  }
};

// Submit review
module.exports.submitReview = async (req, res) => {
  const { recipient_email, feedback } = req.body;
  try {
    const recipient = await User.findOne({ email: recipient_email });
    const reviewer = await User.findById(req.params.id);

    // Create a new review
    const review = await Review.create({
      review: feedback,
      reviewer,
      recipient,
    });

    // Remove all extra spaces from the review
    const reviewString = review.review.trim();

    // Prevent from submitting empty feedback
    if (reviewString === "") {
      req.flash("error", `Feedback section can't be empty!`);
      return res.redirect(req.get("Referer") || "/");
    }

    // Put reference of newly created review to recipient's schema
    await recipient.updateOne({
      $push: { reviewsFromOthers: review._id },
    });

    // Remove reference of the recipient from the reviewer's assignedReviews field
    await reviewer.updateOne({
      $pull: { assignedReviews: recipient._id },
    });

    req.flash("success", `Review submitted successfully!`);
    return res.redirect(req.get("Referer") || "/");
  } catch (err) {
    console.log("error", err);
    return res.redirect(req.get("Referer") || "/");
  }
};

// Update review
module.exports.updateReview = async (req, res) => {
  try {
    const { feedback } = req.body;
    const reviewToBeUpdated = await Review.findById(req.params.id);

    // If review not found
    if (!reviewToBeUpdated) {
      req.flash("error", "Review does not exist!");
      return res.redirect(req.get("Referer") || "/");
    }

    reviewToBeUpdated.review = feedback; // Assigning the feedback string coming from form body to review
    await reviewToBeUpdated.save(); // Saving the review

    req.flash("success", "Review updated!");
    return res.redirect(req.get("Referer") || "/");
  } catch (err) {
    console.log(err);
    return res.redirect(req.get("Referer") || "/");
  }
};
