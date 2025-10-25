
// config/auth.js
const jwt = require('jsonwebtoken');

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRE || '30d',
  algorithm: 'HS256'
};

const signToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: jwtConfig.algorithm
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, jwtConfig.secret, {
    algorithms: [jwtConfig.algorithm]
  });
};

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const accessToken = signToken(payload);
  
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: jwtConfig.expiresIn
  };
};

module.exports = {
  jwtConfig,
  signToken,
  verifyToken,
  generateTokens
};

