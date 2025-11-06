import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
import { ContactFormData, ApiResponse } from "../types/contact";

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  async (
    req: Request<{}, ApiResponse, ContactFormData>,
    res: Response<ApiResponse>
  ) => {
    console.log("📨 Contact form received:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      console.log("✅ Form validation passed");

      // For now, skip database and focus on Yahoo email
      console.log("📝 Contact data:", { name, email, message });

      // Send email notification using Yahoo
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log("📧 Configuring Yahoo email transporter...");

        // Yahoo SMTP configuration
        const transporter = nodemailer.createTransport({
          host: "smtp.mail.yahoo.com",
          port: 587,
          secure: false, // true for 465, false for 587
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false, // Sometimes needed for Yahoo
          },
        });

        // Verify connection
        console.log("🔌 Verifying Yahoo SMTP connection...");
        await transporter.verify();
        console.log("✅ Yahoo SMTP connection verified");

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.YOUR_EMAIL || process.env.EMAIL_USER,
          subject: `New Portfolio Contact from ${name}`,
          text: `
Name: ${name}
Email: ${email}
Message: 
${message}
          `,
          html: `
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #333;">New Portfolio Contact Form Submission</h2>
  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <div style="background: white; padding: 10px; border-left: 4px solid #007bff;">
      ${message.replace(/\n/g, "<br>")}
    </div>
  </div>
  <p style="color: #666; font-size: 12px; margin-top: 20px;">
    Sent from your portfolio contact form
  </p>
</div>
          `,
        };

        console.log("📤 Sending email via Yahoo...");
        const emailResult = await transporter.sendMail(mailOptions);
        console.log(
          "✅ Email sent successfully via Yahoo! Message ID:",
          emailResult.messageId
        );
      } else {
        console.log("⚠️ Yahoo email credentials not configured");
        console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
        console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
      }

      return res.status(201).json({
        success: true,
        message: "Message sent successfully! I'll get back to you soon.",
      });
    } catch (err: any) {
      console.error("❌ Yahoo email error:", err);

      let errorMessage = "Failed to send message";

      if (err.code === "EAUTH" || err.responseCode === 535) {
        errorMessage =
          "Yahoo authentication failed - please check your app password";
      } else if (err.code === "ESOCKET" || err.code === "ECONNREFUSED") {
        errorMessage =
          "Cannot connect to Yahoo mail server - check internet connection";
      } else if (err.responseCode === 553) {
        errorMessage = "Yahoo email configuration error";
      }

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  }
);

export default router;
