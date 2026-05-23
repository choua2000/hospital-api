// ============================================
// Email Utility
// Send emails via SMTP using nodemailer
// Includes dev fallback with Ethereal
// ============================================

import nodemailer from "nodemailer";
import { env } from "../config/env";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Create SMTP transporter
 * In development: falls back to Ethereal (fake SMTP) if Gmail fails
 */
const createTransporter = async () => {
    // Try real SMTP if credentials are configured
    if (env.SMTP_USER && env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }

    // Fallback: create Ethereal test account (dev only)
    console.log("⚠️  No SMTP credentials — using Ethereal test account");
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

/**
 * Send an email
 * Returns the preview URL if using Ethereal (dev mode)
 */
export const sendEmail = async (options: EmailOptions): Promise<string | null> => {
    let transporter: nodemailer.Transporter;
    let usingEthereal = false;

    // Try real SMTP first
    if (env.SMTP_USER && env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });

        try {
            await transporter.verify();
        } catch (verifyError) {
            // If in development, fall back to Ethereal
            if (env.NODE_ENV !== "production") {
                console.warn("⚠️  Gmail SMTP failed, falling back to Ethereal test email");
                console.warn("   Error:", (verifyError as Error).message);
                const testAccount = await nodemailer.createTestAccount();
                transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                });
                usingEthereal = true;
            } else {
                throw verifyError; // In production, fail hard
            }
        }
    } else {
        // No credentials at all — use Ethereal
        console.log("⚠️  No SMTP credentials configured — using Ethereal test account");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        usingEthereal = true;
    }

    const mailOptions = {
        from: usingEthereal ? "Hospital System <test@hospital.com>" : env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (usingEthereal) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📧 Email sent via Ethereal (dev mode)");
        console.log("👀 Preview URL:", previewUrl);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        return previewUrl as string;
    }

    console.log("✅ Email sent successfully to:", options.to);
    return null;
};

/**
 * Generate OTP email HTML template
 */
export const generateOtpEmailHtml = (otp: string, name: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">🏥 Hospital Management System</h1>
                <p style="color: #bfdbfe; margin: 8px 0 0; font-size: 14px;">Password Reset Request</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 32px 24px;">
                <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">Hello <strong>${name}</strong>,</p>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                    We received a request to reset your password. Use the verification code below to proceed:
                </p>
                
                <!-- OTP Box -->
                <div style="text-align: center; margin: 24px 0;">
                    <div style="display: inline-block; background: #f0f4ff; border: 2px dashed #2563eb; border-radius: 12px; padding: 20px 40px;">
                        <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e40af;">${otp}</span>
                    </div>
                </div>
                
                <p style="color: #ef4444; font-size: 13px; text-align: center; margin: 16px 0;">
                    ⏰ This code expires in <strong>10 minutes</strong>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                
                <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
                    If you did not request a password reset, please ignore this email. Your password will remain unchanged.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 16px 24px; text-align: center;">
                <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                    © ${new Date().getFullYear()} Hospital Management System. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};
