const Project = require("../models/Project");
const User = require("../models/User");

const formatDateParis = (d) =>
  d ? d.toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) : null;

const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      encadrantEntreprise,
      encadrantUniversitaire,
      startDate,
      endDate,
      soutenanceDate,
    } = req.body;

    const encEntreprise = await User.findOne({
      _id: encadrantEntreprise,
      role: "encadrant_entreprise",
      isActive: true,
    });

    const encUniversitaire = await User.findOne({
      _id: encadrantUniversitaire,
      role: "encadrant_universitaire",
      isActive: true,
    });

    if (!encEntreprise)
      return res.status(400).json({ success: false, message: "Encadrant entreprise invalide" });

    if (!encUniversitaire)
      return res.status(400).json({ success: false, message: "Encadrant universitaire invalide" });

    const project = await Project.create({
      title,
      description,
      student: req.user._id,
      encadrantEntreprise,
      encadrantUniversitaire,
      startDate,
      endDate,
      soutenanceDate,
    });

    await project.populate([
      { path: "student", select: "firstName lastName email" },
      { path: "encadrantEntreprise", select: "firstName lastName email" },
      { path: "encadrantUniversitaire", select: "firstName lastName email" },
    ]);

    const projectData = {
      ...project.toObject(),
      startDate: formatDateParis(project.startDate),
      endDate: formatDateParis(project.endDate),
      soutenanceDate: formatDateParis(project.soutenanceDate),
      createdAt: formatDateParis(project.createdAt),
      updatedAt: formatDateParis(project.updatedAt),
    };

    res.status(201).json({ success: true, data: { project: projectData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === "etudiant") filter.student = req.user._id;
    if (req.user.role === "encadrant_entreprise") filter.encadrantEntreprise = req.user._id;
    if (req.user.role === "encadrant_universitaire") filter.encadrantUniversitaire = req.user._id;

    const projects = await Project.find(filter)
      .populate("student", "firstName lastName email")
      .populate("encadrantEntreprise", "firstName lastName email")
      .populate("encadrantUniversitaire", "firstName lastName email")
      .sort({ createdAt: -1 });

    const projectsData = projects.map((p) => ({
      ...p.toObject(),
      startDate: formatDateParis(p.startDate),
      endDate: formatDateParis(p.endDate),
      soutenanceDate: formatDateParis(p.soutenanceDate),
      createdAt: formatDateParis(p.createdAt),
      updatedAt: formatDateParis(p.updatedAt),
    }));

    res.status(200).json({ success: true, count: projects.length, data: { projects: projectsData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("student", "firstName lastName email")
      .populate("encadrantEntreprise", "firstName lastName email")
      .populate("encadrantUniversitaire", "firstName lastName email");

    if (!project)
      return res.status(404).json({ success: false, message: "Projet non trouvé" });

    const projectData = {
      ...project.toObject(),
      startDate: formatDateParis(project.startDate),
      endDate: formatDateParis(project.endDate),
      soutenanceDate: formatDateParis(project.soutenanceDate),
      createdAt: formatDateParis(project.createdAt),
      updatedAt: formatDateParis(project.updatedAt),
    };

    res.status(200).json({ success: true, data: { project: projectData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "student", select: "firstName lastName email" },
      { path: "encadrantEntreprise", select: "firstName lastName email" },
      { path: "encadrantUniversitaire", select: "firstName lastName email" },
    ]);

    if (!project)
      return res.status(404).json({ success: false, message: "Projet non trouvé" });

    const projectData = {
      ...project.toObject(),
      startDate: formatDateParis(project.startDate),
      endDate: formatDateParis(project.endDate),
      soutenanceDate: formatDateParis(project.soutenanceDate),
      createdAt: formatDateParis(project.createdAt),
      updatedAt: formatDateParis(project.updatedAt),
    };

    res.status(200).json({ success: true, data: { project: projectData } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createProject, getProjects, getProject, updateProject };
