const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");

/**
 * Generate jwt token
 * - Payload must contain fields
 * --- "sub": `userId` parameter
 * --- "type": `type` parameter
 *
 * - Token expiration must be set to the value of `expires` parameter
 *
 * @param {ObjectId} userId - Mongo user id
 * @param {Number} expires - Token expiration time in seconds since unix epoch
 * @param {string} type - Access token type eg: Access, Refresh
 * @param {string} [secret] - Secret key to sign the token, defaults to config.jwt.secret
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  let payload= {sub:userId, type:type, exp:expires};
  let token=jwt.sign(payload, secret); // here no need to pass expiresIn just do it like this: return jwt.sign(payload, secret);
  return token;

};

/**
 * Generate auth token
 * - Generate jwt token
 * - Token type should be "ACCESS"
 * - Return token and expiry date in required format
 *
 * @param {User} user
 * @returns {Promise<Object>}
 *
 * Example response:
 * "access": {
 *          "token": "eyJhbGciOiJIUzI1NiIs...",
 *          "expires": "2021-01-30T13:51:19.036Z"
 * }
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires= Math.floor(Date.now() / 1000) + config.jwt.accessExpirationMinutes * 60;
  let accessToken=generateToken(user._id, accessTokenExpires, tokenTypes.ACCESS);

  dte=(config.jwt.accessExpirationMinutes)*60;
  let t = new Date(); // Epoch
  t.setSeconds(dte);
  return {
    access: {
      token: accessToken,
      expires: t,
    }
  }

};

module.exports = {
  generateToken,
  generateAuthTokens,
};
