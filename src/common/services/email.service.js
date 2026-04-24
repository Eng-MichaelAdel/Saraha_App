import { EventEmitter } from "node:events";
import { EMAIL_USER } from "../../../config/env.config.js";
import { transporter } from "../Clients/index.js";

export const sendEmail = async ({ to, cc, subject, attachments = [], html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Sarah-aApp" <${EMAIL_USER}>`, // sender address
      to,
      cc,
      subject,
      attachments,
      html,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};

export const emailEvent = new EventEmitter();
emailEvent.on("sendEmail", ({ to, cc, subject, attachments = [], html }) => {
  sendEmail({ to, cc, subject, html });
});
