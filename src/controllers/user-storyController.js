const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const UserStory = require("../models/UserStory");

const createUserStory = async (req, res) => {
  try {
    const {
      title,
      description,
      acceptanceCriteria,
      sprintId,
      priority,
      storyPoints,
    } = req.body;

    // Vérifier l'existance du sprint
    const sprint = await Sprint.findById(sprintId).populate("project");
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    // Vérifier que l'étudiant est propriétaire du projet
    if (sprint.project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: " only the student can create a user stories",
      });
    }

    const userStory = await UserStory.create({
      title,
      description,
      acceptanceCriteria,
      sprint: sprintId,
      project: sprint.project._id,
      priority,
      storyPoints,
    });

    await userStory.populate([
      { path: "sprint", select: "title sprintNumber" },
      { path: "project", select: "title" },
    ]);

    res.status(201).json({
      success: true,
      data: { userStory },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUserStories = async (req, res) => {
  try {
    const { sprintId, projectId, priority, status } = req.query;
    let filter = {};

    if (sprintId) filter.sprint = sprintId;
    if (projectId) filter.project = projectId;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    // Si pas de filtres spécifiques, filtrer par les projets accessibles
    if (!sprintId && !projectId) {
      let projectFilter = {};

      switch (req.user.role) {
        case "etudiant":
          projectFilter.student = req.user._id;
          break;
        case "encadrant_entreprise":
          projectFilter.encadrantEntreprise = req.user._id;
          break;
        case "encadrant_universitaire":
          projectFilter.encadrantUniversitaire = req.user._id;
          break;
      }

      const accessibleProjects = await Project.find(projectFilter).select(
        "_id"
      );
      filter.project = { $in: accessibleProjects.map((p) => p._id) };
    }

    const userStories = await UserStory.find(filter)
      .populate("sprint", "title sprintNumber")
      .populate("project", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: userStories.length,
      data: { userStories },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOne = async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id)
      .populate("sprint", "title sprintNumber startDate endDate")
      .populate("project", "title");

    if (!userStory) {
      return res.status(404).json({
        success: false,
        message: "User Story not found",
      });
    }

    // Récupérer les tâches associées
    const Task = require("../models/Task");
    const tasks = await Task.find({ userStory: userStory._id })
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        userStory,
        tasks,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateUserStory = async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id).populate(
      "project"
    );

    if (!userStory) {
      return res.status(404).json({
        success: false,
        message: "User Story not found",
      });
    }

    // Vérifier que l'étudiant est propriétaire du projet
    if (userStory.project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "only the student can update this user story",
      });
    }

    const updatedUserStory = await UserStory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: "sprint", select: "title sprintNumber" },
      { path: "project", select: "title" },
    ]);

    res.status(200).json({
      success: true,
      data: { userStory: updatedUserStory },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteUserStory = async (req, res) => {
  try {
    const userStory = await UserStory.findById(req.params.id).populate(
      "project"
    );

    if (!userStory) {
      return res.status(404).json({
        success: false,
        message: "User Story not found",
      });
    }

    // Vérifier que l'étudiant est propriétaire du projet
    if (userStory.project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "only the student can delete this user story",
      });
    }

    // Vérifier qu'il n'y a pas de tâches dans cette user story
    const Task = require("../models/Task");
    const tasksCount = await Task.countDocuments({ userStory: req.params.id });

    if (tasksCount > 0) {
      return res.status(400).json({
        success: false,
        message: "you cannot delete a user story that contains tasks",
      });
    }

    await UserStory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User Story deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUserStory,
  getAllUserStories,
  getOne,
  updateUserStory,
  deleteUserStory,
};
