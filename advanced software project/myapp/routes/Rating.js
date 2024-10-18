const router = require("express").Router();
const RatingController = require("../controllers/RatingController");

// POST route for creating a review
router.post("/Review", RatingController.createRating);
router.delete("/deletereview", RatingController.deleteRating);
module.exports = router;
