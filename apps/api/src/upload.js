const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

function makeUploader(uploadDir) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      const name = crypto.randomBytes(12).toString("hex") + ext;
      cb(null, name);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

module.exports = { makeUploader };
