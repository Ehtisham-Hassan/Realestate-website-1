import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Listing, Inquiry } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

const LISTINGS_FILE = path.join(process.cwd(), "listings.json");
const INQUIRIES_FILE = path.join(process.cwd(), "inquiries.json");

// Default listings
const DEFAULT_LISTINGS: Listing[] = [
  {
    id: "lst-1",
    title: "Sleek Contemporary Villa",
    description: "This architectural masterpiece showcases flawless modern design, boasting an expansive open-concept floor plan, double-height ceilings, and premium floor-to-ceiling glass walls that frame panoramic canyon views. Ideal for entertaining and luxury living.",
    price: 3450000,
    address: "8842 Sunset Crest Dr",
    city: "Beverly Hills",
    state: "CA",
    bedrooms: 5,
    bathrooms: 6,
    areaSqFt: 5800,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    propertyType: "House",
    listingType: "Sale",
    status: "Active",
    yearBuilt: 2022,
    features: ["Pool", "Wine Cellar", "Smarthome System", "3-Car Garage", "Home Theater"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "lst-2",
    title: "Oceanfront Sunset Paradise",
    description: "Located on Malibu's ultra-exclusive shoreline, this oceanfront cottage offers unobstructed views of the Pacific Ocean. Complete with massive wrapping decks, private beach access, a state-of-the-art chef's kitchen, and luxurious master quarters.",
    price: 5200000,
    address: "22814 Pacific Coast Hwy",
    city: "Malibu",
    state: "CA",
    bedrooms: 3,
    bathrooms: 3.5,
    areaSqFt: 3400,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    propertyType: "House",
    listingType: "Sale",
    status: "Active",
    yearBuilt: 2019,
    features: ["Ocean View", "Private Beach Access", "Spacious Deck", "Chef's Kitchen", "Hot Tub"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "lst-3",
    title: "Sophisticated Midtown Penthouse",
    description: "Soaring high above the sparkling city lights, this stunning high-floor penthouse represents urban luxury at its finest. Features bespoke white oak floors, automated custom gallery lighting, sub-zero appliances, and an expansive private terrace.",
    price: 1850000,
    address: "412 Park Ave, Apt 18B",
    city: "New York",
    state: "NY",
    bedrooms: 2,
    bathrooms: 2,
    areaSqFt: 1850,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    propertyType: "Apartment",
    listingType: "Sale",
    status: "Active",
    yearBuilt: 2015,
    features: ["City Skyline View", "24/7 Doorman", "Private Terrace", "Gym Access", "Storage Space"],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "lst-4",
    title: "Chic Minimalist Townhouse",
    description: "Nestled in Seattle's highly-sought historic Capitol Hill district, this beautiful multi-level townhouse features passive-house certifications, radiant hydronic floor heating, an intimate private garden, and a fully solar-equipped rooftop deck.",
    price: 980000,
    address: "1410 E Harrison St",
    city: "Seattle",
    state: "WA",
    bedrooms: 3,
    bathrooms: 2.5,
    areaSqFt: 2100,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    propertyType: "Townhouse",
    listingType: "Sale",
    status: "Active",
    yearBuilt: 2021,
    features: ["Rooftop Deck", "Solar Panels", "Private Garden", "Heated Floors", "EV Charger"],
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "lst-5",
    title: "Luxury Condo with Water Views",
    description: "Indulge in resort-style lifestyle in this breezy waterfront condominium. Offering a beautifully open galley kitchen, top-tier Bosch appliances, expansive views of the marina, and 24-hour luxury concierge and security services.",
    price: 4200,
    address: "800 Brickell Ave, Apt 304",
    city: "Miami",
    state: "FL",
    bedrooms: 1,
    bathrooms: 1.5,
    areaSqFt: 1100,
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    propertyType: "Condo",
    listingType: "Rent",
    status: "Active",
    yearBuilt: 2018,
    features: ["Marina View", "Concierge Service", "Pool & Spa", "Fitness Center", "Valet Parking"],
    featured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "lst-6",
    title: "Modern Craftsman Sanctuary",
    description: "Quietly secluded amid magnificent native pecans and oaks, this striking architectural custom-cut residence blends natural textures with steel framing. Features massive covered living corridors, separate guest quarters, and designer curated lighting.",
    price: 1450000,
    address: "3104 Cedar Blvd",
    city: "Austin",
    state: "TX",
    bedrooms: 4,
    bathrooms: 3.5,
    areaSqFt: 3600,
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
    propertyType: "House",
    listingType: "Sale",
    status: "Pending",
    yearBuilt: 2020,
    features: ["Wooded Yard", "Guest House", "Covered Porch", "Fireplace", "Vaulted Ceilings"],
    featured: false,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    propertyId: "lst-1",
    propertyTitle: "Sleek Contemporary Villa",
    clientName: "Eleanor Vance",
    clientEmail: "eleanor.v@example.com",
    clientPhone: "+1 (310) 555-0198",
    message: "Hello, I am extremely interested in this estate. Can we schedule a private showing for next Tuesday?",
    status: "New",
    createdAt: new Date().toISOString()
  },
  {
    id: "inq-2",
    propertyId: "lst-3",
    propertyTitle: "Sophisticated Midtown Penthouse",
    clientName: "David Harris",
    clientEmail: "david.harris@example.com",
    clientPhone: "+1 (212) 555-0322",
    message: "Does the penthouses HOA covers gas, water, and building amenities? Also, does the unit come with the custom artwork?",
    status: "Contacted",
    createdAt: new Date().toISOString()
  }
];

// Read listings helper
const getListings = (): Listing[] => {
  try {
    if (fs.existsSync(LISTINGS_FILE)) {
      const raw = fs.readFileSync(LISTINGS_FILE, "utf-8");
      return JSON.parse(raw);
    } else {
      fs.writeFileSync(LISTINGS_FILE, JSON.stringify(DEFAULT_LISTINGS, null, 2));
      return DEFAULT_LISTINGS;
    }
  } catch (err) {
    console.error("Error reading listings, reverting to defaults", err);
    return DEFAULT_LISTINGS;
  }
};

// Write listings helper
const writeListings = (data: Listing[]) => {
  try {
    fs.writeFileSync(LISTINGS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing listings file:", err);
  }
};

// Read inquiries helper
const getInquiries = (): Inquiry[] => {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const raw = fs.readFileSync(INQUIRIES_FILE, "utf-8");
      return JSON.parse(raw);
    } else {
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(DEFAULT_INQUIRIES, null, 2));
      return DEFAULT_INQUIRIES;
    }
  } catch (err) {
    console.error("Error reading inquiries, reverting to defaults", err);
    return DEFAULT_INQUIRIES;
  }
};

// Write inquiries helper
const writeInquiries = (data: Inquiry[]) => {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing inquiries file:", err);
  }
};

// Simple Authentication token helper
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const verifyAdminToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access. No passcode provided." });
  }
  const token = authHeader.split(" ")[1];
  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Forbidden. Invalid passcode." });
  }
  next();
};

// --- API ENDPOINTS ---

// Admin Verify Passage
app.post("/api/admin/verify", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ error: "Invalid admin password" });
});

// GET list of properties (public)
app.get("/api/listings", (req, res) => {
  const listings = getListings();
  res.json(listings);
});

// GET single property (public)
app.get("/api/listings/:id", (req, res) => {
  const listings = getListings();
  const listing = listings.find(l => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json(listing);
});

// POST new listing (Admin only)
app.post("/api/listings", verifyAdminToken, (req, res) => {
  try {
    const listings = getListings();
    const newListing: Listing = {
      ...req.body,
      id: "lst-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    // Validate required fields
    if (!newListing.title || !newListing.price || !newListing.address) {
      return res.status(400).json({ error: "Title, Price, and Address are required" });
    }

    listings.unshift(newListing);
    writeListings(listings);
    res.status(201).json(newListing);
  } catch (error) {
    res.status(500).json({ error: "Failed to create listing" });
  }
});

// PUT update listing (Admin only)
app.put("/api/listings/:id", verifyAdminToken, (req, res) => {
  try {
    const listings = getListings();
    const index = listings.findIndex(l => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Keep ID and Creation timestamp intact
    const original = listings[index];
    const updatedListing: Listing = {
      ...original,
      ...req.body,
      id: original.id,
      createdAt: original.createdAt
    };

    listings[index] = updatedListing;
    writeListings(listings);
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// DELETE listing (Admin only)
app.delete("/api/listings/:id", verifyAdminToken, (req, res) => {
  try {
    const listings = getListings();
    const filtered = listings.filter(l => l.id !== req.params.id);
    if (filtered.length === listings.length) {
      return res.status(404).json({ error: "Listing not found" });
    }
    writeListings(filtered);
    res.json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

// GET all client inquiries (Admin only)
app.get("/api/inquiries", verifyAdminToken, (req, res) => {
  const inquiries = getInquiries();
  res.json(inquiries);
});

// POST submit client inquiry (Public)
app.post("/api/inquiries", (req, res) => {
  try {
    const inquiries = getInquiries();
    const { propertyId, propertyTitle, clientName, clientEmail, clientPhone, message } = req.body;

    if (!propertyId || !clientName || !clientEmail || !message) {
      return res.status(400).json({ error: "Missing required inquiry details (property, name, email, message)" });
    }

    const newInquiry: Inquiry = {
      id: "inq-" + Math.random().toString(36).substr(2, 9),
      propertyId,
      propertyTitle: propertyTitle || "Unspecified Property",
      clientName,
      clientEmail,
      clientPhone: clientPhone || "",
      message,
      status: "New",
      createdAt: new Date().toISOString()
    };

    inquiries.unshift(newInquiry);
    writeInquiries(inquiries);
    res.status(201).json(newInquiry);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

// PUT update inquiry status (Admin only)
app.put("/api/inquiries/:id/status", verifyAdminToken, (req, res) => {
  try {
    const inquiries = getInquiries();
    const index = inquiries.findIndex(inq => inq.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    const { status } = req.body;
    if (status !== "New" && status !== "Contacted" && status !== "Archived") {
      return res.status(400).json({ error: "Invalid status value" });
    }

    inquiries[index].status = status;
    writeInquiries(inquiries);
    res.json(inquiries[index]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
});

// GET overall admin dashboard stats (Admin only)
app.get("/api/admin/stats", verifyAdminToken, (req, res) => {
  const listings = getListings();
  const inquiries = getInquiries();

  const totalListings = listings.length;
  const activeListings = listings.filter(l => l.status === "Active").length;
  const pendingListings = listings.filter(l => l.status === "Pending").length;
  const soldListings = listings.filter(l => l.status === "Sold").length;
  
  const totalValue = listings.reduce((sum, item) => {
    // If it is rent, add monthly rent scaled, or just count rent value as-is
    return sum + item.price;
  }, 0);

  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter(i => i.status === "New").length;

  res.json({
    totalListings,
    activeListings,
    pendingListings,
    soldListings,
    totalValue,
    totalInquiries,
    newInquiries
  });
});

// POST Chatbot AI Assistant Endpoint (Public)
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server is missing Gemini API Key configuration." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const listings = getListings().filter(l => l.status === "Active"); // only suggest active ones
    
    // Provide a trimmed version of the catalog to save tokens
    const catalogSnippet = listings.map(l => ({ 
      id: l.id, 
      title: l.title, 
      price: l.price, 
      city: l.city, 
      propertyType: l.propertyType, 
      listingType: l.listingType,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms
    }));

    const systemPrompt = `You are a helpful and professional real estate assistant for Vantage Real Estate.
Here is the current catalog of active properties:
${JSON.stringify(catalogSnippet)}

Respond to the user's query thoughtfully. If the user asks for properties, or if recommending specific properties is relevant to their question, include their listing IDs in the 'listingIds' array.
Output your response STRICTLY as a raw JSON object with the following schema:
{
  "reply": "Your textual response here. Keep it concise, helpful, and friendly. Do not use markdown.",
  "listingIds": ["id1", "id2"] // Array of property IDs you want to show the user. Empty array if none.
}
Do NOT wrap the JSON in markdown blocks (e.g., no \`\`\`json). Just return the raw JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nUser: ${message}`,
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let result;
    try {
      result = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", cleanedText);
      result = { reply: "I apologize, but I couldn't format my response properly. Please try again.", listingIds: [] };
    }

    res.json(result);
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response from AI." });
  }
});

// --- VITE DEV MIDDLEWARE OR PRODUCTION SERVING ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback route for any unmatched requests
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
