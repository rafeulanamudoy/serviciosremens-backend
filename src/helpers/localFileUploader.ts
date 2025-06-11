import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

// Create multer instance
const upload = multer({ storage });

// Define field-based uploads
const passengerDocuments = upload.fields([
  { name: "IDCardBack", maxCount: 1 },
  { name: "IDCardFont", maxCount: 1 },
]);

const driverDocuments = upload.fields([
  { name: "IDCardBack", maxCount: 1 },
  { name: "IDCardFont", maxCount: 1 },
  { name: "drivingLicense", maxCount: 1 },
  { name: "vehicleInsurance", maxCount: 1 },
  { name: "tvm", maxCount: 1 },
]);

// Upload single files
const avatar = upload.single("avatar");
const chatImage = upload.single("chatImage");
const doc=upload.single("doc")

export const localFileUploader = {
  avatar,
  chatImage,
  passengerDocuments,
  driverDocuments,
  doc
};
