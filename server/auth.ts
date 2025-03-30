import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage, IStorage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";
import nodemailer from 'nodemailer';
import validator from 'validator';
import { Leaf } from "lucide-react";

// Load environment variables

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Check if the stored password has a salt
  if (!stored || !stored.includes(".")) {
    console.error("Invalid stored password format (missing salt)");
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  if (!salt) {
    console.error("Salt is undefined after splitting");
    return false;
  }
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Password validation schema
const passwordSchema = z.string().min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "greenpath-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // First try to find user by username
        let user = await storage.getUserByUsername(username);
        
        // If not found, try by email
        if (!user) {
          user = await storage.getUserByEmail(username);
        }
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Create nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Store OTPs temporarily
  const otpStore = new Map<string, { otp: string; timestamp: number }>();

  async function sendOTP(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Welcome to Green Path – Verify Your Email Now!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 550px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1);">
            
            <div style="text-align: center;">
              <h1 style="color: #28a745; font-size: 22px; margin-bottom: 5px;">Welcome to Green Path! 🌍</h1>
              <p style="font-size: 16px; color: #555;">"A clean Earth is a happy Earth – let's make a difference together!"</p>
            </div>
            
            <p style="font-size: 16px; color: #333;">Dear Valued User,</p>
            <p style="font-size: 16px; color: #333;">
              Thank you for joining <strong>Green Path</strong>, a community dedicated to waste management and a cleaner tomorrow. To complete your registration, please use the OTP below:
            </p>
    
            <div style="font-size: 24px; font-weight: bold; text-align: center; color: #28a745; padding: 12px; border: 2px dashed #28a745; background: #f9fff9;">
              ${otp}
            </div>
    
            <p style="font-size: 14px; color: #555; text-align: center;">
              This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone.
            </p>
    
            <p style="font-size: 14px; color: #555;">
              If you did not request this, you can ignore this email.
            </p>
    
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    
            <p style="font-size: 16px; color: #333; text-align: center;">
              Let's work together for a cleaner, greener future! 🌱  
              <br><strong>Best Regards,</strong>
            </p>
    
            <div style="text-align: center; font-size: 16px; font-weight: bold; color: #333;">
              Balaji Nayak  
              <br>🚀 Co-Founder & CEO, Green Path
            </div>
    
            <p style="font-size: 12px; text-align: center; color: #888; margin-top: 10px;">
              🌍 Green Path | Waste Management for a Cleaner Tomorrow  
              <br>🌐 <a href="www.greenpathorg.social" style="color: #28a745;">Visit Our Website</a>
            </p>
          </div>
        </div>
      `
    });
    
    otpStore.set(email, { 
      otp, 
      timestamp: Date.now() 
    });

    return otp;
  }

  app.post("/api/verify-email", async (req, res) => {
    try {
      const { email } = req.body;

      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      await sendOTP(email);
      res.json({ message: "OTP sent successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    
    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: "No OTP found for this email" });
    }

    if (Date.now() - storedData.timestamp > 600000) { // 10 minutes
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpStore.delete(email);
    // Store verification status
    otpStore.set(email + '_verified', { timestamp: Date.now() });
    res.json({ message: "OTP verified successfully" });
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      // Check if email was verified
      const verifiedEmail = otpStore.get(email + '_verified');
      if (!verifiedEmail) {
        return res.status(400).json({ message: "Email not verified" });
      }
      otpStore.delete(email + '_verified');

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Validate password
      try {
        passwordSchema.parse(req.body.password);
      } catch (error) {
        return res.status(400).json({ message: "Password does not meet requirements", details: error });
      }

      // Validate role - allow admin only when explicitly created through admin panel
      const role = req.body.role;
      // For normal registration, only allow customer, dealer, organization
      if (!['customer', 'dealer', 'organization'].includes(role)) {
        return res.status(400).json({ message: "Invalid user role" });
      }

      // Hash password and create user
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Log user in automatically
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid username or password" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
