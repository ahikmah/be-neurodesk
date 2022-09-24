// const multer = require("multer");
// const aws = require("aws-sdk");
// const multerS3 = require("multer-s3");
// const spacesEndpoint = new aws.Endpoint("sgp1.digitaloceanspaces.com");
// const s3 = new aws.S3({
//   endpoint: spacesEndpoint,
//   credentials: {
//     accessKeyId: process.env.SPACES_ACCESS, // Access key pair. You can create access key pairs using the control panel or API.
//     secretAccessKey: process.env.SPACES_SECRET, // Secret access key defined through an environment variable.
//   },
// });
// const path = require("path");
// const response = require("./../utils/response");
// const fs = require("fs-extra");

// const imageFileFilter = (req, file, cb) => {
//   const allowedExt = /jpg|png|jpeg|/i;
//   const isAllowed = allowedExt.test(path.extname(file.originalname));
//   console.log(path.extname(file.originalname));
//   if (!isAllowed) return cb(new Error('Images only'));
//   cb(null, true);
// };

// const fileItemFilter = (req, file, cb) => {
//   const allowedExt = /jpg|png|jpeg|mp4|mp3|pdf/i;
//   const isAllowed = allowedExt.test(path.extname(file.originalname));
//   console.log(path.extname(file.originalname));
//   if (!isAllowed) return cb(new Error('Images only'));
//   cb(null, true);
// };

// const bytes = 1000;

// const power = (byte, n) => {
//   if (n) return byte * power(byte, n - 1);
//   return 1;
// };

// const uploadAvatar = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'privdir',
//     acl: 'public-read',
//     credentials: {
//       accessKeyId: process.env.SPACES_ACCESS, // Access key pair. You can create access key pairs using the control panel or API.
//       secretAccessKey: process.env.SPACES_SECRET, // Secret access key defined through an environment variable.
//     },
//     key: function (req, file, cb) {
//       cb(null, `digilib/avatar/avatar-${req.token.id_user}-${Date.now()}${path.extname(file.originalname)}`);
//     },
//   }),
//   limits: {
//     fileSize: 5 * power(bytes, 2),
//   },
//   fileFilter: imageFileFilter,
// });

// const uploadItemAttachment = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'privdir',
//     acl: 'public-read',
//     credentials: {
//       accessKeyId: process.env.SPACES_ACCESS, // Access key pair. You can create access key pairs using the control panel or API.
//       secretAccessKey: process.env.SPACES_SECRET, // Secret access key defined through an environment variable.
//     },
//     key: function (req, file, cb) {
//       cb(null, `digilib/master-item/${req.token.id_user}/${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//     },
//   }),
//   limits: {
//     fileSize: 5 * power(bytes, 2),
//   },
//   fileFilter: fileItemFilter,
// });

// const excelUserStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (!fs.existsSync('./privateS/file/user_data')) {
//       fs.mkdirSync('./privateS/file/user_data', { recursive: true });
//     }
//     cb(null, './privateS/file/user_data');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `userdata-${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// const fileFilterExcel = (req, file, cb) => {
//   const allowedExt = /|xlsx|xls/i;
//   const isAllowed = allowedExt.test(path.extname(file.originalname));
//   console.log(path.extname(file.originalname));
//   if (!isAllowed) return cb(new Error('File not allowed'));
//   cb(null, true);
// };

// const uploadUserExcel = multer({
//   storage: excelUserStorage,
//   limits: {
//     fileSize: 5 * power(bytes, 2),
//   },
//   fileFilter: fileFilterExcel,
// });

// const errorMulterHandler = (uploadFunction) => {
//   return (req, res, next) => {
//     uploadFunction(req, res, function (err) {
//       if (err) {
//         console.log(err);
//         return response(res, 500, err);
//       }
//       next();
//     });
//   };
// };

// module.exports = {
//   errorMulterHandler,
//   uploadAvatar,
//   uploadItemAttachment,
//   uploadUserExcel,
//   s3handler:s3
// };
