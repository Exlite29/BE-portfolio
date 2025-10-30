import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";

import { prisma } from "../prismaClient";
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      // Create a record using Prisma
      const created = await prisma.contact.create({
        data: {
          name,
          email,
          message,
        },
      });

      // Send email notification
      const transporter = nodemailer.createTransport(
        process.env.EMAIL_SERVICE
          ? {
              service: process.env.EMAIL_SERVICE,
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            }
          : {
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            }
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.YOUR_EMAIL,
        subject: `New contact form submission from ${name}`,
        text: `You received a new message from ${name} <${email}>:\n\n${message}`,
        html: `<p>You received a new message from <strong>${name}</strong> &lt;${email}&gt;:</p><blockquote>${message.replace(
          /\n/g,
          "<br>"
        )}</blockquote>`,
      };

      await transporter.sendMail(mailOptions);

      return res
        .status(201)
        .json({
          success: true,
          message: "Contact saved and email sent",
          data: created,
        });
    } catch (err: any) {
      console.error("Error creating contact:", err);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
