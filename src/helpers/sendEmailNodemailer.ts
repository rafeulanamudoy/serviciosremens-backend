// import axios from "axios";
// import config from "../config";

// const sendEmail = async (
//   to: string,
//   subject: string,
//   html: string,
//   text?: string
// ) => {
//   const payload = {
//     sender: {
//       name: "Nanwaa - Ride Hailing App",
//       email: "masukkabir.dev@gmail.com",
//     },
//     to: [
//       {
//         email: to,
//       },
//     ],
//     subject,
//     htmlContent: html,
//     textContent: text || "This is the plain text version of the email.",
//   };
//   await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
//     headers: {
//       "api-key": config.brevo.brevo_api_key,
//       "Content-Type": "application/json",
//     },
//   });
// };

// export default sendEmail;

import nodemailer from "nodemailer";
import config from "../config";
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: 587,
    secure: true,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  // Email options
  const mailOptions = {
    from: config.emailSender.email,
    to,
    subject,
    html,
    text,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

