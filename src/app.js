const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const sprintRoutes = require("./routes/sprints");
const userStoryRoutes = require("./routes/userStories");
const taskRoutes = require("./routes/tasks");
const meetingRoutes = require("./routes/meetings");
const reportRoutes = require("./routes/reports");
const validationRoutes = require("./routes/validations");
const dashboardRoutes = require("./routes/dashboard");
const aiRoutes = require("./routes/ai");

const app = express();

connectDB();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/reports", express.static(path.join(__dirname, "../reports")));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PFE Tracker API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/user-stories", userStoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/validations", validationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api", (req, res) => {
  res.json({
    message: "PFE Tracker API",
    version: "1.0.0",
    documentation: {
      auth: "/api/auth - Authentification et gestion des utilisateurs",
      projects: "/api/projects - Gestion des projets",
      sprints: "/api/sprints - Gestion des sprints",
      userStories: "/api/user-stories - Gestion des user stories",
      tasks: "/api/tasks - Gestion des tâches",
      meetings: "/api/meetings - Gestion des réunions",
      reports: "/api/reports - Gestion des rapports",
      validations: "/api/validations - Système de validation",
      dashboard: "/api/dashboard - Tableaux de bord et statistiques",
      ai: "/api/ai - Fonctionnalités IA (détection blocages, analyse rapports, chatbot)",
    },
    features: [
      "Authentification JWT avec rôles",
      "Gestion complète des projets PFE",
      "Système de validation par les encadrants",
      "Génération de rapports HTML",
      "Détection automatique de blocages (IA)",
      "Analyse de rapports par NLP (IA)",
      "Assistant chatbot intelligent (IA)",
    ],
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`,
    availableEndpoints: {
      api: "/api",
      health: "/health",
      documentation: "https://docs.pfe-tracker.com",
    },
  });
});

app.use((err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.error(err);
  if (err.name === "CastError") {
    const message = "Ressource non trouvée";
    error = { message, statusCode: 404 };
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} existe déjà`;
    error = { message, statusCode: 400 };
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Token invalide";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expiré";
    error = { message, statusCode: 401 };
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "Fichier trop volumineux (max 10MB)";
    error = { message, statusCode: 400 };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Type de fichier non autorisé";
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Erreur serveur",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Erreur: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log(`Erreur: ${err.message}`);
  console.log("Arrêt du serveur suite à une exception non capturée");
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
  PFE Tracker API démarrée !
  Port: ${PORT}
  `);
});

module.exports = app;
