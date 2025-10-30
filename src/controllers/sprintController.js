const Sprint = require("../models/Sprint");
const Project = require("../models/Project");

const formatDateParis = (d) => (d ? d.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) : null);

const createSprint = async (req, res) => {
  try {
    const { title, description, projectId, startDate, endDate, goals } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Projet non trouvé" });
    }

    if (project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Seul l'étudiant propriétaire peut créer des sprints",
      });
    }

    const sprintCount = await Sprint.countDocuments({ project: projectId });
    const sprintNumber = sprintCount + 1;

    const sprint = await Sprint.create({
      title,
      description,
      project: projectId,
      sprintNumber,
      startDate,
      endDate,
      goals,
    });

    await sprint.populate("project", "title");

    const sprintData = {
      ...sprint.toObject(),
      startDate: formatDateParis(sprint.startDate),
      endDate: formatDateParis(sprint.endDate),
      createdAt: formatDateParis(sprint.createdAt),
      updatedAt: formatDateParis(sprint.updatedAt),
    };

    res.status(201).json({ success: true, data: { sprint: sprintData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSprints = async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) {
      filter.project = projectId;
    } else {
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
      const accessibleProjects = await Project.find(projectFilter).select("_id");
      filter.project = { $in: accessibleProjects.map((p) => p._id) };
    }

    const sprints = await Sprint.find(filter)
      .populate("project", "title")
      .sort({ project: 1, sprintNumber: 1 });

    const sprintsData = sprints.map((s) => ({
      ...s.toObject(),
      startDate: formatDateParis(s.startDate),
      endDate: formatDateParis(s.endDate),
      createdAt: formatDateParis(s.createdAt),
      updatedAt: formatDateParis(s.updatedAt),
    }));

    res.status(200).json({ success: true, count: sprints.length, data: { sprints: sprintsData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate("project", "title");

    if (!sprint) {
      return res.status(404).json({ success: false, message: "Sprint non trouvé" });
    }

    const sprintData = {
      ...sprint.toObject(),
      startDate: formatDateParis(sprint.startDate),
      endDate: formatDateParis(sprint.endDate),
      createdAt: formatDateParis(sprint.createdAt),
      updatedAt: formatDateParis(sprint.updatedAt),
    };

    res.status(200).json({ success: true, data: { sprint: sprintData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate("project");

    if (!sprint) {
      return res.status(404).json({ success: false, message: "Sprint non trouvé" });
    }

    if (sprint.project.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Seul l'étudiant propriétaire peut modifier ce sprint",
      });
    }

    const updatedSprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("project", "title");

    const sprintData = {
      ...updatedSprint.toObject(),
      startDate: formatDateParis(updatedSprint.startDate),
      endDate: formatDateParis(updatedSprint.endDate),
      createdAt: formatDateParis(updatedSprint.createdAt),
      updatedAt: formatDateParis(updatedSprint.updatedAt),
    };

    res.status(200).json({ success: true, data: { sprint: sprintData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createSprint, getSprints, getSprint, updateSprint };
