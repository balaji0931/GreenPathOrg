import { 
  users, type User, type InsertUser,
  wasteReports, type WasteReport, type InsertWasteReport,
  donations, type Donation, type InsertDonation,
  events, type Event, type InsertEvent,
  eventParticipants, type EventParticipant, type InsertEventParticipant,
  mediaContent, type MediaContent, type InsertMediaContent,
  issues, type Issue, type InsertIssue,
  feedback, type Feedback, type InsertFeedback,
  helpRequests, type HelpRequest, type InsertHelpRequest
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Waste report methods
  createWasteReport(report: InsertWasteReport): Promise<WasteReport>;
  getWasteReport(id: number): Promise<WasteReport | undefined>;
  getWasteReportsByUserId(userId: number): Promise<WasteReport[]>;
  getWasteReportsByStatus(status: string): Promise<WasteReport[]>;
  updateWasteReport(id: number, report: Partial<WasteReport>): Promise<WasteReport | undefined>;
  
  // Donation methods
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonation(id: number): Promise<Donation | undefined>;
  getDonationsByUserId(userId: number): Promise<Donation[]>;
  getAvailableDonations(): Promise<Donation[]>;
  updateDonation(id: number, donation: Partial<Donation>): Promise<Donation | undefined>;
  
  // Event methods
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByOrganizerId(organizerId: number): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  
  // Event participant methods
  addEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  getEventParticipants(eventId: number): Promise<User[]>;
  isUserParticipating(eventId: number, userId: number): Promise<boolean>;
  removeEventParticipant(eventId: number, userId: number): Promise<boolean>;
  
  // Media content methods
  createMediaContent(content: InsertMediaContent): Promise<MediaContent>;
  getMediaContent(id: number): Promise<MediaContent | undefined>;
  getAllMediaContent(): Promise<MediaContent[]>;
  getMediaContentByType(contentType: string): Promise<MediaContent[]>;
  
  // Issue methods
  createIssue(issue: InsertIssue): Promise<Issue>;
  getIssue(id: number): Promise<Issue | undefined>;
  getIssuesByUserId(userId: number): Promise<Issue[]>;
  getIssuesByStatus(status: string): Promise<Issue[]>;
  getAllIssues(): Promise<Issue[]>;
  updateIssue(id: number, issue: Partial<Issue>): Promise<Issue | undefined>;
  assignIssueToOrganization(issueId: number, organizationId: number): Promise<Issue | undefined>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedback(id: number): Promise<Feedback | undefined>;
  getFeedbackByUserId(userId: number): Promise<Feedback[]>;
  getAllFeedback(): Promise<Feedback[]>;
  updateFeedback(id: number, feedback: Partial<Feedback>): Promise<Feedback | undefined>;
  assignFeedbackToUser(feedbackId: number, userId: number): Promise<Feedback | undefined>;
  
  // Help Request methods
  createHelpRequest(helpRequest: InsertHelpRequest): Promise<HelpRequest>;
  getHelpRequest(id: number): Promise<HelpRequest | undefined>;
  getHelpRequestsByUserId(userId: number): Promise<HelpRequest[]>;
  getHelpRequestsByStatus(status: string): Promise<HelpRequest[]>;
  getAllHelpRequests(): Promise<HelpRequest[]>;
  updateHelpRequest(id: number, helpRequest: Partial<HelpRequest>): Promise<HelpRequest | undefined>;
  
  // Stats
  getStats(): Promise<{ 
    pickupsCompleted: number; 
    itemsDonated: number;
    communityEvents: number;
    activeMembers: number;
  }>;
  
  // Environmental Impact Analytics
  getEnvironmentalImpact(): Promise<{
    wasteByCategory: { name: string; value: number }[];
    wasteCollectionTrend: { name: string; value: number }[];
    carbonOffset: number;
    treesEquivalent: number;
    waterSaved: number;
    monthlyWasteData: { month: string; segregated: number; mixed: number }[];
    donationsByCategory: { name: string; value: number }[];
    socialImpactMetrics: { name: string; value: number }[];
  }>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersDb: Map<number, User>;
  private wasteReportsDb: Map<number, WasteReport>;
  private donationsDb: Map<number, Donation>;
  private eventsDb: Map<number, Event>;
  private eventParticipantsDb: Map<number, EventParticipant>;
  private mediaContentDb: Map<number, MediaContent>;
  private issuesDb: Map<number, Issue>;
  private feedbackDb: Map<number, Feedback>;
  private helpRequestsDb: Map<number, HelpRequest>;
  
  currentUserId: number;
  currentWasteReportId: number;
  currentDonationId: number;
  currentEventId: number;
  currentEventParticipantId: number;
  currentMediaContentId: number;
  currentIssueId: number;
  currentFeedbackId: number;
  currentHelpRequestId: number;
  sessionStore: session.Store;

  constructor() {
    // Initialize storage
    this.usersDb = new Map();
    this.wasteReportsDb = new Map();
    this.donationsDb = new Map();
    this.eventsDb = new Map();
    this.eventParticipantsDb = new Map();
    this.mediaContentDb = new Map();
    this.issuesDb = new Map();
    this.feedbackDb = new Map();
    this.helpRequestsDb = new Map();
    
    // Initialize IDs
    this.currentUserId = 1;
    this.currentWasteReportId = 1;
    this.currentDonationId = 1;
    this.currentEventId = 1;
    this.currentEventParticipantId = 1;
    this.currentMediaContentId = 1;
    this.currentIssueId = 1;
    this.currentFeedbackId = 1;
    this.currentHelpRequestId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
    
    // Setup initial data
    this.seedInitialData();
    
    // Initialize sample media content
    this.seedMediaContent();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersDb.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersDb.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersDb.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      socialPoints: 0,
      role: insertUser.role as "customer" | "dealer" | "organization" | "admin"
    };
    this.usersDb.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersDb.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersDb.set(id, updatedUser);
    return updatedUser;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.usersDb.values()).filter(user => user.role === role);
  }
  
  // Waste report methods
  async createWasteReport(report: InsertWasteReport): Promise<WasteReport> {
    const id = this.currentWasteReportId++;
    const now = new Date();
    const newReport = { 
      ...report, 
      id, 
      createdAt: now, 
      assignedDealerId: null, 
      scheduledDate: null,
      status: (report.status || "pending") as "pending" | "scheduled" | "in_progress" | "completed" | "rejected",
      images: report.images || null,
      isSegregated: report.isSegregated || null
    };
    this.wasteReportsDb.set(id, newReport);
    return newReport;
  }
  
  async getWasteReport(id: number): Promise<WasteReport | undefined> {
    return this.wasteReportsDb.get(id);
  }
  
  async getWasteReportsByUserId(userId: number): Promise<WasteReport[]> {
    return Array.from(this.wasteReportsDb.values()).filter(
      report => report.userId === userId
    );
  }
  
  async getWasteReportsByStatus(status: string): Promise<WasteReport[]> {
    return Array.from(this.wasteReportsDb.values()).filter(
      report => report.status === status
    );
  }
  
  async updateWasteReport(id: number, reportData: Partial<WasteReport>): Promise<WasteReport | undefined> {
    const report = this.wasteReportsDb.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...reportData };
    this.wasteReportsDb.set(id, updatedReport);
    return updatedReport;
  }
  
  // Donation methods
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = this.currentDonationId++;
    const now = new Date();
    const newDonation = { 
      ...donation, 
      id, 
      createdAt: now, 
      requestedByOrganizationId: null,
      status: (donation.status || "available") as "completed" | "available" | "requested" | "matched",
      images: donation.images || null
    };
    this.donationsDb.set(id, newDonation);
    return newDonation;
  }
  
  async getDonation(id: number): Promise<Donation | undefined> {
    return this.donationsDb.get(id);
  }
  
  async getDonationsByUserId(userId: number): Promise<Donation[]> {
    return Array.from(this.donationsDb.values()).filter(
      donation => donation.userId === userId
    );
  }
  
  async getAvailableDonations(): Promise<Donation[]> {
    return Array.from(this.donationsDb.values()).filter(
      donation => donation.status === 'available'
    );
  }
  
  async updateDonation(id: number, donationData: Partial<Donation>): Promise<Donation | undefined> {
    const donation = this.donationsDb.get(id);
    if (!donation) return undefined;
    
    const updatedDonation = { ...donation, ...donationData };
    this.donationsDb.set(id, updatedDonation);
    return updatedDonation;
  }
  
  // Event methods
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const now = new Date();
    const newEvent = { 
      ...event, 
      id, 
      createdAt: now,
      status: (event.status || "upcoming") as "completed" | "upcoming" | "ongoing" | "cancelled",
      maxParticipants: event.maxParticipants || null,
      image: event.image || null
    };
    this.eventsDb.set(id, newEvent);
    return newEvent;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsDb.get(id);
  }
  
  async getEventsByOrganizerId(organizerId: number): Promise<Event[]> {
    return Array.from(this.eventsDb.values()).filter(
      event => event.organizerId === organizerId
    );
  }
  
  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.eventsDb.values()).filter(
      event => event.status === 'upcoming' && new Date(event.date) > now
    );
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = this.eventsDb.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.eventsDb.set(id, updatedEvent);
    return updatedEvent;
  }
  
  // Event participant methods
  async addEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    const id = this.currentEventParticipantId++;
    const now = new Date();
    const newParticipant: EventParticipant = { ...participant, id, joinedAt: now };
    this.eventParticipantsDb.set(id, newParticipant);
    return newParticipant;
  }
  
  async getEventParticipants(eventId: number): Promise<User[]> {
    const participantIds = Array.from(this.eventParticipantsDb.values())
      .filter(participant => participant.eventId === eventId)
      .map(participant => participant.userId);
    
    const participants: User[] = [];
    for (const id of participantIds) {
      const user = this.usersDb.get(id);
      if (user) participants.push(user);
    }
    
    return participants;
  }
  
  async isUserParticipating(eventId: number, userId: number): Promise<boolean> {
    return Array.from(this.eventParticipantsDb.values()).some(
      participant => participant.eventId === eventId && participant.userId === userId
    );
  }
  
  async removeEventParticipant(eventId: number, userId: number): Promise<boolean> {
    const participant = Array.from(this.eventParticipantsDb.entries()).find(
      ([_, p]) => p.eventId === eventId && p.userId === userId
    );
    
    if (!participant) return false;
    this.eventParticipantsDb.delete(participant[0]);
    return true;
  }
  
  // Media content methods
  async createMediaContent(content: InsertMediaContent): Promise<MediaContent> {
    const id = this.currentMediaContentId++;
    const now = new Date();
    const newContent: MediaContent = { 
      ...content, 
      id, 
      createdAt: now,
      authorId: content.authorId ?? null,
      tags: content.tags ?? null,
      published: content.published ?? null
    };
    this.mediaContentDb.set(id, newContent);
    return newContent;
  }
  
  async getMediaContent(id: number): Promise<MediaContent | undefined> {
    return this.mediaContentDb.get(id);
  }
  
  async getAllMediaContent(): Promise<MediaContent[]> {
    return Array.from(this.mediaContentDb.values()).filter(content => content.published);
  }
  
  async getMediaContentByType(contentType: string): Promise<MediaContent[]> {
    return Array.from(this.mediaContentDb.values()).filter(
      content => content.contentType === contentType && content.published
    );
  }
  
  // Issue methods
  async createIssue(issue: InsertIssue): Promise<Issue> {
    const id = this.currentIssueId++;
    const now = new Date();
    const newIssue: Issue = { 
      ...issue, 
      id, 
      createdAt: now,
      assignedOrganizationId: null,
      status: (issue.status || "pending") as "pending" | "assigned" | "in_progress" | "resolved" | "rejected",
      images: issue.images || null,
      isUrgent: issue.isUrgent || false,
      requestCommunityHelp: issue.requestCommunityHelp || false
    };
    this.issuesDb.set(id, newIssue);
    return newIssue;
  }
  
  async getIssue(id: number): Promise<Issue | undefined> {
    return this.issuesDb.get(id);
  }
  
  async getIssuesByUserId(userId: number): Promise<Issue[]> {
    return Array.from(this.issuesDb.values()).filter(
      issue => issue.userId === userId
    );
  }
  
  async getIssuesByStatus(status: string): Promise<Issue[]> {
    return Array.from(this.issuesDb.values()).filter(
      issue => issue.status === status
    );
  }
  
  async getAllIssues(): Promise<Issue[]> {
    return Array.from(this.issuesDb.values());
  }
  
  async updateIssue(id: number, issueData: Partial<Issue>): Promise<Issue | undefined> {
    const issue = this.issuesDb.get(id);
    if (!issue) return undefined;
    
    const updatedIssue = { ...issue, ...issueData };
    this.issuesDb.set(id, updatedIssue);
    return updatedIssue;
  }
  
  async assignIssueToOrganization(issueId: number, organizationId: number): Promise<Issue | undefined> {
    const issue = this.issuesDb.get(issueId);
    if (!issue) return undefined;
    
    const updatedIssue = { 
      ...issue, 
      assignedOrganizationId: organizationId,
      status: "assigned" as "pending" | "assigned" | "in_progress" | "resolved" | "rejected"
    };
    this.issuesDb.set(issueId, updatedIssue);
    return updatedIssue;
  }
  
  // Feedback methods
  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentFeedbackId++;
    const now = new Date();
    const newFeedback: Feedback = { 
      ...feedback, 
      id, 
      createdAt: now,
      status: 'unread',
      assignedToId: null
    };
    this.feedbackDb.set(id, newFeedback);
    return newFeedback;
  }
  
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbackDb.get(id);
  }
  
  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbackDb.values()).filter(
      feedback => feedback.userId === userId
    );
  }
  
  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbackDb.values());
  }
  
  async updateFeedback(id: number, feedbackData: Partial<Feedback>): Promise<Feedback | undefined> {
    const feedback = this.feedbackDb.get(id);
    if (!feedback) return undefined;
    
    const updatedFeedback = { ...feedback, ...feedbackData };
    this.feedbackDb.set(id, updatedFeedback);
    return updatedFeedback;
  }
  
  async assignFeedbackToUser(feedbackId: number, userId: number): Promise<Feedback | undefined> {
    const feedback = this.feedbackDb.get(feedbackId);
    if (!feedback) return undefined;
    
    const updatedFeedback = { 
      ...feedback, 
      assignedToId: userId,
      status: 'assigned'
    };
    this.feedbackDb.set(feedbackId, updatedFeedback);
    return updatedFeedback;
  }
  
  // Help Request methods
  async createHelpRequest(helpRequest: InsertHelpRequest): Promise<HelpRequest> {
    const id = this.currentHelpRequestId++;
    const now = new Date();
    const newHelpRequest: HelpRequest = { 
      ...helpRequest, 
      id, 
      createdAt: now,
      status: (helpRequest.status || "pending") as "pending" | "approved" | "in_progress" | "completed" | "rejected",
      skills: helpRequest.skills || null,
      isUrgent: helpRequest.isUrgent || false,
      scheduledDate: helpRequest.scheduledDate || now,
      maxParticipants: helpRequest.maxParticipants || null,
      helpType: helpRequest.helpType || "general"
    };
    this.helpRequestsDb.set(id, newHelpRequest);
    return newHelpRequest;
  }
  
  async getHelpRequest(id: number): Promise<HelpRequest | undefined> {
    return this.helpRequestsDb.get(id);
  }
  
  async getHelpRequestsByUserId(userId: number): Promise<HelpRequest[]> {
    return Array.from(this.helpRequestsDb.values()).filter(
      helpRequest => helpRequest.userId === userId
    );
  }
  
  async getHelpRequestsByStatus(status: string): Promise<HelpRequest[]> {
    return Array.from(this.helpRequestsDb.values()).filter(
      helpRequest => helpRequest.status === status
    );
  }
  
  async getAllHelpRequests(): Promise<HelpRequest[]> {
    return Array.from(this.helpRequestsDb.values());
  }
  
  async updateHelpRequest(id: number, helpRequestData: Partial<HelpRequest>): Promise<HelpRequest | undefined> {
    const helpRequest = this.helpRequestsDb.get(id);
    if (!helpRequest) return undefined;
    
    const updatedHelpRequest = { ...helpRequest, ...helpRequestData };
    this.helpRequestsDb.set(id, updatedHelpRequest);
    return updatedHelpRequest;
  }
  
  // Stats
  async getStats(): Promise<{ 
    pickupsCompleted: number; 
    itemsDonated: number;
    communityEvents: number;
    activeMembers: number;
  }> {
    const pickupsCompleted = Array.from(this.wasteReportsDb.values()).filter(
      report => report.status === 'completed'
    ).length;
    
    const itemsDonated = Array.from(this.donationsDb.values()).filter(
      donation => donation.status === 'completed'
    ).length;
    
    const communityEvents = this.eventsDb.size;
    
    const activeMembers = this.usersDb.size;
    
    return {
      pickupsCompleted,
      itemsDonated,
      communityEvents,
      activeMembers
    };
  }
  
  async getEnvironmentalImpact(): Promise<{
    wasteByCategory: { name: string; value: number }[];
    wasteCollectionTrend: { name: string; value: number }[];
    carbonOffset: number;
    treesEquivalent: number;
    waterSaved: number;
    monthlyWasteData: { month: string; segregated: number; mixed: number }[];
    donationsByCategory: { name: string; value: number }[];
    socialImpactMetrics: { name: string; value: number }[];
  }> {
    // Calculate waste by category
    const allWasteReports = Array.from(this.wasteReportsDb.values());
    const completedReports = allWasteReports.filter(report => report.status === 'completed');
    
    // Calculate approximate waste category data based on waste reports
    const plasticCount = completedReports.filter(report => 
      report.title.toLowerCase().includes('plastic') || 
      report.description.toLowerCase().includes('plastic')
    ).length;
    
    const paperCount = completedReports.filter(report => 
      report.title.toLowerCase().includes('paper') || 
      report.description.toLowerCase().includes('paper')
    ).length;
    
    const glassCount = completedReports.filter(report => 
      report.title.toLowerCase().includes('glass') || 
      report.description.toLowerCase().includes('glass')
    ).length;
    
    const eWasteCount = completedReports.filter(report => 
      report.title.toLowerCase().includes('electronic') || 
      report.description.toLowerCase().includes('electronic') ||
      report.title.toLowerCase().includes('e-waste') || 
      report.description.toLowerCase().includes('e-waste')
    ).length;
    
    const otherCount = completedReports.length - plasticCount - paperCount - glassCount - eWasteCount;
    
    const wasteByCategory = [
      { name: 'Plastic', value: Math.max(plasticCount, 1) },
      { name: 'Paper', value: Math.max(paperCount, 1) },
      { name: 'Glass', value: Math.max(glassCount, 1) },
      { name: 'E-Waste', value: Math.max(eWasteCount, 1) },
      { name: 'Other', value: Math.max(otherCount, 1) }
    ];
    
    // Generate waste collection trend by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const wasteCollectionTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];
      
      // Count reports from that month
      const reportsCount = completedReports.filter(report => {
        if (report.createdAt && report.createdAt instanceof Date) {
          return report.createdAt.getMonth() === monthIndex;
        }
        return false;
      }).length;
      
      wasteCollectionTrend.push({
        name: month,
        value: Math.max(reportsCount, 0) // Ensure non-negative
      });
    }
    
    // Calculate environmental impact metrics based on waste reports
    const segregatedWaste = allWasteReports.filter(report => report.isSegregated && report.status === 'completed').length;
    const totalWasteCollected = completedReports.length;
    
    // Approximations for environmental impact calculations
    // Note: These are simplified calculations for demonstration purposes
    const avgWastePerReport = 5; // kg
    const totalWasteKg = totalWasteCollected * avgWastePerReport;
    const carbonPerKg = 2.5; // CO2 kg saved per kg waste recycled
    const carbonOffset = totalWasteKg * carbonPerKg;
    
    // Tree equivalence: 1 tree absorbs ~22kg CO2 per year
    const treesEquivalent = Math.round(carbonOffset / 22);
    
    // Water saved: 7000 liters per ton of recycled paper
    const paperTons = (paperCount * avgWastePerReport) / 1000;
    const waterSaved = Math.round(paperTons * 7000);
    
    // Monthly segregated vs. mixed waste data
    const monthlyWasteData = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const month = months[monthIndex];
      
      const monthReports = allWasteReports.filter(report => {
        if (report.createdAt && report.createdAt instanceof Date) {
          return report.createdAt.getMonth() === monthIndex && report.status === 'completed';
        }
        return false;
      });
      
      const segregated = monthReports.filter(report => report.isSegregated).length;
      const mixed = monthReports.filter(report => !report.isSegregated).length;
      
      monthlyWasteData.push({
        month,
        segregated,
        mixed
      });
    }
    
    // Donations by category
    const donations = Array.from(this.donationsDb.values()).filter(donation => donation.status === 'completed');
    
    const clothingCount = donations.filter(donation => 
      donation.category.toLowerCase().includes('cloth') || 
      donation.category.toLowerCase().includes('apparel') ||
      donation.itemName.toLowerCase().includes('cloth') ||
      donation.itemName.toLowerCase().includes('apparel')
    ).length;
    
    const furnitureCount = donations.filter(donation => 
      donation.category.toLowerCase().includes('furniture') || 
      donation.itemName.toLowerCase().includes('furniture') ||
      donation.itemName.toLowerCase().includes('chair') ||
      donation.itemName.toLowerCase().includes('table') ||
      donation.itemName.toLowerCase().includes('bed')
    ).length;
    
    const electronicsCount = donations.filter(donation => 
      donation.category.toLowerCase().includes('electronic') || 
      donation.itemName.toLowerCase().includes('electronic') ||
      donation.category.toLowerCase().includes('appliance') ||
      donation.itemName.toLowerCase().includes('appliance')
    ).length;
    
    const otherDonations = donations.length - clothingCount - furnitureCount - electronicsCount;
    
    const donationsByCategory = [
      { name: 'Clothing', value: Math.max(clothingCount, 1) },
      { name: 'Furniture', value: Math.max(furnitureCount, 1) },
      { name: 'Electronics', value: Math.max(electronicsCount, 1) },
      { name: 'Other', value: Math.max(otherDonations, 1) }
    ];
    
    // Social impact metrics
    const totalEventParticipants = this.eventParticipantsDb.size;
    const activeVolunteers = Array.from(this.usersDb.values())
      .filter(user => (user.socialPoints || 0) > 100).length;
    const communitiesHelped = Math.round(this.eventsDb.size / 2);
    
    const socialImpactMetrics = [
      { name: 'Event Participants', value: Math.max(totalEventParticipants, 10) },
      { name: 'Active Volunteers', value: Math.max(activeVolunteers, 5) },
      { name: 'Donations Made', value: Math.max(donations.length, 15) },
      { name: 'Communities Helped', value: Math.max(communitiesHelped, 3) }
    ];
    
    return {
      wasteByCategory,
      wasteCollectionTrend,
      carbonOffset,
      treesEquivalent,
      waterSaved,
      monthlyWasteData,
      donationsByCategory,
      socialImpactMetrics
    };
  }
  
  // Seed initial users data
  private async seedInitialData() {
    try {
      // Import crypto functions for password hashing
      const crypto = await import('crypto');
      const util = await import('util');
      
      const scryptAsync = util.promisify(crypto.scrypt);
      
      // Hash function to create properly hashed passwords
      const hashPassword = async (password: string): Promise<string> => {
        const salt = crypto.randomBytes(16).toString("hex");
        const buf = (await scryptAsync(password, salt, 64)) as Buffer;
        return `${buf.toString("hex")}.${salt}`;
      };
      
      // Create admin user with all required fields and properly hashed password
      const hashedAdminPassword = await hashPassword("Admin0931@");
      const adminUser: InsertUser = {
        username: "admin",
        password: hashedAdminPassword,
        fullName: "System Administrator",
        email: "admin@greenpath.com",
        phone: "+1234567890",
        address: { street: "123 Admin Street", city: "Green City", zipCode: "12345" },
        role: "admin" as const
      };
      await this.createUser(adminUser);
      
      // Additional sample users for testing
      const customerUser: InsertUser = {
        username: "customer",
        password: await hashPassword("Customer123@"),
        fullName: "Sample Customer",
        email: "customer@example.com",
        phone: "+9876543210",
        address: { street: "456 User Lane", city: "Eco City", zipCode: "54321" },
        role: "customer" as const
      };
      
      const dealerUser: InsertUser = {
        username: "dealer",
        password: await hashPassword("Dealer123@"),
        fullName: "Sample Dealer",
        email: "dealer@example.com",
        phone: "+1122334455",
        address: { street: "789 Dealer Blvd", city: "Recycle City", zipCode: "67890" },
        role: "dealer" as const
      };
      
      const orgUser: InsertUser = {
        username: "organization",
        password: await hashPassword("Organization123@"),
        fullName: "Sample Organization",
        email: "org@example.com",
        phone: "+5566778899",
        address: { street: "101 Org Avenue", city: "Community City", zipCode: "10101" },
        role: "organization" as const
      };
      
      // Create sample users
      await this.createUser(customerUser);
      await this.createUser(dealerUser);
      await this.createUser(orgUser);
    } catch (error) {
      console.error("Error seeding initial data:", error);
    }
  }
  
  // Seed media content
  private seedMediaContent() {
    const mediaItems: InsertMediaContent[] = [
      {
        title: "Composting 101: Turn Kitchen Waste into Garden Gold",
        description: "Learn the basics of composting and how to create nutrient-rich soil from your everyday kitchen waste.",
        contentType: "video",
        authorId: null,
        content: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        tags: ["composting", "kitchen waste", "gardening"],
        published: true
      },
      {
        title: "Waste Segregation: A Step-by-Step Guide for Beginners",
        description: "Expert advice on how to properly sort your waste into recyclables, compostables, and non-recyclables.",
        contentType: "article",
        authorId: null,
        content: "# Waste Segregation Guide\n\nWaste segregation is the process of separating waste into different categories...",
        tags: ["waste segregation", "recycling", "beginners guide"],
        published: true
      },
      {
        title: "Riverside Cleanup Drive: Join Our Community Effort",
        description: "Participate in our monthly cleanup drive to help restore the natural beauty of our local riverside.",
        contentType: "event",
        authorId: null,
        content: "Join us on May 22, 2023 at 9:00 AM for a community cleanup drive at the riverside park...",
        tags: ["cleanup", "community", "environment"],
        published: true
      }
    ];
    
    for (const item of mediaItems) {
      this.createMediaContent(item);
    }
  }
}

export const storage = new MemStorage();