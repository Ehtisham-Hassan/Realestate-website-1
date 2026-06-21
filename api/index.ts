import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Pool } from "pg";
import { Listing, Inquiry } from "./src/types.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Postgres Pool
// Neon provides a connection string like: postgres://user:pass@ep-cool-darkness-123.us-east-2.aws.neon.tech/neondb
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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

// Helper to map DB row to Listing interface
const mapListingRow = (row: any) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  price: Number(row.price),
  address: row.address,
  city: row.city,
  state: row.state,
  bedrooms: Number(row.bedrooms),
  bathrooms: Number(row.bathrooms),
  areaSqFt: row.area_sq_ft,
  imageUrl: row.image_url,
  propertyType: row.property_type,
  listingType: row.listing_type,
  status: row.status,
  yearBuilt: row.year_built,
  features: row.features || [],
  featured: row.featured,
  createdAt: row.created_at
});

// Helper to map DB row to Inquiry interface
const mapInquiryRow = (row: any) => ({
  id: row.id,
  propertyId: row.property_id,
  propertyTitle: row.property_title,
  clientName: row.client_name,
  clientEmail: row.client_email,
  clientPhone: row.client_phone,
  message: row.message,
  status: row.status,
  createdAt: row.created_at
});

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
app.get("/api/listings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM listings ORDER BY created_at DESC");
    res.json(result.rows.map(mapListingRow));
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Database error fetching listings" });
  }
});

// GET single property (public)
app.get("/api/listings/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM listings WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(mapListingRow(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: "Database error fetching listing" });
  }
});

// POST new listing (Admin only)
app.post("/api/listings", verifyAdminToken, async (req, res) => {
  try {
    const newId = "lst-" + Math.random().toString(36).substr(2, 9);
    const {
      title, description, price, address, city, state, bedrooms, bathrooms,
      areaSqFt, imageUrl, propertyType, listingType, status, yearBuilt, features, featured
    } = req.body;
    
    if (!title || !price || !address) {
      return res.status(400).json({ error: "Title, Price, and Address are required" });
    }

    const query = `
      INSERT INTO listings (
        id, title, description, price, address, city, state, bedrooms, bathrooms,
        area_sq_ft, image_url, property_type, listing_type, status, year_built, features, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;
    const values = [
      newId, title, description || "", price, address, city || "", state || "", bedrooms || 0, bathrooms || 0,
      areaSqFt || 0, imageUrl || null, propertyType || "House", listingType || "Sale", status || "Active", 
      yearBuilt || null, features || [], featured || false
    ];

    const result = await pool.query(query, values);
    res.status(201).json(mapListingRow(result.rows[0]));
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ error: "Failed to create listing" });
  }
});

// PUT update listing (Admin only)
app.put("/api/listings/:id", verifyAdminToken, async (req, res) => {
  try {
    const {
      title, description, price, address, city, state, bedrooms, bathrooms,
      areaSqFt, imageUrl, propertyType, listingType, status, yearBuilt, features, featured
    } = req.body;

    const query = `
      UPDATE listings SET
        title = $1, description = $2, price = $3, address = $4, city = $5, state = $6,
        bedrooms = $7, bathrooms = $8, area_sq_ft = $9, image_url = $10, property_type = $11,
        listing_type = $12, status = $13, year_built = $14, features = $15, featured = $16
      WHERE id = $17
      RETURNING *
    `;
    const values = [
      title, description, price, address, city, state, bedrooms, bathrooms,
      areaSqFt, imageUrl, propertyType, listingType, status, yearBuilt, features, featured,
      req.params.id
    ];

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json(mapListingRow(result.rows[0]));
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// DELETE listing (Admin only)
app.delete("/api/listings/:id", verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM listings WHERE id = $1 RETURNING id", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Listing not found" });
    }
    res.json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

// GET all client inquiries (Admin only)
app.get("/api/inquiries", verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inquiries ORDER BY created_at DESC");
    res.json(result.rows.map(mapInquiryRow));
  } catch (error) {
    res.status(500).json({ error: "Database error fetching inquiries" });
  }
});

// POST submit client inquiry (Public)
app.post("/api/inquiries", async (req, res) => {
  try {
    const newId = "inq-" + Math.random().toString(36).substr(2, 9);
    const { propertyId, propertyTitle, clientName, clientEmail, clientPhone, message } = req.body;

    if (!propertyId || !clientName || !clientEmail || !message) {
      return res.status(400).json({ error: "Missing required inquiry details" });
    }

    const query = `
      INSERT INTO inquiries (id, property_id, property_title, client_name, client_email, client_phone, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      newId, propertyId, propertyTitle || "Unspecified Property", clientName, clientEmail, clientPhone || "", message, "New"
    ];

    const result = await pool.query(query, values);
    res.status(201).json(mapInquiryRow(result.rows[0]));
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    res.status(500).json({ error: "Failed to submit inquiry" });
  }
});

// PUT update inquiry status (Admin only)
app.put("/api/inquiries/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (status !== "New" && status !== "Contacted" && status !== "Archived") {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await pool.query("UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    res.json(mapInquiryRow(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: "Failed to update inquiry status" });
  }
});

// GET overall admin dashboard stats (Admin only)
app.get("/api/admin/stats", verifyAdminToken, async (req, res) => {
  try {
    const listingsResult = await pool.query("SELECT status, price FROM listings");
    const inquiriesResult = await pool.query("SELECT status FROM inquiries");

    const listings = listingsResult.rows;
    const inquiries = inquiriesResult.rows;

    const totalListings = listings.length;
    const activeListings = listings.filter(l => l.status === "Active").length;
    const pendingListings = listings.filter(l => l.status === "Pending").length;
    const soldListings = listings.filter(l => l.status === "Sold").length;
    
    const totalValue = listings.reduce((sum, item) => sum + Number(item.price), 0);

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
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
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
    
    const result = await pool.query("SELECT id, title, price, city, property_type, listing_type, bedrooms, bathrooms FROM listings WHERE status = 'Active'");
    const catalogSnippet = result.rows.map(mapListingRow);
    
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
    
    let aiResult;
    try {
      aiResult = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", cleanedText);
      aiResult = { reply: "I apologize, but I couldn't format my response properly. Please try again.", listingIds: [] };
    }

    res.json(aiResult);
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: "Failed to generate response from AI." });
  }
});

// Export the app for Vercel serverless functions
export default app;

// --- VITE DEV MIDDLEWARE OR PRODUCTION SERVING ---
// Only start the server if not running in a serverless environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
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
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
    });
  }
  startServer();
}
