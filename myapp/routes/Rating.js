const router = require("express").Router();
const checkPermissions = require('../middleware/checkPermissions');
const RatingController = require("../controllers/RatingController");

router.post("/Review", checkPermissions, RatingController.createRating);
router.delete("/deletereview",checkPermissions, RatingController.deleteRating);
router.delete("/admindeleteReview",checkPermissions, RatingController.admindeleteRating);
router.get("/allReviews", checkPermissions,RatingController.getAllRating);
router.put("/updatereview",checkPermissions, RatingController.updateReview);
router.get("/getRatingsByItemId",checkPermissions, RatingController.getRatingsByItemId);
module.exports = router;