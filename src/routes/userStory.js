// routes/userStory.js
const express = require("express");
const {
  createUserStory,
  getOne,
  getAllUserStories,
  updateUserStory,
  deleteUserStory,
} = require("../controllers/user-storyController");
const { protect } = require("../middleware/auth");
const { studentOnly, allRoles } = require("../middleware/roles");

const router = express.Router();

router.use(protect);

router.post("/user-stories", studentOnly, createUserStory);
router.get("/user-stories/sprint/:sprintId", allRoles, getAllUserStories);
router.get("/user-stories/:id", allRoles, getOne);
router.put("/user-stories/:id", studentOnly, updateUserStory);
router.delete("/user-stories/:id", allRoles, deleteUserStory);

module.exports = router;
