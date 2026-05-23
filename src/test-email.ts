/**
 * Quick SMTP test — run with: npx tsx src/test-email.ts
 * This will show the REAL error from Gmail
 */
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

async function testEmail() {
    console.log("=== SMTP Debug Info ===");
    console.log("SMTP_HOST:", process.env.SMTP_HOST);
    console.log("SMTP_PORT:", process.env.SMTP_PORT);
    console.log("SMTP_USER:", process.env.SMTP_USER);
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? `"${process.env.SMTP_PASS}" (${process.env.SMTP_PASS.length} chars)` : "EMPTY!");
    console.log("SMTP_FROM:", process.env.SMTP_FROM);
    console.log("========================\n");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // Verify connection first
        console.log("🔄 Verifying SMTP connection...");
        await transporter.verify();
        console.log("✅ SMTP connection verified!\n");

        // Send test email
        console.log("📧 Sending test email...");
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: process.env.SMTP_USER!, // send to yourself
            subject: "Test Email - Hospital System",
            html: "<h1>✅ Email is working!</h1><p>Your SMTP config is correct.</p>",
        });

        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error: any) {
        console.error("❌ SMTP Error:", error.message);
        console.error("\nFull error:", error);
    }
}

testEmail();
