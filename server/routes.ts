import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertWasteReportSchema,
  insertDonationSchema,
  insertEventSchema,
  insertEventParticipantSchema,
  insertMediaContentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Get all users (admin only)
  app.get("/api/users", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Get users from all roles
      const customers = await storage.getUsersByRole("customer");
      const dealers = await storage.getUsersByRole("dealer");
      const organizations = await storage.getUsersByRole("organization");
      const admins = await storage.getUsersByRole("admin");
      
      // Combine all users and remove passwords
      const allUsers = [...customers, ...dealers, ...organizations, ...admins].map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user role (admin only)
  app.put("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      // Validate role
      if (!['customer', 'dealer', 'organization', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user role
      const updatedUser = await storage.updateUser(userId, { role });
      
      // Remove password from response
      if (updatedUser) {
        const { password, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // GET stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // GET environmental impact data
  app.get("/api/environmental-impact", async (req, res) => {
    try {
      // Admin and higher access only
      if (!req.isAuthenticated() || !req.user || (req.user.role !== 'admin' && req.user.role !== 'organization')) {
        return res.status(403).json({ message: "Admin or Organization access required" });
      }
      
      const impactData = await storage.getEnvironmentalImpact();
      res.json(impactData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch environmental impact data" });
    }
  });
  
  // GET leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || 'monthly';
      
      // Get users from all roles, sort by social points
      const customers = await storage.getUsersByRole("customer");
      const dealers = await storage.getUsersByRole("dealer");
      const organizations = await storage.getUsersByRole("organization");
      
      // Combine all users and sort by social points
      const allUsers = [...customers, ...dealers, ...organizations];
      const sortedUsers = allUsers.sort((a, b) => (b.socialPoints || 0) - (a.socialPoints || 0));
      
      // Return top 10 users with sensitive info removed
      const topUsers = sortedUsers.slice(0, 10).map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(topUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });

  // GET media content
  app.get("/api/media", async (req, res) => {
    try {
      const type = req.query.type as string;
      let media;
      
      if (type) {
        media = await storage.getMediaContentByType(type);
      } else {
        media = await storage.getAllMediaContent();
      }
      
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media content" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const media = await storage.getMediaContent(id);
      
      if (!media) {
        return res.status(404).json({ message: "Media content not found" });
      }
      
      res.json(media);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media content" });
    }
  });

  // POST media content (requires authentication)
  app.post("/api/media", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validatedData = insertMediaContentSchema.parse(req.body);
      const media = await storage.createMediaContent({
        ...validatedData,
        authorId: req.user.id
      });
      
      res.status(201).json(media);
    } catch (error) {
      res.status(400).json({ message: "Invalid media content data", error });
    }
  });

  // Routes that require authentication
  app.use("/api/waste-reports", (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  });

  // Waste reports routes
  app.get("/api/waste-reports", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      let reports;
      
      // For admins, show all reports from all statuses
      if (req.user.role === 'admin') {
        const pendingReports = await storage.getWasteReportsByStatus('pending');
        const scheduledReports = await storage.getWasteReportsByStatus('scheduled');
        const inProgressReports = await storage.getWasteReportsByStatus('in_progress');
        const completedReports = await storage.getWasteReportsByStatus('completed');
        const rejectedReports = await storage.getWasteReportsByStatus('rejected');
        reports = [...pendingReports, ...scheduledReports, ...inProgressReports, ...completedReports, ...rejectedReports];
      }
      // For dealers, show all pending reports
      else if (req.user.role === 'dealer') {
        reports = await storage.getWasteReportsByStatus('pending');
      } 
      // For organizations, show all reports except completed/rejected
      else if (req.user.role === 'organization') {
        const pendingReports = await storage.getWasteReportsByStatus('pending');
        const scheduledReports = await storage.getWasteReportsByStatus('scheduled');
        const inProgressReports = await storage.getWasteReportsByStatus('in_progress');
        reports = [...pendingReports, ...scheduledReports, ...inProgressReports];
      }
      // For customers, show only their reports
      else {
        reports = await storage.getWasteReportsByUserId(userId);
      }
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch waste reports" });
    }
  });

  app.post("/api/waste-reports", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user.id;
      const validatedData = insertWasteReportSchema.parse(req.body);
      
      const report = await storage.createWasteReport({
        ...validatedData,
        userId
      });
      
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid waste report data", error });
    }
  });

  app.put("/api/waste-reports/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      const report = await storage.getWasteReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Waste report not found" });
      }
      
      // Check permissions based on role
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'dealer' && userRole !== 'organization' && report.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this report" });
      }
      
      const updatedReport = await storage.updateWasteReport(id, req.body);
      res.json(updatedReport);
    } catch (error) {
      res.status(400).json({ message: "Failed to update waste report", error });
    }
  });

  // Donation routes
  app.get("/api/donations", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      let donations;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole === 'admin') {
        // Admins see all donations
        const availableDonations = await storage.getAvailableDonations();
        
        // Get all users to get their donations
        const customers = await storage.getUsersByRole("customer");
        
        // Get all user donations
        let allDonations = [];
        for (const customer of customers) {
          const userDonations = await storage.getDonationsByUserId(customer.id);
          allDonations = [...allDonations, ...userDonations];
        }
        
        donations = allDonations;
      } else if (userRole === 'organization') {
        // Organizations see all available donations
        donations = await storage.getAvailableDonations();
      } else {
        // Customers see their own donations
        donations = await storage.getDonationsByUserId(userId);
      }
      
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.post("/api/donations", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userId = req.user.id;
      const validatedData = insertDonationSchema.parse(req.body);
      
      const donation = await storage.createDonation({
        ...validatedData,
        userId
      });
      
      res.status(201).json(donation);
    } catch (error) {
      res.status(400).json({ message: "Invalid donation data", error });
    }
  });

  app.put("/api/donations/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const id = parseInt(req.params.id);
      const donation = await storage.getDonation(id);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      // Check permissions based on role
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'organization' && donation.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this donation" });
      }
      
      const updatedDonation = await storage.updateDonation(id, req.body);
      res.json(updatedDonation);
    } catch (error) {
      res.status(400).json({ message: "Failed to update donation", error });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      // Public endpoint - no auth required
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const userRole = req.user.role;
      // Only organizations can create events
      if (userRole !== 'organization') {
        return res.status(403).json({ message: "Only organizations can create events" });
      }
      
      const organizerId = req.user.id;
      const validatedData = insertEventSchema.parse(req.body);
      
      const event = await storage.createEvent({
        ...validatedData,
        organizerId
      });
      
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only the organizer can update the event
      if (event.organizerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this event" });
      }
      
      const updatedEvent = await storage.updateEvent(id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: "Failed to update event", error });
    }
  });

  // Event participants routes
  app.post("/api/events/:id/participants", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is already participating
      const isParticipating = await storage.isUserParticipating(eventId, userId);
      if (isParticipating) {
        return res.status(400).json({ message: "Already registered for this event" });
      }
      
      // Check if the event has reached max participants
      if (event.maxParticipants) {
        const participants = await storage.getEventParticipants(eventId);
        if (participants.length >= event.maxParticipants) {
          return res.status(400).json({ message: "Event has reached maximum participants" });
        }
      }
      
      const participant = await storage.addEventParticipant({
        eventId,
        userId
      });
      
      res.status(201).json(participant);
    } catch (error) {
      res.status(400).json({ message: "Failed to join event", error });
    }
  });

  app.get("/api/events/:id/participants", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const participants = await storage.getEventParticipants(eventId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event participants" });
    }
  });

  app.delete("/api/events/:id/participants", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const success = await storage.removeEventParticipant(eventId, userId);
      
      if (!success) {
        return res.status(404).json({ message: "Not registered for this event" });
      }
      
      res.status(200).json({ message: "Successfully left the event" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
