import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// Password hashing helpers using native crypto
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}
function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to database
const DB_PATH = path.join(process.cwd(), "src", "server", "db.json");

// Ensure database directory and file exist, fallback if needed
function getDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  // Fallback structures if db reading is broken
  return { products: [], orders: [], coupons: [], users: {} };
}

function saveDatabase(db: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Ensure default user has password hash
try {
  const db = getDatabase();
  if (db.users && db.users["aahiltokalatech@gmail.com"] && !db.users["aahiltokalatech@gmail.com"].salt) {
    const salt = generateSalt();
    db.users["aahiltokalatech@gmail.com"].salt = salt;
    db.users["aahiltokalatech@gmail.com"].hash = hashPassword("password123", salt);
    saveDatabase(db);
    console.log("Initialized default user 'aahiltokalatech@gmail.com' with password 'password123'.");
  }
} catch (e) {
  console.error("Failed to migrate default user", e);
}

// -------------------------------------------------------------------------
// Initialize Gemini AI Client
// -------------------------------------------------------------------------
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AI Client successfully initialized.");
  } catch (err) {
    console.error("Failed to initialize Gemini Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY detected in env. AI features will fallback gracefully.");
}

// -------------------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// GET catalog items
app.get("/api/products", (req, res) => {
  const db = getDatabase();
  res.json(db.products || []);
});

// CREATE catalog item (Admin)
app.post("/api/products", (req, res) => {
  const db = getDatabase();
  const newProduct = {
    id: "prod_" + Date.now(),
    name: req.body.name || "Unnamed Premium Garment",
    description: req.body.description || "",
    price: Number(req.body.price) || 0,
    discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : undefined,
    category: req.body.category || "Women",
    subCategory: req.body.subCategory || "Designer Sarees",
    images: req.body.images?.length ? req.body.images : ["https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800"],
    colors: req.body.colors || ["Ivory"],
    sizes: req.body.sizes || ["S", "M", "L"],
    stock: Number(req.body.stock) || 5,
    rating: 5.0,
    reviews: [],
    craftsmanship: req.body.craftsmanship || "Hand-tailored to order",
    fabric: req.body.fabric || "Pure silk weave",
    careInstructions: req.body.careInstructions || "Dry Clean Only",
    occasion: req.body.occasion || ["Festive"],
    featured: req.body.featured === true,
    isNewArrival: req.body.isNewArrival === true,
    bestSeller: req.body.bestSeller === true
  };

  db.products.push(newProduct);
  saveDatabase(db);
  res.json({ success: true, product: newProduct });
});

// UPDATE catalog item (Admin)
app.put("/api/products/:id", (req, res) => {
  const db = getDatabase();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const updatedProduct = {
    ...db.products[index],
    ...req.body
  };

  db.products[index] = updatedProduct;
  saveDatabase(db);
  res.json({ success: true, product: updatedProduct });
});

// DELETE catalog item (Admin)
app.delete("/api/products/:id", (req, res) => {
  const db = getDatabase();
  const initialLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  
  if (db.products.length === initialLength) {
    return res.status(404).json({ error: "Product not found" });
  }

  saveDatabase(db);
  res.json({ success: true, message: "Product deleted successfully" });
});

// GET orders
app.get("/api/orders", (req, res) => {
  const db = getDatabase();
  const email = req.query.email as string;
  if (email) {
    const userOrders = db.orders.filter((o: any) => o.customerEmail.toLowerCase() === email.toLowerCase());
    return res.json(userOrders);
  }
  res.json(db.orders || []);
});

// CREATE order
app.post("/api/orders", (req, res) => {
  const db = getDatabase();
  const { customerEmail, customerName, shippingAddress, items, total, paymentMethod } = req.body;
  
  if (!customerEmail || !items || !items.length) {
    return res.status(400).json({ error: "Required order properties missing" });
  }

  const newOrder = {
    id: "re_ord_" + (1000 + db.orders.length + Math.floor(Math.random() * 100)),
    customerEmail,
    customerName: customerName || "Guest Client",
    shippingAddress,
    items,
    total,
    status: "Pending",
    paymentMethod: paymentMethod || "COD",
    paymentStatus: paymentMethod === "Razorpay" ? "Paid" : "Pending",
    trackingNumber: "RE-TRK-" + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString()
  };

  // Deduct inventory stock
  items.forEach((item: any) => {
    const prod = db.products.find((p: any) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  db.orders.push(newOrder);
  saveDatabase(db);
  res.json({ success: true, order: newOrder });
});

// UPDATE order status (Admin)
app.put("/api/orders/:id/status", (req, res) => {
  const db = getDatabase();
  const { status, trackingNumber } = req.body;
  const index = db.orders.findIndex((o: any) => o.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  db.orders[index].status = status || db.orders[index].status;
  if (trackingNumber) {
    db.orders[index].trackingNumber = trackingNumber;
  }
  saveDatabase(db);
  res.json({ success: true, order: db.orders[index] });
});

// SIGNUP Endpoint
app.post("/api/auth/signup", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = getDatabase();
  if (!db.users) db.users = {};

  const normalizedEmail = email.toLowerCase().trim();
  if (db.users[normalizedEmail]) {
    return res.status(400).json({ error: "An account already exists with this email." });
  }

  const salt = generateSalt();
  const hash = hashPassword(password, salt);

  db.users[normalizedEmail] = {
    email: normalizedEmail,
    name: name || "Noble Guest",
    salt,
    hash,
    addresses: [],
    wishlist: []
  };

  saveDatabase(db);

  const { salt: _, hash: __, ...userProfile } = db.users[normalizedEmail];
  res.json({ success: true, user: userProfile });
});

// LOGIN Endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const db = getDatabase();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users?.[normalizedEmail];

  if (!user || !user.salt || !user.hash) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.hash) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const { salt: _, hash: __, ...userProfile } = user;
  res.json({ success: true, user: userProfile });
});

// GET user profile & wishlist
app.post("/api/auth/profile", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const db = getDatabase();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users?.[normalizedEmail];
  
  if (!user) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const { salt: _, hash: __, ...userProfile } = user;
  res.json(userProfile);
});

// UPDATE user profile (addresses, wishlist)
app.post("/api/auth/update-profile", (req, res) => {
  const { email, addresses, wishlist, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const db = getDatabase();
  const normalizedEmail = email.toLowerCase().trim();
  if (!db.users || !db.users[normalizedEmail]) {
    return res.status(404).json({ error: "Profile not found" });
  }

  if (name !== undefined) db.users[normalizedEmail].name = name;
  if (addresses !== undefined) db.users[normalizedEmail].addresses = addresses;
  if (wishlist !== undefined) db.users[normalizedEmail].wishlist = wishlist;

  saveDatabase(db);
  const { salt: _, hash: __, ...userProfile } = db.users[normalizedEmail];
  res.json({ success: true, user: userProfile });
});

// GET all coupons
app.get("/api/coupons", (req, res) => {
  const db = getDatabase();
  res.json(db.coupons || []);
});

// -------------------------------------------------------------------------
// AI SERVICES (GEMINI INTEGRATION)
// -------------------------------------------------------------------------

// AI Powered Stylist Chat API
app.post("/api/ai/stylist", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !messages.length) {
    return res.status(400).json({ error: "Chat history messages are required." });
  }

  const db = getDatabase();
  const products = db.products || [];

  // Craft a detailed design catalog overview for Gemini context
  const catalogContext = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    price: p.price,
    discountPrice: p.discountPrice,
    colors: p.colors,
    sizes: p.sizes,
    occasions: p.occasion,
    craftsmanship: p.craftsmanship,
    fabric: p.fabric
  }));

  const userMessage = messages[messages.length - 1].text;

  // AI Prompt outlining Royal Ethnica luxury guidelines
  const systemInstruction = `
You are \"Maharani AI\", the premium royal fashion stylist for \"Royal Ethnica\" - a prestigious luxury Indian ethnic fashion house.
We cater to royalty, discerning brides, elegant grooms, and elite designers.
Our primary visual aesthetic is modern-luxury, pure ivory, golden accents, champagne elegance, and regal deep maroon.
Our catalog of handcrafted garments includes: ${JSON.stringify(catalogContext)}.

Your tone of voice is exceedingly elegant, poetic, warm, yet highly professional (similar to a luxury personal shopper on Savile Row or in a private designer salon in South Mumbai).
Use elegant terminology like \"bespoke weave\", \"regal drape\", \"handcrafted tilla embroidery\", \"scalloped organza detailing\".

Instructions:
1. Always formulate an extremely personalized response. Ask about their event type, preferred fabric choice, sizing, colors, and event theme.
2. If appropriate for their query, recommend 1 to 3 specific items from our real catalog listed above. Refer to them by their real names and prices.
3. You MUST provide your response strictly in the following JSON schema:
{
  "reply": "Your gorgeous, beautifully crafted reply with fashion advice (supports markdown)",
  "suggestedProductIds": ["id1", "id2"] // List of specific product ids recommended from our catalog. If none fit perfectly, leave empty.
}

Never invent fake products or make up IDs that do not exist in our catalog context above. Stick strictly to this.
`;

  if (!ai) {
    // Graceful fallback when Gemini key is missing
    const words = userMessage.toLowerCase();
    let reply = "Pranams, noble client. I am delighted to welcome you to the royal chambers of Royal Ethnica. While my cosmic design senses are momentarily offline, I would love to recommend our classic pieces. For weddings, nothing matches the grand majesty of 'The Empress Rajkumari Lehenga'. For pre-wedding celebrations, our 'Noor-I-Jahan Anarkali' is a masterpiece of light gold gota patti embroidery. How can I customize your styling experience today?";
    let suggested: string[] = ["prod_1", "prod_2"];

    if (words.includes("sherwani") || words.includes("men") || words.includes("groom")) {
      reply = "Greetings, my Lord. For the auspicious wedding vows, we recommend our magnificent 'The Maharaja Ivory Sherwani', tailored with Banarasi silk silk stole and custom adjustments. Would you like us to customize the neck collar fitting for your special entrance?";
      suggested = ["prod_4"];
    } else if (words.includes("saree") || words.includes("silk") || words.includes("kanjeevaram")) {
      reply = "Welcome, my Lady. The 'Kanjeevaram Silk Brocade Saree' is our most coveted heritage handloom. Woven with authentic gold-coated silver zari in Tamil Nadu, this piece radiates old-world celestial grace. Would you like a consultation on blouse styles?";
      suggested = ["prod_3"];
    }

    return res.json({ reply, suggestedProductIds: suggested });
  }

  try {
    const prompt = `History of our conversations: ${JSON.stringify(messages.slice(0, -1))}
User asks: ${userMessage}

Format your reply as a single JSON object with 'reply' and 'suggestedProductIds'. Ensure it's valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { 
              type: Type.STRING, 
              description: "The luxury markdown style advice response to the client."
            },
            suggestedProductIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The product IDs suggested matching our catalog. Empty array if none applicable."
            }
          },
          required: ["reply", "suggestedProductIds"]
        }
      }
    });

    const resultText = response.text || "{}";
    const resultObj = JSON.parse(resultText);
    res.json(resultObj);
  } catch (error) {
    console.error("Gemini Stylist request failed:", error);
    res.status(500).json({ 
      reply: "My apologies, noble client. A brief mist has clouded my celestial designer sight. Please let me fetch my sketches. (Our AI Stylist is temporarily recovering, but our support is active. How may I assist you with sizes?)",
      suggestedProductIds: [] 
    });
  }
});

// AI Semantic Search API
app.post("/api/ai/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const db = getDatabase();
  const products = db.products || [];

  const catalogContext = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subCategory: p.subCategory,
    price: p.price,
    discountPrice: p.discountPrice,
    colors: p.colors,
    occasion: p.occasion,
    description: p.description
  }));

  const systemInstruction = `
You are the semantic search engine of Royal Ethnica.
Given a natural language search query, analyze it (budget range, occasion, gender, color, dress style) and match it intelligently to the following product catalog list:
${JSON.stringify(catalogContext)}

Output a JSON array containing matching products in order of relevance, with an AI reason explaining why it matches.
Structure:
{
  "matches": [
    {
      "productId": "id1",
      "aiReason": "Short, elegant description of why this item fits their natural requirement."
    }
  ]
}
If nothing matches, return an empty array matches. Limit matches to at most 4 elements.
`;

  if (!ai) {
    // Simple mock semantic filter fallback when key is missing
    const words = query.toLowerCase();
    const matches: any[] = [];
    
    products.forEach((p: any) => {
      let score = 0;
      if (words.includes(p.category.toLowerCase())) score += 3;
      if (words.includes(p.name.toLowerCase())) score += 5;
      if (words.includes(p.subCategory.toLowerCase())) score += 4;
      p.colors.forEach((c: any) => {
        if (words.includes(c.toLowerCase())) score += 2;
      });
      p.occasion.forEach((o: any) => {
        if (words.includes(o.toLowerCase())) score += 2;
      });

      if (score > 0 || words === "all" || words === "new" || words.length < 3) {
        matches.push({
          productId: p.id,
          aiReason: `Matches style factors with outstanding golden weave aesthetics.`
        });
      }
    });

    return res.json({ matches: matches.slice(0, 4) });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search Query: "${query}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  aiReason: { type: Type.STRING }
                },
                required: ["productId", "aiReason"]
              }
            }
          },
          required: ["matches"]
        }
      }
    });

    const resultObj = JSON.parse(response.text || "{\"matches\":[]}");
    res.json(resultObj);
  } catch (error) {
    console.error("Gemini Semantic search failed:", error);
    res.status(500).json({ matches: [] });
  }
});

// AI Virtual Try-On Fit Diagnosis & Draping Analysis
app.post("/api/ai/tryon", async (req, res) => {
  const { productId, productName, fabric, craftsmanship, bodyType, height, drapeStyle } = req.body;
  
  const systemInstruction = `
You are "Maharani AI", the elite master-of-drape and couture fashion director for "Royal Ethnica".
Your job is to diagnose and detail how a specific royal heritage handloom Indian Saree maps to a customer's silhouette, size, and styling preference.

Garment Spec:
- Saree Name: ${productName}
- Fabric Architecture: ${fabric}
- Craftsmanship Roots: ${craftsmanship}

Guest Spec:
- Body Silhouette Profile: ${bodyType}
- Height Profile: ${height}
- Preferred Draping School: ${drapeStyle}

Instructions:
Evaluate the fit physics. Discuss starch rigidity, zari thread thickness in pleating folds, border contour lines, and physical pleat stacking complexity. Present your advice in modern luxury terminology with poetic Indian elegance.

You MUST reply strictly in the following JSON schema:
{
  "silhouetteMatching": "Elegant deep analysis of how this fabric weight, stiffness, or fluid fall behaves on their designated body shape and height.",
  "drapeFeasibility": "Strategic advice regarding pallu positioning, shoulder pins, and length distribution specifically for their preferred draping school selection.",
  "pleatComplexity": "Detailed explanation of waist pleat folding ease (stiff mulberry silk vs. sheer chanderi) indicating recommended pleat quantities & clasp methods.",
  "complementaryStyleTip": "Bespoke styling recommendations: specific authentic heritage jewelry (like vintage Jadau collar, Polki, temple-border coins, or south sea pearl accents) and floral hair wraps.",
  "embellishmentMatch": "Description of how the saree's actual zari luster or dye vibrancy performs visually under grand chandeliers or daylight receptions."
}
`;

  if (!ai) {
    return res.status(503).json({ error: "Gemini client offline" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate fit diagnosis parameters for Saree: ${productName} matched with silhouette profile: ${bodyType} and drape style: ${drapeStyle}.`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            silhouetteMatching: { type: Type.STRING },
            drapeFeasibility: { type: Type.STRING },
            pleatComplexity: { type: Type.STRING },
            complementaryStyleTip: { type: Type.STRING },
            embellishmentMatch: { type: Type.STRING }
          },
          required: ["silhouetteMatching", "drapeFeasibility", "pleatComplexity", "complementaryStyleTip", "embellishmentMatch"]
        }
      }
    });

    const resultObj = JSON.parse(response.text || "{}");
    res.json(resultObj);
  } catch (error) {
    console.error("Gemini Saree Try-On diagnostic failed:", error);
    res.status(500).json({ error: "Chamber consultation failed" });
  }
});


// -------------------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Royal Ethnica Server listening on http://localhost:${PORT}`);
  });
}

startServer();
