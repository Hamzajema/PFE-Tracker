const Joi = require('joi');

const createProjectSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Le titre est obligatoire',
    'any.required': 'Le titre est obligatoire',
  }),
  description: Joi.string().required().messages({
    'string.empty': 'La description est obligatoire',
    'any.required': 'La description est obligatoire',
  }),
  encadrantEntreprise: Joi.string().required().messages({
    'string.empty': 'L’encadrant entreprise est obligatoire',
    'any.required': 'L’encadrant entreprise est obligatoire',
  }),
  encadrantUniversitaire: Joi.string().required().messages({
    'string.empty': 'L’encadrant universitaire est obligatoire',
    'any.required': 'L’encadrant universitaire est obligatoire',
  }),
  startDate: Joi.date().required().messages({
    'date.base': 'La date de début est invalide',
    'any.required': 'La date de début est obligatoire',
  }),
  endDate: Joi.date().required().messages({
    'date.base': 'La date de fin est invalide',
    'any.required': 'La date de fin est obligatoire',
  }),
  soutenanceDate: Joi.date().optional().messages({
    'date.base': 'La date de soutenance est invalide',
  }),
  status: Joi.string().valid('active', 'completed', 'suspended').optional().messages({
    'any.only': 'Le statut doit être active, completed ou suspended',
  }),
});

const updateProjectSchema = Joi.object({
  title: Joi.string().trim().optional().messages({
    'string.empty': 'Le titre ne peut pas être vide',
  }),
  description: Joi.string().optional().messages({
    'string.empty': 'La description ne peut pas être vide',
  }),
  encadrantEntreprise: Joi.string().optional(),
  encadrantUniversitaire: Joi.string().optional(),
  startDate: Joi.date().optional().messages({
    'date.base': 'La date de début est invalide',
  }),
  endDate: Joi.date().optional().messages({
    'date.base': 'La date de fin est invalide',
  }),
  soutenanceDate: Joi.date().optional().messages({
    'date.base': 'La date de soutenance est invalide',
  }),
  status: Joi.string().valid('active', 'completed', 'suspended').optional().messages({
    'any.only': 'Le statut doit être active, completed ou suspended',
  }),
});

const validateProject = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false }); 
  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation échouée',
      errors,
    });
  }
  next();
};

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  validateProject,
};
