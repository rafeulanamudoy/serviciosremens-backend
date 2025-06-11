import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

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

// Upload single images
const avatar = upload.single("avatar");
const chatIamge = upload.single("chatImage");
export const fileUploader = {
  avatar,
  chatIamge,
  passengerDocuments,
  driverDocuments,
};
