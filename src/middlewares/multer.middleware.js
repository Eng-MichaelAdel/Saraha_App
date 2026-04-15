import multer from "multer";
import fs, { existsSync } from "node:fs";
import { filesExtentions } from "../common/enums/user.enums.js";
import { resolve } from "node:path";

export const multerLocal = (type) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = `../uploads/${type}`;
      if (!existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, fullPath);
    },

    filename: function (req, file, cb) {
      const sullfex = Date.now();
      cb(null, sullfex + "." + file.fieldname);
    },
  });

  const fileFilter = function (req, file, cb) {
    const [fileType, fileExtentions] = file.mimetype.split("/");
    const allowedExtentions = filesExtentions[fileType];
    if (allowedExtentions.includes(fileExtentions)) {
      return cb(null, true);
    }
    return cb(new Error("File type not allowed"), false);
  };

  const limits = {
    files: 1,
  };

  return multer({ fileFilter, storage, limits });
};
