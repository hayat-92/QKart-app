const express = require("express");
const httpStatus = require("http-status");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const logger = require("../../config/logger");

const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`
logger.info("faisaluserID")
router.get('/:userId',validate(userValidation.getUser), userController.getUser);

module.exports = router;
