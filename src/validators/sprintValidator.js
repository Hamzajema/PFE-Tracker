const Joi = require('joi');

// Schéma pour créer un sprint
const createSprintSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'string.empty': 'Le titre est obligatoire',
    'any.required': 'Le titre est obligatoire',
  }),
  description: Joi.string().optional(),
  projectId: Joi.string().required().messages({
    'string.empty': 'Le projet est obligatoire',
    'any.required': 'Le projet est obligatoire',
  }),
  startDate: Joi.date().required().messages({
    'date.base': 'La date de début est invalide',
    'any.required': 'La date de début est obligatoire',
  }),
  endDate: Joi.date().required().messages({
    'date.base': 'La date de fin est invalide',
    'any.required': 'La date de fin est obligatoire',
  }),
  goals: Joi.array().items(Joi.string().messages({
    'string.base': 'Chaque objectif doit être une chaîne de caractères'
  })).optional().messages({
    'array.base': 'Les objectifs doivent être un tableau'
  }),
  status: Joi.string().valid('planned', 'active', 'completed').optional().messages({
    'any.only': 'Le statut doit être planned, active ou completed',
    'string.base': 'Le statut doit être une chaîne de caractères'
  }),
});

// Schéma pour mettre à jour un sprint
const updateSprintSchema = Joi.object({
  title: Joi.string().trim().optional().messages({
    'string.empty': 'Le titre ne peut pas être vide',
  }),
  description: Joi.string().optional(),
  startDate: Joi.date().optional().messages({
    'date.base': 'La date de début est invalide',
  }),
  endDate: Joi.date().optional().messages({
    'date.base': 'La date de fin est invalide',
  }),
  goals: Joi.array().items(Joi.string().messages({
    'string.base': 'Chaque objectif doit être une chaîne de caractères'
  })).optional().messages({
    'array.base': 'Les objectifs doivent être un tableau'
  }),
  status: Joi.string().valid('planned', 'active', 'completed').optional().messages({
    'any.only': 'Le statut doit être planned, active ou completed',
    'string.base': 'Le statut doit être une chaîne de caractères'
  }),
});

// Middleware de validation
const validateSprint = (schema) => (req, res, next) => {
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
  createSprintSchema,
  updateSprintSchema,
  validateSprint,
};
