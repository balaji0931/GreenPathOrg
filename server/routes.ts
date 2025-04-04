import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocketServer, broadcastMessage } from "./websocket";
import { z } from "zod";
import {
  insertWasteReportSchema,
  insertDonationSchema,
  insertEventSchema,
  insertEventParticipantSchema,
  insertMediaContentSchema,
  insertIssueSchema,
  insertFeedbackSchema,
  insertHelpRequestSchema
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
      
      // Broadcast the new media content to all connected clients
      broadcastMessage('media_created', {
        content: media,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      // Add social points for creating content (only for organizations)
      if (req.user.role === 'organization') {
        const updatedUser = await storage.updateUser(req.user.id, {
          socialPoints: (req.user.socialPoints || 0) + 10
        });
        
        // If points updated, broadcast leaderboard update
        if (updatedUser) {
          broadcastMessage('leaderboard_updated', { userId: req.user.id });
        }
      }
      
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
      
      // Broadcast waste report created
      broadcastMessage('waste_report_created', {
        report,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      // Add social points for reporting waste
      const updatedUser = await storage.updateUser(req.user.id, {
        socialPoints: (req.user.socialPoints || 0) + 2
      });
      
      // If points updated, broadcast leaderboard update
      if (updatedUser) {
        broadcastMessage('leaderboard_updated', { userId: req.user.id });
      }
      
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
      
      let donations: Awaited<ReturnType<typeof storage.getDonationsByUserId>>;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole === 'admin') {
        // Admins see all donations
        const availableDonations = await storage.getAvailableDonations();
        
        // Get all users to get their donations
        const customers = await storage.getUsersByRole("customer");
        
        // Get all user donations from all customers
        const customerDonations = await Promise.all(
          customers.map(customer => storage.getDonationsByUserId(customer.id))
        );
        
        // Flatten the array of arrays into a single array of donations
        donations = customerDonations.flat();
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
      
      // Broadcast new donation to all connected clients
      broadcastMessage('donation_created', {
        donation,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      // Add social points for donating
      const updatedUser = await storage.updateUser(req.user.id, {
        socialPoints: (req.user.socialPoints || 0) + 5
      });
      
      // If points updated, broadcast leaderboard update
      if (updatedUser) {
        broadcastMessage('leaderboard_updated', { userId: req.user.id });
      }
      
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
      
      // Broadcast new event to all connected clients
      broadcastMessage('event_created', {
        event,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      // Add social points for creating events
      const updatedUser = await storage.updateUser(req.user.id, {
        socialPoints: (req.user.socialPoints || 0) + 15
      });
      
      // If points updated, broadcast leaderboard update
      if (updatedUser) {
        broadcastMessage('leaderboard_updated', { userId: req.user.id });
      }
      
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
      
      // Broadcast participant joined event
      broadcastMessage('event_participant_joined', {
        eventId,
        participant: {
          id: req.user.id,
          username: req.user.username,
          fullName: req.user.fullName,
        }
      });
      
      // Add social points for joining an event
      const updatedUser = await storage.updateUser(req.user.id, {
        socialPoints: (req.user.socialPoints || 0) + 5
      });
      
      // If points updated, broadcast leaderboard update
      if (updatedUser) {
        broadcastMessage('leaderboard_updated', { userId: req.user.id });
      }
      
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

  // Issue routes
  app.get("/api/issues", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = req.user.role;
      const userId = req.user.id;
      let issues;
      
      if (userRole === 'admin') {
        // Admins see all issues
        issues = await storage.getAllIssues();
      } else if (userRole === 'organization') {
        // Organizations see assigned issues or pending issues
        const assignedIssues = await storage.getIssuesByStatus('assigned');
        const inProgressIssues = await storage.getIssuesByStatus('in_progress');
        const pendingIssues = await storage.getIssuesByStatus('pending');
        
        // Filter assigned issues for this organization
        const orgAssignedIssues = assignedIssues.filter(
          issue => issue.assignedOrganizationId === userId
        );
        
        // Filter in-progress issues for this organization
        const orgInProgressIssues = inProgressIssues.filter(
          issue => issue.assignedOrganizationId === userId
        );
        
        issues = [...orgAssignedIssues, ...orgInProgressIssues, ...pendingIssues];
      } else {
        // Customers see their own issues
        issues = await storage.getIssuesByUserId(userId);
      }
      
      res.json(issues);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });
  
  app.post("/api/issues", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user.id;
      const validatedData = insertIssueSchema.parse(req.body);
      
      const issue = await storage.createIssue({
        ...validatedData,
        userId
      });
      
      // Broadcast issue created
      broadcastMessage('issue_created', {
        issue,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      res.status(201).json(issue);
    } catch (error) {
      res.status(400).json({ message: "Invalid issue data", error });
    }
  });
  
  app.put("/api/issues/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const issue = await storage.getIssue(id);
      
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      // Check permissions based on role
      const userId = req.user.id;
      const userRole = req.user.role;
      
      if (userRole !== 'admin' && userRole !== 'organization' && issue.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this issue" });
      }
      
      const updatedIssue = await storage.updateIssue(id, req.body);
      res.json(updatedIssue);
    } catch (error) {
      res.status(400).json({ message: "Failed to update issue", error });
    }
  });
  
  app.post("/api/issues/:id/assign", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const issueId = parseInt(req.params.id);
      const { organizationId } = req.body;
      
      if (!organizationId) {
        return res.status(400).json({ message: "Organization ID is required" });
      }
      
      // Only admins can assign issues to organizations
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can assign issues" });
      }
      
      const updatedIssue = await storage.assignIssueToOrganization(issueId, organizationId);
      
      if (!updatedIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      res.json(updatedIssue);
    } catch (error) {
      res.status(400).json({ message: "Failed to assign issue", error });
    }
  });
  
  // Feedback routes
  app.get("/api/feedback", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = req.user.role;
      const userId = req.user.id;
      let feedbackList;
      
      if (userRole === 'admin') {
        // Admins see all feedback
        feedbackList = await storage.getAllFeedback();
      } else if (userRole === 'dealer') {
        // Dealers see feedback assigned to them
        feedbackList = await storage.getAllFeedback();
        feedbackList = feedbackList.filter(f => f.assignedToId === userId);
      } else {
        // Customers see their own feedback
        feedbackList = await storage.getFeedbackByUserId(userId);
      }
      
      res.json(feedbackList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });
  
  app.post("/api/feedback", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user.id;
      const validatedData = insertFeedbackSchema.parse(req.body);
      
      const feedback = await storage.createFeedback({
        ...validatedData,
        userId
      });
      
      // Broadcast feedback created
      broadcastMessage('feedback_created', {
        feedback,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      // Add social points for providing feedback
      const updatedUser = await storage.updateUser(req.user.id, {
        socialPoints: (req.user.socialPoints || 0) + 1
      });
      
      // If points updated, broadcast leaderboard update
      if (updatedUser) {
        broadcastMessage('leaderboard_updated', { userId: req.user.id });
      }
      
      res.status(201).json(feedback);
    } catch (error) {
      res.status(400).json({ message: "Invalid feedback data", error });
    }
  });
  
  app.put("/api/feedback/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const feedback = await storage.getFeedback(id);
      
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      // Only admins or the assigned dealer can update feedback status
      const userRole = req.user.role;
      const userId = req.user.id;
      
      if (userRole !== 'admin' && feedback.assignedToId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this feedback" });
      }
      
      const updatedFeedback = await storage.updateFeedback(id, req.body);
      res.json(updatedFeedback);
    } catch (error) {
      res.status(400).json({ message: "Failed to update feedback", error });
    }
  });
  
  app.post("/api/feedback/:id/assign", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const feedbackId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      // Only admins can assign feedback
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can assign feedback" });
      }
      
      const updatedFeedback = await storage.assignFeedbackToUser(feedbackId, userId);
      
      if (!updatedFeedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      res.json(updatedFeedback);
    } catch (error) {
      res.status(400).json({ message: "Failed to assign feedback", error });
    }
  });
  
  // Help Request routes
  app.get("/api/help-requests", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userRole = req.user.role;
      const userId = req.user.id;
      let helpRequests;
      
      if (userRole === 'admin' || userRole === 'organization') {
        // Admins and organizations see all help requests
        helpRequests = await storage.getAllHelpRequests();
      } else {
        // Customers see their own help requests
        helpRequests = await storage.getHelpRequestsByUserId(userId);
      }
      
      res.json(helpRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch help requests" });
    }
  });
  
  app.post("/api/help-requests", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const userId = req.user.id;
      const validatedData = insertHelpRequestSchema.parse(req.body);
      
      const helpRequest = await storage.createHelpRequest({
        ...validatedData,
        userId
      });
      
      // Broadcast help request created
      broadcastMessage('help_request_created', {
        helpRequest,
        creator: {
          id: req.user.id,
          username: req.user.username,
          role: req.user.role
        }
      });
      
      res.status(201).json(helpRequest);
    } catch (error) {
      res.status(400).json({ message: "Invalid help request data", error });
    }
  });
  
  app.put("/api/help-requests/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const helpRequest = await storage.getHelpRequest(id);
      
      if (!helpRequest) {
        return res.status(404).json({ message: "Help request not found" });
      }
      
      // Check permissions based on role
      const userRole = req.user.role;
      const userId = req.user.id;
      
      if (userRole !== 'admin' && userRole !== 'organization' && helpRequest.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this help request" });
      }
      
      const updatedHelpRequest = await storage.updateHelpRequest(id, req.body);
      res.json(updatedHelpRequest);
    } catch (error) {
      res.status(400).json({ message: "Failed to update help request", error });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);
  
  return httpServer;
}
