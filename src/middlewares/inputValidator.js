const { body, check, validationResult } = require('express-validator');
const userModel = require('./../models/user');

// =======================================|| AUTH VALIDATOR ||===========================================================//
const registrationValidator = () => {
  return [
    // email must be an email
    body('email').isEmail().withMessage('Email is not valid'),
    check('email').custom(async (value, { req }) => {
      req.query.email = value;
      return userModel.getUserInfo(req).then((result) => {
        if (result.data?.id) {
          return Promise.reject('Email already in use');
        }
      });
    }),

    // password must be at least 5 chars long
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/^(?=.*\d)(?=.*[a-zA-Z0-9]).(?=.*[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/)
      .withMessage('Password must contain special character'),

    // full_name must be at least 3 chars long
    body('full_name').isLength({ min: 3 }).withMessage('Full name must be at least 3 chars long'),
  ];
};

const loginValidator = () => {
  return [
    // email must be an email
    body('email').isEmail().withMessage('Email is not valid'),

    check('email').custom(async (value, { req }) => {
      req.query.email = value;
      return userModel.getUserInfo(req).then((result) => {
        if (result.data?.id && !['01'].includes(result.data?.status)) {
          return Promise.reject('Please activate your account');
        } else if (!result.data?.id) {
          return Promise.reject('Email/password is wrong');
        }
      });
    }),

    // password must be at least 5 chars long
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/^(?=.*\d)(?=.*[a-zA-Z0-9]).(?=.*[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/)
      .withMessage('Password must contain special character'),
  ];
};

const accountActivationValidator = () => {
  return [
    body('id').notEmpty().withMessage('Invalid User ID'),
    check('id').custom(async (value, { req }) => {
      req.query.id = value;
      return userModel.getUserInfo(req).then((result) => {
        if (!result.data?.id) {
          return Promise.reject('Invalid User ID');
        }
      });
    }),

    body('otp').isLength({ min: 100 }).isLength({ max: 100 }).withMessage('Invalid OTP code'),
    check('otp').custom(async (value, { req }) => {
      req.query.otp = value;
      return userModel.getUserInfo(req).then((result) => {
        if (!result.data?.id) {
          return Promise.reject('Invalid OTP code');
        } else {
          req.query.role = result.data.role;
        }
      });
    }),
  ];
};

const changePasswordValidator = () => {
  return [
    // password must be at least 5 chars long
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/^(?=.*\d)(?=.*[a-zA-Z0-9]).(?=.*[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/)
      .withMessage('Password must contain special character'),
  ];
};

const forgotPasswordValidator = () => {
  return [
    body('email').isEmail().withMessage('Email is not valid'),
    check('email').custom(async (value, { req }) => {
      req.query.email = value;
      return userModel.getUserInfo(req).then((result) => {
        if (!result.data?.id) {
          return Promise.reject('This email is not registered');
        } else {
          req.query.full_name = result.data.full_name;
          req.query.id = result.data.id;
        }
      });
    }),
  ];
};
const setPasswordValidator = () => {
  return [
    body('id').notEmpty().withMessage('Invalid User ID'),
    check('id').custom(async (value, { req }) => {
      req.query.id = value;
      return userModel.getUserInfo(req).then((result) => {
        if (!result.data?.id) {
          return Promise.reject('Invalid User ID');
        }
      });
    }),

    body('otp').isLength({ min: 100 }).isLength({ max: 100 }).withMessage('Invalid OTP code'),
    check('otp').custom(async (value, { req }) => {
      req.query.otp = value;
      return userModel.getUserInfo(req).then((result) => {
        if (!result.data?.id) {
          return Promise.reject('Invalid OTP code');
        } else {
          req.query.role = result.data.role;
        }
      });
    }),
    // password must be at least 5 chars long
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/^(?=.*\d)(?=.*[a-zA-Z0-9]).(?=.*[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/)
      .withMessage('Password must contain special character'),
  ];
};

// // Middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  let id;
  // errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  errors.array().map((err) => {
    typeof err.msg === 'object' ? extractedErrors.push(err.msg.msg) : extractedErrors.push('&bull; ' + err.msg);
    id = typeof err.msg === 'object' && err.msg.id;
  });

  return res.status(req.status_error || 422).json({
    code: req.status_error || 422,
    success: false,
    message: extractedErrors.join('<br>'),
    id: id,
  });
};
module.exports = {
  registrationValidator,
  loginValidator,
  accountActivationValidator,
  forgotPasswordValidator,
  setPasswordValidator,
  changePasswordValidator,
  validate,
};
