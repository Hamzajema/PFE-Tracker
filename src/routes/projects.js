const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  studentOnly,
  allRoles,
  checkProjectAccess,
} = require("../middleware/roles");
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
} = require("../controllers/projectController");
const {
  createProjectSchema,
  updateProjectSchema,
  validateProject,
} = require("../validators/projectValidator");

router.use(protect);

router
  .route("/")
  .post(studentOnly, validateProject(createProjectSchema), createProject)
  .get(allRoles, getProjects);

router
  .route("/:id")
  .get(checkProjectAccess, getProject)
  .put(
    studentOnly,
    checkProjectAccess,
    validateProject(updateProjectSchema),
    updateProject
  );

module.exports = router;
