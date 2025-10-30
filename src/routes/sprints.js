const express = require("express");
const { protect } = require("../middleware/auth");
const { studentOnly, allRoles } = require("../middleware/roles");
const {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
} = require("../controllers/sprintController");

const {
  createSprintSchema,
  updateSprintSchema,
  validateSprint,
} = require("../validators/sprintValidator");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(studentOnly, validateSprint(createSprintSchema), createSprint)
  .get(allRoles, getSprints);

router
  .route("/:id")
  .get(allRoles, getSprint)
  .put(studentOnly, validateSprint(updateSprintSchema), updateSprint);

module.exports = router;
