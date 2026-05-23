// ============================================
// Passport Configuration
// Handles Google OAuth strategy
// ============================================

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Role } from "@prisma/client";

const userRepository = new UserRepository();


passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID || "",
            clientSecret: env.GOOGLE_CLIENT_SECRET || "",
            callbackURL: env.GOOGLE_CALLBACK_URL || "",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value?.toLowerCase().trim();
                if (!email) {
                    return done(new Error("No email found in Google profile"));
                }

                let user = await userRepository.findByEmail(email);
                if (user) {
                    if (!user.imageUrl && profile.photos?.[0]?.value) {
                        user = await userRepository.update(user.id, {
                            imageUrl: profile.photos[0].value,
                        }) as any;
                    }
                } else {
                    const randomPassword = crypto.randomBytes(32).toString("hex");
                    const hashedPassword = await bcrypt.hash(randomPassword, env.BCRYPT_SALT_ROUNDS);

                    user = await userRepository.create({
                        name: profile.displayName || `${profile.name?.givenName || "Google"} ${profile.name?.familyName || "User"}`,
                        email,
                        password: hashedPassword,
                        role: Role.PATIENT,
                        imageUrl: profile.photos?.[0]?.value || null,
                        isActive: true,
                    }) as any;
                }

                return done(null, user ?? false);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

// Basic serialization (stateless JWT is used, but passport requires definition)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await userRepository.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
