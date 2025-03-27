import { 
  users, type User, type InsertUser,
  wasteReports, type WasteReport, type InsertWasteReport,
  donations, type Donation, type InsertDonation,
  events, type Event, type InsertEvent,
  eventParticipants, type EventParticipant, type InsertEventParticipant,
  mediaContent, type MediaContent, type InsertMediaContent
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private usersDb: Map<number, User>;
  private wasteReportsDb: Map<number, WasteReport>;
  private donationsDb: Map<number, Donation>;
  private eventsDb: Map<number, Event>;
  private eventParticipantsDb: Map<number, EventParticipant>;
  private mediaContentDb: Map<number, MediaContent>;
  
  currentUserId: number;
  currentWasteReportId: number;
  currentDonationId: number;
  currentEventId: number;
  currentEventParticipantId: number;
  currentMediaContentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    // Initialize storage
    this.usersDb = new Map();
    this.wasteReportsDb = new Map();
    this.donationsDb = new Map();
    this.eventsDb = new Map();
    this.eventParticipantsDb = new Map();
    this.mediaContentDb = new Map();
    
    // Initialize IDs
    this.currentUserId = 1;
    this.currentWasteReportId = 1;
    this.currentDonationId = 1;
    this.currentEventId = 1;
    this.currentEventParticipantId = 1;
    this.currentMediaContentId = 1;
    
    // Initialize session store
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Clear expired sessions every 24h
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "Admin0931@",
      fullName: "System Administrator",
      email: "admin@greenpath.com",
      role: "admin"
    });
    
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
    const user: User = { ...insertUser, id, createdAt: now, socialPoints: 0 };
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
    const newReport: WasteReport = { 
      ...report, 
      id, 
      createdAt: now, 
      assignedDealerId: null, 
      scheduledDate: null 
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
    const newDonation: Donation = { 
      ...donation, 
      id, 
      createdAt: now, 
      requestedByOrganizationId: null 
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
    const newEvent: Event = { ...event, id, createdAt: now };
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
    const newContent: MediaContent = { ...content, id, createdAt: now };
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
        const reportDate = new Date(report.createdAt);
        return reportDate.getMonth() === monthIndex;
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
      
      // Get reports from that month
      const monthReports = completedReports.filter(report => {
        const reportDate = new Date(report.createdAt);
        return reportDate.getMonth() === monthIndex;
      });
      
      const segregated = monthReports.filter(report => report.isSegregated).length;
      const mixed = monthReports.length - segregated;
      
      monthlyWasteData.push({
        month,
        segregated: Math.max(segregated, 0),
        mixed: Math.max(mixed, 0)
      });
    }
    
    // Donations by category
    const donations = Array.from(this.donationsDb.values());
    const completedDonations = donations.filter(donation => donation.status === 'completed');
    
    const clothingCount = completedDonations.filter(donation => 
      donation.category.toLowerCase().includes('cloth') || 
      donation.description.toLowerCase().includes('cloth')
    ).length;
    
    const furnitureCount = completedDonations.filter(donation => 
      donation.category.toLowerCase().includes('furniture') || 
      donation.description.toLowerCase().includes('furniture')
    ).length;
    
    const electronicsCount = completedDonations.filter(donation => 
      donation.category.toLowerCase().includes('electronic') || 
      donation.description.toLowerCase().includes('electronic')
    ).length;
    
    const booksCount = completedDonations.filter(donation => 
      donation.category.toLowerCase().includes('book') || 
      donation.description.toLowerCase().includes('book')
    ).length;
    
    const otherDonations = completedDonations.length - clothingCount - furnitureCount - electronicsCount - booksCount;
    
    const donationsByCategory = [
      { name: 'Clothing', value: Math.max(clothingCount, 1) },
      { name: 'Furniture', value: Math.max(furnitureCount, 1) },
      { name: 'Electronics', value: Math.max(electronicsCount, 1) },
      { name: 'Books', value: Math.max(booksCount, 1) },
      { name: 'Other', value: Math.max(otherDonations, 1) }
    ];
    
    // Social impact metrics
    const socialImpactMetrics = [
      { name: 'Lives Impacted', value: completedDonations.length * 3 }, // Estimate 3 people impacted per donation
      { name: 'Communities Reached', value: Math.ceil(completedReports.length / 5) }, // Rough estimate
      { name: 'Volunteer Hours', value: this.eventsDb.size * 20 }, // Estimate 20 hours per event
      { name: 'Social Initiatives', value: this.eventsDb.size }
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
