/**
 * Application tracker routes — maps /api/tracker/* to tracker.controller.
 * All endpoints require auth; data is scoped to req.userId in the controller.
 */

const router = require("express").Router();
const trackerController = require("../controllers/tracker.controller");
const auth = require("../middleware/auth.middleware");

router.get("/", auth, trackerController.getSavedJobs);
router.post("/", auth, trackerController.saveJob);
router.patch("/:id", auth, trackerController.updateStatus);
router.delete("/:id", auth, trackerController.removeJob);

module.exports = router;


