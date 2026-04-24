import nodemailer from "nodemailer";
import { emailConfig } from "../../../config/email.config.js";

// Create a transporter using SMTP
export const transporter = nodemailer.createTransport(emailConfig);
