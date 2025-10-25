// config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuration pour les rapports
const reportStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/reports');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `report_${cleanBaseName}_${uniqueSuffix}${extension}`);
  }
});

// Filtre pour les types de fichiers acceptés
const reportFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Extensions acceptées: ${allowedExtensions.join(', ')}`), false);
  }
};

const reportUpload = multer({
  storage: reportStorage,
  fileFilter: reportFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

module.exports = {
  reportUpload
};