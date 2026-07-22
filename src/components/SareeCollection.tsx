import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, 
  Clock, 
  Scissors, 
  Award, 
  Sparkles, 
  Heart, 
  Eye, 
  ShoppingCart, 
  BookOpen, 
  CheckCircle2, 
  RefreshCw, 
  Compass, 
  Layers, 
  ArrowRight,
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Info
} from "lucide-react";
import { Product } from "../types";

interface SareeCollectionProps {
  products: Product[];
  currentCurrency: string;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onNavigateToCatalog: (category: string, subCategoryName?: string) => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface SareeTypeInfo {
  key: string;
  name: string;
  tagline: string;
  description: string;
  origin: string;
  state: string;
  loomType: string;
  weaverHours: string;
  zariGrade: string;
  historyText: string;
  imageUrl: string;
  careInstructions: string;
  drapeRecommendation: string;
  matchingSubCategory: string; // matches product.subCategory in db.json
}

// Highly detailed curated data with high-quality specific Unsplash images
const SAREE_TYPES: SareeTypeInfo[] = [
  {
    key: "kanjeevaram",
    name: "Kanjeevaram Pure Silk",
    tagline: "The Temple Border Masterpiece",
    description: "Revered as the queen of South Indian handlooms, Kanjeevaram sarees showcase striking contrasting panels joined by the masterful Korvai interlocking technique, representing timeless temple architecture.",
    origin: "Kanchipuram near Chennai",
    state: "Tamil Nadu",
    loomType: "Korvai Multi-Shuttle Heavy Frame Handlooms",
    weaverHours: "240 to 360 Hours",
    zariGrade: "Double-twisted Mulberry Silk with pure gold-plated sterling silver wires",
    historyText: "According to ancient folklore, Kanchi silk weavers are believed to be the descendants of Sage Markanda, the master weaver of God himself. Every thread is reinforced with pristine sizing for unmatched drape weight.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
    careInstructions: "Store wrapped in unbleached cotton muslin sheets. Rotate fold panels quarterly to protect silk creases from snapping.",
    drapeRecommendation: "Classic Nivi style with neat pleats and a structured shoulder pallu pinned in place.",
    matchingSubCategory: "Silk Sarees"
  },
  {
    key: "banarasi",
    name: "Shahi Banarasi Brocade",
    tagline: "The Golden Loom of Peeli Kothi",
    description: "An opulent imperial treasure woven in Varanasi. Renowned for its rich shikargah hunting maps, delicate floral bel buttis, and intricate sterling silver brocade panels heavily layered in gold gilt.",
    origin: "Peeli Kothi, Varanasi (Kashi)",
    state: "Uttar Pradesh",
    loomType: "Traditional Banarasi Pit Looms with intricate Naksha Jaala mechanisms",
    weaverHours: "450 to 600 Hours",
    zariGrade: "22-Karat molten Gold dipped over sterling Silver tilla wires on pure Katan Silk warp",
    historyText: "Introduced to ultimate peak prestige during the Mughal Era under Emperor Akbar, Banarasi weavers merged Indian motifs with Persian floral tapestries, establishing the royal court style of Lucknow and Delhi.",
    imageUrl: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800",
    careInstructions: "Dry clean only. Air twice per season in complete shade to protect silver threads from oxidising.",
    drapeRecommendation: "Rich royal drape with floating loose pallu draped elegantly over the forearm.",
    matchingSubCategory: "Silk Sarees"
  },
  {
    key: "chanderi",
    name: "Sheer Chanderi Kora",
    tagline: "The Light as Mountain Mist Drape",
    description: "Unbelievably translucent, sheer and light. Woven by blending premium silk warp with extra fine hand-spun cotton weft, giving birth to a glossy, lightweight texture highlighted by individually woven coin butis.",
    origin: "Chanderi region, Malwa",
    state: "Madhya Pradesh",
    loomType: "Underground-pit throw-shuttle looms using natural sizing starches",
    weaverHours: "90 to 120 Hours",
    zariGrade: "Genuine Copper wire coated with authentic Gold alloy plating",
    historyText: "Dating back to the 13th century, Chanderi fabric was highly sought after by royal houses for its delicate weightlessness. Legend states that the sheer drape was like water flowing down the body.",
    imageUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800",
    careInstructions: "Delicate dry cleaning. Avoid heavy pins or sharp safety brooches to prevent snags on the gossamer panels.",
    drapeRecommendation: "Pleated waist with a sheer fluid cowl cascade, perfect for warm day-festivals.",
    matchingSubCategory: "Designer Sarees"
  },
  {
    key: "paithani",
    name: "Royal Golden Paithani",
    tagline: "The Maharani Mosaic Tapestry",
    description: "Historically donned by the royalty of Maharashtra, this masterpiece boasts borders woven like glowing metal and a mesmerizing tapestry pallu detailing multicolored handloom peacocks, parrots, and lotuses.",
    origin: "Paithan near Aurangabad",
    state: "Maharashtra",
    loomType: "Double-warp handlooms working with multiple wooden bobbins simultaneously",
    weaverHours: "300 to 500 Hours",
    zariGrade: "Pure gold-gilded premium silver borders on high-twist raw natural silk.",
    historyText: "Worn by Maratha queens and Deccan royalty, Paithani represents the finest tapestry weaving where warp and weft meet in complete harmony, ensuring both sides of the saree are visually identical.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
    careInstructions: "Do not spray water or perfume directly onto the gold panel. Hand-wipe with a clean dry cotton swab if required.",
    drapeRecommendation: "Traditional Maharashtrian Nauvari (9-yard style) or regular Nivi drape with broad border show-off.",
    matchingSubCategory: "Silk Sarees"
  },
  {
    key: "patola",
    name: "Patan Double-Ikat Patola",
    tagline: "The Sacred Mathematical Geometry",
    description: "A legendary masterpiece of mind-boggling precision. Both warp and weft threads are independently hand-dyed using organic vegetable dyes prior to weaving so that geometric patterns align perfectly on the loom.",
    origin: "Patan, Northern Plains",
    state: "Gujarat",
    loomType: "Slanted single-harness rosewood loom adjusted by two master craftsmen",
    weaverHours: "1000 to 1500 Hours (takes up to 6 months)",
    zariGrade: "Zero metallic zari; relies purely on the majestic sheen of pure double-ikat high-twist silk",
    historyText: "Regarded as a sacred textile in Gujarat and Indonesia, Patola was historically presented as royal gifts. Authentic Patan items are completely reversible, presenting the same rich colors on both faces.",
    imageUrl: "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?q=80&w=800",
    careInstructions: "Museum-grade heirloom. Store flat inside cedar wood storage panels. Avoid direct alcohol perfumes.",
    drapeRecommendation: "Classic pleated drape with a broad front-facing Gujarati styled seeds pallu to show off ikat geometry.",
    matchingSubCategory: "Silk Sarees"
  },
  {
    key: "chikankari",
    name: "Awadhi Chikankari Saree",
    tagline: "The Moonlight on Soft Muslin",
    description: "An ethereal and dreamy georgette masterpiece showing Lucknow's signature shadow thread embroidery. Adorned with delicate bakhia stitches and finished with shining sterling silver mukaish wire droplets.",
    origin: "Lucknow, Awadh Province",
    state: "Uttar Pradesh",
    loomType: "Hand-embroidery over fine handloom georgette weaves",
    weaverHours: "180 to 250 artisan hand-stitch hours",
    zariGrade: "Intermittent sterling silver hand-twisted Mukaish stars and tilla thread contours",
    historyText: "Popularised by Empress Nur Jahan, this fine embroidery was meant to emulate white snowflakes resting on translucent royal muslin sheets, offering unrivaled daytime elegance.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800",
    careInstructions: "Dry clean. Store wrapped in acid-free tissue paper sheets to maintain silver brilliance.",
    drapeRecommendation: "Soft floating drape without pins, letting the sheer georgette gather gracefully on the side.",
    matchingSubCategory: "Designer Sarees"
  }
];

const DRAPE_STYLES = [
  {
    name: "Nivi Imperial Drape",
    difficulty: "Beginner Friendly",
    description: "The classic and universal draping origin of Indian modern times. Features neat waist pleats tucked comfortably into the petticoat center, with a structured flow of pallu resting on the left shoulder.",
    steps: [
      "Tuck the inner end of the saree around the waist completely.",
      "Track the remaining fabric to create 6-8 uniform pleats at the waist center.",
      "Tuck the pleats securely, ensuring a flat contour around the tummy.",
      "Gather the rest of the fabric, adjust length, and pin the pallu in place over the left-hand shoulder."
    ]
  },
  {
    name: "Gujarati Seedha Pallu",
    difficulty: "Regal Elegant",
    description: "Saught after in western states, this drape styles the pallu to fall gracefully from back-to-front over the right shoulder. Best suited to show off double-ikat Patola grids or heavy zari borders.",
    steps: [
      "Drape the saree and tuck the base uniformly around the waist.",
      "Form standard waist pleats and tuck at the center left, angling slightly towards the right.",
      "Take the inner pallu around your back and pull it over the right shoulder from back to front.",
      "Spread out the decorative border wide across the chest and pin it at the left hip."
    ]
  },
  {
    name: "Athpouria Bengali Heritage",
    difficulty: "Grand Celebration",
    description: "A beautiful box-pleated box contour drape traditional to Bengal. Features double front-facing pallu displays that showcase fine cotton-silk sheers or rich red borders perfectly.",
    steps: [
      "Tuck the saree starting from the right side, completing one neat circle around the waist.",
      "Instead of pleats, fold the fabric into broad box layers across the front hip area.",
      "Take the pallu, gather neatly, and throw it over the left shoulder.",
      "Take the right tip of the pallu under the armpit and throw it over the right shoulder from back to front."
    ]
  },
  {
    name: "Maharashtrian Nauvari",
    difficulty: "Artistic / Masterclass",
    description: "An ancient warrior-queen 9-yard drape styled between the legs as custom trousers. Beautifully paired with a royal Paithani silk, offering absolute leg movement flexibility during traditional festivities.",
    steps: [
      "Use a longer 9-yard saree piece. Tie a secure center knot near the navel.",
      "Take the bottom hem portion between your legs and tuck it tightly into the back center waist.",
      "Drape the remaining sheets neatly over the chest and shoulder like an absolute protective shield.",
      "Drape the heavy embroidered peacock pallu down the side for a cascading tapestry effect."
    ]
  }
];

export default function SareeCollection({
  products,
  currentCurrency,
  onAddToCart,
  onViewProduct,
  wishlist,
  onToggleWishlist,
  onNavigateToCatalog,
  showToast
}: SareeCollectionProps) {
  // Navigation & interaction states
  const [activeMainTab, setActiveMainTab] = useState<"heritage" | "categories" | "collections" | "brands" | "accessories" | "tryon">("heritage");
  const [activeSareeKey, setActiveSareeKey] = useState<string>("banarasi");
  const [selectedDrapeIndex, setSelectedDrapeIndex] = useState<number>(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Custom interactive quiz states
  const [quizOccasion, setQuizOccasion] = useState<string>("");
  const [quizWeight, setQuizWeight] = useState<string>("");
  const [quizDesign, setQuizDesign] = useState<string>("");
  const [quizRecommendation, setQuizRecommendation] = useState<SareeTypeInfo | null>(null);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  // AI tryon rotation simulation states
  const [tryonSelectedCategory, setTryonSelectedCategory] = useState<string>("banarasi");
  const [tryonAngle, setTryonAngle] = useState<number>(0); // 0 to 360
  const [tryonPlaying, setTryonPlaying] = useState<boolean>(false);
  const [tryonSelectedColor, setTryonSelectedColor] = useState<string>("Cherry Gold");

  // Filter category helper state for Accessories tab
  const [selectedAccessorySub, setSelectedAccessorySub] = useState<string>("All");

  // Simulation timer for 360 auto rotate
  useEffect(() => {
    let interval: any;
    if (tryonPlaying) {
      interval = setInterval(() => {
        setTryonAngle((prev) => (prev + 45) % 360);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tryonPlaying]);

  // Data details for Categories Tab
  const REGIONAL_CATEGORIES = [
    {
      region: "North India",
      tagline: "Royal brocades & imperial needlework",
      items: [
        { name: "Banarasi Saree (Uttar Pradesh)", subName: "Zari brocades, pit looms", details: "Opulent pure silk layered with 22kt liquid gold guilding." },
        { name: "Chikankari Saree", subName: "Shadow lock embroidery", details: "Ethereal translucent georgette hand-stitched in Lucknow." },
        { name: "Kota Doria Saree", subName: "Light weight grid Khats", details: "Gossamer summer weaves made by fine cotton-silk blends." },
        { name: "Lucknowi Saree", subName: "Tilla shadow trims", details: "Prestige thread works portraying mughal courtyard details." }
      ]
    },
    {
      region: "South India",
      tagline: "Temple borders & resilient dual contrast threads",
      items: [
        { name: "Kanjeevaram / Kanchipuram Saree", subName: "Korvai interlock border", details: "Prestige mulberry silk representing cosmic stone temple pillars." },
        { name: "Mysore Silk Saree", subName: "Soft crepe high-lustre finish", details: "Fluid, heavy pure silk crepe with raw structural borders." },
        { name: "Dharmavaram Saree", subName: "Heavy broad silk patterns", details: "Double shade wedding silks with rich peacock pallu plates." },
        { name: "Pochampally Saree", subName: "Ikat geometric alignments", details: "Precision tie-dyed warp grids made in Bhoodan Pochampally." },
        { name: "Gadwal Saree", subName: "Cotton body, heavy silk borders", details: "Elegantly fused natural cotton core with contrasting zari silks." },
        { name: "Uppada Silk Saree", subName: "Jamdani golden trims", details: "Float-weave designs resulting in soft weightless royal fabrics." },
        { name: "Venkatagiri Saree", subName: "Fine zari card layouts", details: "Historically woven for Deccan royals using soft cotton. " }
      ]
    },
    {
      region: "West India",
      tagline: "Double-ikat grids & geometric mathematical tie-dyes",
      items: [
        { name: "Paithani Saree", subName: "Peacock tapestry borders", details: "Maratha queen legacy silks showing pure gold oblique border sheets." },
        { name: "Bandhani Saree", subName: "High density micro tie-dye knots", details: "Crinkled Gaji silk dotted with fine geometric color rings." },
        { name: "Patola Saree", subName: "Double-ikat reversible weaving", details: "Sacred mathematical geometry with identical patterns on both sides." },
        { name: "Gharchola Saree", subName: "Zari checked grid tie-dyes", details: "Auspicious wedding drape partitioned in distinct blocks." },
        { name: "Leheriya Saree", subName: "Wavelike diagonal stripes", details: "Ancient multi-color warp bleeding depicting monsoon water flow." }
      ]
    },
    {
      region: "East India",
      tagline: "Fine muslins & organic wild silk forests",
      items: [
        { name: "Baluchari Saree", subName: "Mythological scroll stories", details: "Intricate depictions of epic battlefields and royal court chambers." },
        { name: "Jamdani Saree", subName: "Translucent hand-spun muslin", details: "Ethereal cotton weave originating from historical Bengal houses." },
        { name: "Tant Saree", subName: "Crisp starch summer cottons", details: "Traditional light wear completed with broad decorative cotton borders." },
        { name: "Sambalpuri Saree", subName: "Bandha tie-and-dyed ikats", details: "Outstanding crimson-black patterns representing forest lore." },
        { name: "Bomkai Saree", subName: "Sonepur handloom tribal trims", details: "Uniquely styled heavy contrast weaves from Southern Odisha." },
        { name: "Tussar Silk Saree", subName: "Raw textured wild kosa threads", details: "Organic golden-tinted wilderness threads providing unmatched ventilation." },
        { name: "Muga Silk Saree", subName: "Assamese natural golden filament", details: "Extremely durable heirloom silk that glosses brighter after laundry." }
      ]
    },
    {
      region: "Modern & Designer Sarees",
      tagline: "Contempory high-fashion fabrics & night celebration cuts",
      items: [
        { name: "Organza Saree", subName: "Glass sheer structure", details: "Ultra-fine sparkling glass weave finished with hand-painted borders." },
        { name: "Georgette Saree", subName: "Elastic crepe fall feel", details: "Highly fluid heavy drapes accented with micro beads." },
        { name: "Net Saree", subName: "Intricate mesh screens", details: "See-through modern nets patterned with silver sequins and lace." },
        { name: "Crepe Saree", subName: "Slightly crinkled fabric layout", details: "Matte modern texture flowing uniformly without permanent wrinkles." },
        { name: "Satin Saree", subName: "High-shine silk smooth faces", details: "Luxurious glossy surface which drapes in sleek wave cowls." },
        { name: "Linen Saree", subName: "Soft breathing flax blends", details: "Jaipur hand block printed cotton linens for comfort wear." },
        { name: "Cotton Saree", subName: "Hand-spun natural cooling weaves", details: "Premium Mulmul and khadi drapes ideal for day temperatures." },
        { name: "Printed Saree", subName: "Chanderi block or digital prints", details: "Lightweight styles showcasing hand-drawn botanical maps." },
        { name: "Designer Saree", subName: "Experimental boutique drapes", details: "Contemporary concepts worn by global fashion patrons." },
        { name: "Ready-to-Wear Saree", subName: "Pre-pleated cocktail silhouettes", details: "Pre-stitched pleats with zip closure for immediate 10-second wear." },
        { name: "Party Wear Saree", subName: "Heavy sequins & starlet shimmer", details: "Flamboyant selections emphasizing glittering night embellishments." },
        { name: "Wedding Saree", subName: "Intense hand embroideries", details: "Detailed karchobi and zardozi patterns made over 80 hours." },
        { name: "Reception Saree", subName: "Sleek pastel metallic threads", details: "Modern luxury selections displaying champagne and copper tones." },
        { name: "Cocktail Saree", subName: "Sultry mesh outlines", details: "Bold cuts pairing sheer nets with heavy designer blouses." },
        { name: "Ruffle Saree", subName: "Staggered tier cascades", details: "Tiered layers of glass organza producing whimsical light movements." },
        { name: "Sequin Saree", subName: "Refractive glitter crystals", details: "Monochrome sheets of sequins mimicking liquid mercury panels." },
        { name: "Embroidered Saree", subName: "Praise-worthy needle templates", details: "Gilded resham details outlining classical heritage florals." },
        { name: "Handloom Saree", subName: "State authenticated weaves", details: "100% natural fibers protecting micro weaver cooperatives." }
      ]
    }
  ];

  // Data details for Curated Collections Tab
  const CURATED_COLLECTIONS = [
    {
      id: "coll_bridal",
      type: "Bridal Collection",
      tagline: "Grand imperial selections for the holy altar",
      bgUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600",
      items: [
        "Royal Bridal Banarasi Saree",
        "Maharani Kanjeevaram Brocade",
        "Heritage Paithani Peacock Tapestry",
        "Wedding Patola Sacred Geometry",
        "Luxury Handloom Silk Masterpiece",
        "Temple Border Contrast Saree"
      ]
    },
    {
      id: "coll_festival",
      type: "Festival Collection",
      tagline: "Bright colorways for traditional festive family circles",
      bgUrl: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=600",
      items: [
        "Diwali Gold-Butti Sarees",
        "Navratri Bandhani Gaji Silks",
        "Durga Puja Lal-Paar Tant Cottons",
        "Eid Chikankari Pastel Georgettes",
        "Pongal Gold Brocade Kanchis",
        "Onam Kasavu Fine Ivory Cottons"
      ]
    },
    {
      id: "coll_office",
      type: "Office Collection",
      tagline: "Highly breathable fabrics optimized for premium daily wear",
      bgUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600",
      items: [
        "Pure Flax Belgian Linen Sarees",
        "Fine combed summer Mulmul Cottons",
        "Soft Silk Lightweight Weaves",
        "Jaipur Indigo Block Printed Linens"
      ]
    },
    {
      id: "coll_party",
      type: "Party Collection",
      tagline: "Sensational modern sequin arrays for grand galas",
      bgUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600",
      items: [
        "Manish Malhotra Shimmer Sequin Sarees",
        "Boutique Hand-embellished Organzas",
        "Bollywood Glamour Cocktail Crepes",
        "Plush Velvet Trim designer Sarees"
      ]
    }
  ];

  // Designer Brands database (19 brands requested)
  const PREMIUM_BRANDS = [
    { name: "Sabyasachi", vibe: "Antiquity Heirloom Luxury", style: "Karchobi borders, velvet card drapes, traditional crimson", quote: "An archive of timeless preservation." },
    { name: "Manish Malhotra", vibe: "Chandeliers & Bollywood Shimmer", style: "See-through nets, miniature sequins, sleek modern neck cuts", quote: "Unapologetic stellar glare." },
    { name: "Satya Paul", vibe: "Avante-Garde Modernism", style: "Fluid abstract paintings, block shapes, geometric twill", quote: "Sarees as mobile canvases." },
    { name: "Gaurang", vibe: "Eclectic Handloom Revival", style: "Organic Jamdanis, zero polyester, traditional hand loom", quote: "Resurrecting lost loom lineages." },
    { name: "RMKV", vibe: "Pristine Silk Heritage", style: "Grand silk panels, 50,000 color shades yarn", quote: "The ultimate wedding weaver." },
    { name: "Kalanjali", vibe: "Classical South Grandeur", style: "Resilient threads, gold foil work, deep temple borders", quote: "Elegance honoring fine arts." },
    { name: "Pothys", vibe: "Mulberry Silk Specialists", style: "Thick double warp Kanchis, authentic village dyes", quote: "The silk emperor of Chennai." },
    { name: "Nalli", vibe: "Unmatched Trust & Weave purity", style: "Every classical region design in pristine fabrics", quote: "Generations of handloom gold." },
    { name: "Koskii", vibe: "Ethnic Celebration Dazzle", style: "Heavy zardozi embroidery, bright wedding pinks", quote: "Wear your grand story." },
    { name: "Soch", vibe: "Pragmatic Daily Traditional", style: "Georgette prints, daily wear linen mixtures", quote: "Modern lines, deep heritage roots." },
    { name: "BharatSthali", vibe: "Raw Village Weaver Collective", style: "Assamese golden Muga, raw wild Tussar fiber", quote: "Straight from village wooden looms." },
    { name: "Mavuri", vibe: "Elite Silk Connoisseurs", style: "Vintage Korvai gold weaving, heritage motifs", quote: "Curating luxury thread stories." },
    { name: "Pratibha Sarees", vibe: "Handcrafted Block estampas", style: "Indigos and plant base colors, Bagru stamps", quote: "Organic Rajasthani block craft." },
    { name: "Kalamandir", vibe: "Artistic Temple Legacy", style: "Contrast South borders, bridal wedding drapes", quote: "Woven blessings for new beginnings." },
    { name: "Libas", vibe: "Contemporary Comfort Weaves", style: "Georgette pastel tones, unstitched cotton combos", quote: "Redefining festive daily wear." },
    { name: "Ishin", vibe: "Printed Bliss Silks", style: "Glossy art silks, traditional bhagalpur blocks", quote: "Crafting everyday luxury drapes." },
    { name: "Singhania's", vibe: "High-twist Ikats & Paithanis", style: "Symmetric double ikats, peacock parrot hand weft", quote: "Heirloom fabrics for global standard collectors." },
    { name: "Suta", vibe: "Bohemian Minimalist Story", style: "Soft breathable hand-spun mulmuls, retro plain border prints", quote: "Draping memories like secondary skin." },
    { name: "Karagiri", vibe: "Digital Boutique Hub", style: "Faux silks, pastel sequence georgette edits", quote: "Bespoke beauty at your digital click." }
  ];

  // Simulated 360 view catalog telemetry categories
  const TELEMETRY_TRYON_STATS = {
    total: 610,
    breakdown: [
      { key: "banarasi", count: 50, label: "Banarasi" },
      { key: "kanjeevaram", count: 50, label: "Kanjeevaram" },
      { key: "paithani", count: 30, label: "Paithani" },
      { key: "patola", count: 30, label: "Patola" },
      { key: "organza", count: 40, label: "Organza" },
      { key: "georgette", count: 50, label: "Georgette" },
      { key: "linen", count: 30, label: "Linen" },
      { key: "cotton", count: 40, label: "Cotton" },
      { key: "designer", count: 100, label: "Designer" },
      { key: "bridal", count: 100, label: "Bridal" },
      { key: "party", count: 100, label: "Party Wear" }
    ],
    fileStructure: [
      { file: "n_banarasi_01_front_alpha.png", size: "4.2 MB", desc: "Front angle, clean shoulder silhouette" },
      { file: "n_banarasi_01_side_45deg.png", size: "3.8 MB", desc: "Left sidebar flow showing pleat count" },
      { file: "n_banarasi_01_back_drape.png", size: "4.5 MB", desc: "Rear pallu view showing gold motifs" },
      { file: "n_banarasi_01_chassis_360.glb", size: "12.8 MB", desc: "React Three Fiber Interactive 3D model" },
      { file: "blouse_layout_stitches.png", size: "1.2 MB", desc: "Unstitched design stencil boundaries" },
      { file: "microscope_fabric_texture.jpg", size: "2.1 MB", desc: "75x zoom confirming gold wire purity" },
      { file: "wearer_skin_tone_neutral.png", size: "2.4 MB", desc: "AI tryon base tone template matching" }
    ],
    angles: [
      { degree: 0, label: "Front (0°)", img: "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800" },
      { degree: 45, label: "Left-Front (45°)", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800" },
      { degree: 90, label: "Left-Profile (90°)", img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800" },
      { degree: 135, label: "Left-Back (135°)", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800" },
      { degree: 180, label: "Back (180°)", img: "https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?q=80&w=800" },
      { degree: 225, label: "Right-Back (225°)", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800" },
      { degree: 270, label: "Right-Profile (270°)", img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800" },
      { degree: 315, label: "Right-Front (315°)", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800" }
    ],
    colors: [
      { name: "Cherry Gold", hex: "#7F1D1D", desc: "Rich crimson with gold zari" },
      { name: "Teal Silver", hex: "#115E59", desc: "Peacock teal with silver wires" },
      { name: "Royal Purple", hex: "#581C87", desc: "Deep aubergine with classic border warp" },
      { name: "Marigold Yellow", hex: "#B45309", desc: "Bright saffron yellow for summer holis" }
    ]
  };

  // Extract Accessories from Database dynamically
  const accessoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.category !== "Accessories") return false;
      if (selectedAccessorySub === "All") return true;
      return p.subCategory.toLowerCase() === selectedAccessorySub.toLowerCase();
    });
  }, [products, selectedAccessorySub]);

  // Active Saree full details
  const activeSaree = useMemo(() => {
    return SAREE_TYPES.find((s) => s.key === activeSareeKey) || SAREE_TYPES[0];
  }, [activeSareeKey]);

  // Real store products currently matching the selected subcategory from inventory
  const matchingInventoryProducts = useMemo(() => {
    const formatName = activeSaree.name.toLowerCase();
    return products.filter((p) => {
      // Find if they are in the correct category/subcategory
      const isSareeCat = p.category === "Women" && 
        (p.subCategory === "Silk Sarees" || p.subCategory === "Designer Sarees");
      
      if (!isSareeCat) return false;
      
      // Filter further if name or description matches our active style
      const wordMatch = formatName.split(" ").some(word => 
        word.length > 3 && (p.name.toLowerCase().includes(word) || p.description.toLowerCase().includes(word))
      );
      return wordMatch;
    });
  }, [products, activeSaree]);

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  const handleRunQuiz = () => {
    if (!quizOccasion || !quizWeight || !quizDesign) return;

    // Direct mapping to saree types based on quiz replies
    let matchedKey = "banarasi"; // default royal
    if (quizOccasion === "Grand Wedding" && quizWeight === "Heavy & Regal") {
      matchedKey = "kanjeevaram";
    } else if (quizOccasion === "Grand Wedding" && quizWeight === "High lustre silk") {
      matchedKey = "banarasi";
    } else if (quizOccasion === "Day Festive" && quizWeight === "Light & Sheer") {
      matchedKey = "chanderi";
    } else if (quizOccasion === "Evening Cocktail" && quizWeight === "Light & Sheer" && quizDesign === "Shadow Embroidery") {
      matchedKey = "chikankari";
    } else if (quizOccasion === "Grand Wedding" && quizWeight === "Heavy & Regal" && quizDesign === "Tapestry Peacocks") {
      matchedKey = "paithani";
    } else if (quizOccasion === "Day Festive" && quizDesign === "Pure Geometry") {
      matchedKey = "patola";
    } else {
      // Find matching based on weight/design
      if (quizWeight === "Light & Sheer") {
        matchedKey = "chanderi";
      } else if (quizDesign === "Shikargah Brocade") {
        matchedKey = "banarasi";
      } else if (quizDesign === "Temple Contours") {
        matchedKey = "kanjeevaram";
      } else if (quizDesign === "Tapestry Peacocks") {
        matchedKey = "paithani";
      } else if (quizDesign === "Pure Geometry") {
        matchedKey = "patola";
      } else {
        matchedKey = "banarasi";
      }
    }

    const matchedInfo = SAREE_TYPES.find((s) => s.key === matchedKey) || SAREE_TYPES[0];
    setQuizRecommendation(matchedInfo);
    setIsQuizCompleted(true);
  };

  const handleResetQuiz = () => {
    setQuizOccasion("");
    setQuizWeight("");
    setQuizDesign("");
    setQuizRecommendation(null);
    setIsQuizCompleted(false);
  };

  const selectSuggestedSaree = (key: string) => {
    setActiveSareeKey(key);
    // Smooth scroll to catalog section
    const el = document.getElementById("saree-showcase-split");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="saree-collection-catalog-page" className="bg-stone-50/50 min-h-screen py-10">
      
      {/* Immersive Header Banner */}
      <section id="saree-hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative rounded-lg overflow-hidden bg-amber-950 text-white min-h-[340px] flex items-center p-8 sm:p-12 shadow-md">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=1200" 
              alt="Indian Saree Heritage Banner"
              className="w-full h-full object-cover object-center opacity-30 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-amber-400 font-sans text-xs tracking-[0.35em] font-bold uppercase block">
              The Seven Saree Empires of India
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-amber-50 leading-tight">
              Bespoke Handloom <br />
              <span className="italic font-light text-amber-300">Heritage Catalog</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-sans max-w-lg">
              Every Royal Ethnica handloom is custom ordered directly from verified state master-weavers of Peeli Kothi, Kanchipuram, and Bhuj, utilizing genuine silver wires washed in 22-Karat liquid gold.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                href="#saree-directory-nav" 
                className="bg-amber-700 hover:bg-amber-800 text-stone-50 text-xs font-serif uppercase tracking-widest px-6 py-3.5 rounded-sm transition shadow shadow-amber-900/50"
              >
                Explore Saree Directory
              </a>
              <button 
                onClick={() => {
                  setActiveMainTab("tryon");
                  document.getElementById("saree-directory-nav")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="border border-amber-400/50 hover:bg-white/10 text-amber-300 text-xs font-serif uppercase tracking-widest px-6 py-3.5 rounded-sm transition"
              >
                AI Try-On Raw Database ({TELEMETRY_TRYON_STATS.total}+)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Luxury Secondary Directory Nav bar */}
      <section id="saree-directory-nav" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 scroll-mt-24">
        <div className="bg-white border border-amber-200 p-1 bg-gradient-to-r from-white via-amber-50/20 to-white rounded-md shadow-xs flex flex-wrap justify-between items-center gap-1">
          {[
            { id: "heritage", label: "Heritage Loom Spotlights" },
            { id: "categories", label: "Regional Weave Classes" },
            { id: "collections", label: "Curated Collections" },
            { id: "brands", label: "Designer Boutique Codes" },
            { id: "accessories", label: "Ethnic Accessories" },
            { id: "tryon", label: "AI 360° Tryon Database" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMainTab(tab.id as any);
              }}
              className={`flex-1 min-w-[150px] text-center font-serif text-xs uppercase tracking-wider py-3.5 px-3 rounded-sm transition-all duration-300 cursor-pointer ${
                activeMainTab === tab.id
                  ? "bg-amber-900 text-white font-bold shadow"
                  : "text-amber-950 hover:bg-amber-50/60 font-medium"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Saree Selection Rails (Bespoke Tabs) */}
      <section id="saree-tab-scroller" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 overflow-x-auto scrollbar-none">
        <div className="flex border-b border-amber-200/50 pb-px min-w-[700px] justify-between">
          {SAREE_TYPES.map((saree) => (
            <button
              key={saree.key}
              onClick={() => setActiveSareeKey(saree.key)}
              className={`flex-1 py-4 text-center cursor-pointer relative font-serif text-sm transition-all duration-300 outline-none ${
                activeSareeKey === saree.key 
                  ? "text-amber-950 font-bold tracking-wide" 
                  : "text-stone-500 hover:text-amber-800"
              }`}
            >
              <span>{saree.name}</span>
              {activeSareeKey === saree.key && (
                <motion.div 
                  layoutId="activeSareeTab"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-800"
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Primary split showcase */}
      <section id="saree-showcase-split" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column A: Majestic Interactive Image Panel with Magnifier Effect (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white border border-amber-100 rounded-sm p-4 h-full flex flex-col justify-between shadow-xs">
              
              {/* Product Saree Image */}
              <div className="relative h-[480px] w-full overflow-hidden bg-stone-50 group flex items-center justify-center rounded-sm">
                <img 
                  src={activeSaree.imageUrl} 
                  alt={activeSaree.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  id={`saree-spotlight-image-${activeSaree.key}`}
                />
                
                {/* Visual Label overlay */}
                <div className="absolute top-4 left-4 z-10 bg-amber-950 text-amber-100 uppercase text-[9px] font-sans tracking-widest px-3 py-1.5 rounded-sm shadow border border-amber-800">
                  {activeSaree.state} Handloom
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent p-6 text-white">
                  <p className="text-[10px] tracking-widest text-amber-300 uppercase font-sans font-bold">Origin GI Coordinate</p>
                  <p className="text-base font-serif font-medium mt-0.5 flex items-center gap-1.5 text-white">
                    <MapPin size={15} className="text-amber-400 shrink-0" />
                    {activeSaree.origin}
                  </p>
                </div>
              </div>

              {/* Maintenance quick checklist */}
              <div className="mt-4 pt-4 border-t border-amber-100/60 bg-amber-50/30 p-3 rounded-sm">
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-amber-900 font-sans flex items-center gap-1.5 mb-1.5">
                  <Info size={12} className="text-amber-800" />
                  Preservation Guard Checklist
                </h5>
                <p className="text-xs text-stone-600 font-sans leading-relaxed">
                  {activeSaree.careInstructions}
                </p>
              </div>

            </div>
          </div>

          {/* Column B: Comprehensive Specifications & Heritage storytelling (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="bg-white border border-amber-100 rounded-sm p-6 sm:p-8 h-full flex flex-col justify-between shadow-xs space-y-6">
              
              {/* Saree Heading Info */}
              <div className="space-y-2">
                <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded inline-block font-sans">
                  Traditional Woven Art
                </span>
                <h2 className="text-2xl sm:text-3.5xl font-serif font-bold text-amber-950 uppercase leading-snug">
                  {activeSaree.name}
                </h2>
                <h3 className="text-xs sm:text-sm font-sans text-amber-800 font-bold italic tracking-wide">
                  "{activeSaree.tagline}"
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed pt-2">
                  {activeSaree.description}
                </p>
              </div>

              {/* Technical Spec Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-amber-100/80 py-6">
                
                <div className="flex gap-3">
                  <div className="p-2 bg-amber-50 rounded text-amber-800 h-fit">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-amber-900 font-sans tracking-wider">Labor hours required</h5>
                    <p className="text-xs font-serif font-bold text-stone-800 mt-0.5">{activeSaree.weaverHours}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-amber-50 rounded text-amber-800 h-fit">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-amber-900 font-sans tracking-wider">Loom & Frame class</h5>
                    <p className="text-xs font-sans text-stone-700 mt-0.5 leading-tight">{activeSaree.loomType}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-amber-50 rounded text-amber-800 h-fit">
                    <Award size={16} />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-amber-900 font-sans tracking-wider">Zari & Metal verification</h5>
                    <p className="text-xs font-sans text-stone-700 mt-0.5 leading-tight">{activeSaree.zariGrade}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-amber-50 rounded text-amber-800 h-fit">
                    <Compass size={16} />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-amber-900 font-sans tracking-wider">Drape alignment recommend</h5>
                    <p className="text-xs font-sans text-stone-700 mt-0.5 leading-tight">{activeSaree.drapeRecommendation}</p>
                  </div>
                </div>

              </div>

              {/* History Lore block */}
              <div className="space-y-2 bg-stone-50 p-4 border border-stone-200/50 rounded-sm">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-sans flex items-center gap-1.5">
                  <BookOpen size={13} className="text-stone-400" />
                  Atelier Archival Chronicles
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-sans italic">
                  "{activeSaree.historyText}"
                </p>
              </div>

              {/* Master Weaver Connection Call-to-Action */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50/40 p-4 rounded-sm border border-amber-100/50">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-xs font-serif font-bold text-amber-950 uppercase tracking-wider">
                    Desire a fully custom configuration?
                  </h4>
                  <p className="text-[10px] text-stone-600 font-sans">
                    Commission a personalized palette dye alongside unstitched designer heavy blouse block pieces.
                  </p>
                </div>
                <button
                  onClick={() => showToast(`Initiating bespoke master-weaver commissions queue for custom "${activeSaree.name}". Our personal concierge will reach out in 24 hours.`, "info")}
                  className="bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-serif uppercase tracking-widest py-2.5 px-4 rounded shadow shrink-0 cursor-pointer"
                >
                  Commission weaver
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Synchronized Live Inventory section */}
      <section id="saree-live-inventory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="border-t border-amber-100 pt-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 block mb-1">Live Atelier Wardrobe</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
                Available {activeSaree.name} Ensembles
              </h3>
            </div>
            
            <button
              onClick={() => onNavigateToCatalog("Women", activeSaree.matchingSubCategory)}
              className="text-xs font-serif text-amber-850 hover:text-amber-950 font-bold border-b border-amber-850 hover:border-amber-950 pb-0.5 flex items-center gap-1.5 hover:translate-x-1 transition"
            >
              Browse entire {activeSaree.matchingSubCategory} catalog 
              <ChevronRight size={14} />
            </button>
          </div>

          {matchingInventoryProducts.length === 0 ? (
            <div className="bg-white border rounded-sm p-10 text-center space-y-4 shadow-3xs max-w-2xl mx-auto">
              <Sparkles className="mx-auto text-amber-600 animate-pulse" size={24} />
              <div className="space-y-1">
                <h4 className="text-sm font-serif font-bold text-amber-950 uppercase">Pre-order / Custom Tailored slots active</h4>
                <p className="text-xs text-stone-500 font-sans max-w-md mx-auto leading-relaxed">
                  All ready-to-ship {activeSaree.name} sarees are currently resting in global orders. You can hire a master loom directly to tie and dye this style uniquely for you within 45 days.
                </p>
              </div>
              <button
                onClick={() => showToast(`Starting a custom tailoring request envelope for a Bespoke pure silk ${activeSaree.name} with luxury borders. We will customize size and weave details.`, "success")}
                className="inline-flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-serif uppercase tracking-widest py-2.5 px-6 rounded shadow cursor-pointer"
              >
                <Compass size={14} /> Custom tailormake this type
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingInventoryProducts.map((p) => {
                const isSaved = wishlist.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    className="group bg-white border border-amber-100 hover:border-amber-400 rounded-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 relative"
                  >
                    {/* Visual Label */}
                    <span className="absolute top-3 left-3 z-10 bg-amber-950 text-amber-100 font-serif tracking-wider uppercase text-[8px] px-2.5 py-1 shadow-sm font-bold border border-amber-800/60">
                      GI Registered
                    </span>

                    {/* Image */}
                    <div className="h-80 overflow-hidden relative bg-stone-100 flex-shrink-0 cursor-pointer" onClick={() => onViewProduct(p)}>
                      <img 
                        src={p.images[0]} 
                        alt={p.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Interactive Drawer triggers */}
                      <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/45 transition flex items-end justify-center pb-4 gap-3 opacity-0 group-hover:opacity-100 duration-300">
                        <button
                          onClick={() => onToggleWishlist(p.id)}
                          className={`p-2 rounded-full shadow-md transition ${isSaved ? "bg-rose-700 text-white" : "bg-white text-stone-800 hover:bg-amber-50"}`}
                          title="Add to Wishlist"
                        >
                          <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => onViewProduct(p)}
                          className="bg-white text-stone-800 hover:bg-amber-50 p-2 rounded-full shadow-md transition"
                          title="Inspect Craftsmanship"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onAddToCart(p, p.sizes[0], p.colors[0])}
                          className="bg-amber-900 hover:bg-amber-950 text-white p-2 rounded-full shadow-md transition"
                          title="Add to Royal Bag"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-amber-700 block font-sans">
                          {p.subCategory} • {activeSaree.origin}
                        </span>
                        <h4 
                          onClick={() => onViewProduct(p)}
                          className="font-serif font-bold text-sm text-amber-950 hover:text-amber-700 cursor-pointer line-clamp-1"
                        >
                          {p.name}
                        </h4>
                        <p className="text-xs text-stone-500 font-sans line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-amber-50 flex items-center justify-between">
                        <div className="space-y-px">
                          <p className="text-[9px] text-stone-400 font-sans uppercase">Atelier price</p>
                          <p className="text-sm font-serif font-bold text-amber-800">
                            {formatPrice(p.discountPrice || p.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => setQuickViewProduct(p)}
                          className="text-[10px] font-sans font-bold uppercase text-amber-800 border border-amber-200 hover:bg-amber-50 py-1.5 px-3 rounded transition cursor-pointer"
                        >
                          Specs sheet
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Saree Draping Masterclass Hub */}
      <section id="saree-draping-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-amber-950 rounded-lg p-6 sm:p-12 text-white relative overflow-hidden shadow-md">
          {/* Decorative background circle */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-900/20 blur-3xl"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Box (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-amber-400 text-[10px] tracking-[0.3em] font-sans font-bold uppercase block">
                Atelier Masterclass
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wide leading-tight text-white">
                The Sacred Art <br />
                <span className="text-amber-200 italic font-light">of Draping</span>
              </h3>
              <p className="text-xs text-stone-300 font-sans leading-relaxed">
                A saree adapts entirely to your physical frame. Discover four landmark regional draping lineages custom engineered to prioritize comfort, stature, and heavy embroidery exposure.
              </p>

              {/* Selection buttons */}
              <div className="space-y-2 pt-2">
                {DRAPE_STYLES.map((drape, idx) => (
                  <button
                    key={drape.name}
                    onClick={() => setSelectedDrapeIndex(idx)}
                    className={`w-full text-left p-3 rounded-sm border transition flex items-center justify-between cursor-pointer ${
                      selectedDrapeIndex === idx 
                        ? "bg-amber-900/60 border-amber-400 text-white" 
                        : "bg-amber-950/40 border-amber-900/50 text-amber-200/70 hover:border-amber-400/35 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-serif font-bold tracking-wide">{drape.name}</span>
                    <span className="text-[9px] font-sans uppercase px-2 py-0.5 rounded bg-stone-900 text-stone-300">
                      {drape.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Box (7 cols) */}
            <div className="lg:col-span-7 bg-amber-900/35 border border-amber-900 p-6 sm:p-8 rounded-sm space-y-6">
              
              <div className="space-y-1">
                <div className="flex justify-between items-center bg-amber-900/40 px-3.5 py-1 rounded">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">
                    Step By Step Alignment Guide
                  </span>
                  <span className="text-xs font-serif italic text-amber-200">
                    {DRAPE_STYLES[selectedDrapeIndex].name}
                  </span>
                </div>
                <p className="text-xs text-stone-200 font-sans leading-relaxed pt-2">
                  {DRAPE_STYLES[selectedDrapeIndex].description}
                </p>
              </div>

              {/* Progress Steps list */}
              <div className="space-y-3.5">
                {DRAPE_STYLES[selectedDrapeIndex].steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-5.5 h-5.5 rounded-full bg-amber-600 text-stone-100 flex items-center justify-center font-serif text-[11px] font-bold shrink-0 mt-0.5">
                      0{idx + 1}
                    </div>
                    <p className="text-xs text-stone-300 font-sans leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center text-[10px] font-sans text-amber-300/60 italic border-t border-amber-900/40">
                ★ Tip: Use pure copper heavy safety pins. Avoid plastic safety clutches which might rip ancient handloom fabrics.
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Interactive Matchmaker Heritage Quiz */}
      <section id="heritage-quiz" className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 scroll-mt-24">
        <div className="bg-white border border-amber-200/70 rounded-md p-6 sm:p-10 shadow-sm relative overflow-hidden">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 block mb-1">
              Atelier Decision Helper
            </span>
            <h3 className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-wider">
              Find Your Soul Heritage Drape 
            </h3>
            <p className="text-xs text-stone-500 font-sans mt-1">
              Struggling to pair Kanjeevaram contrast borders with Chanderi sheers? Feed your aesthetic constraints to receive tailor-made suggestions instantly.
            </p>
          </div>

          {!isQuizCompleted ? (
            <div className="space-y-6">
              
              {/* Question 1 */}
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <span className="text-xs text-amber-700">1.</span> On which magnificent occasion will this float?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    "Grand Wedding",
                    "Day Festive",
                    "Evening Cocktail"
                  ].map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuizOccasion(val)}
                      className={`py-3 px-4 border rounded text-xs text-left cursor-pointer transition ${
                        quizOccasion === val 
                          ? "bg-amber-50 border-amber-800 text-amber-955 font-bold" 
                          : "bg-white border-stone-250 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <span className="text-xs text-amber-700">2.</span> What is your absolute fabric density priority?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    "Heavy & Regal",
                    "High lustre silk",
                    "Light & Sheer"
                  ].map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuizWeight(val)}
                      className={`py-3 px-4 border rounded text-xs text-left cursor-pointer transition ${
                        quizWeight === val 
                          ? "bg-amber-50 border-amber-800 text-amber-955 font-bold" 
                          : "bg-white border-stone-250 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-950 uppercase tracking-wider block flex items-center gap-1.5">
                  <span className="text-xs text-amber-700">3.</span> Which design ornamentation style captures your heart?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    "Shikargah Brocade",
                    "Temple Contours",
                    "Tapestry Peacocks",
                    "Pure Geometry",
                    "Shadow Embroidery"
                  ].map((val) => (
                    <button
                      key={val}
                      onClick={() => setQuizDesign(val)}
                      className={`py-3 px-4 border rounded text-xs text-left cursor-pointer transition ${
                        quizDesign === val 
                          ? "bg-amber-50 border-amber-800 text-amber-955 font-bold" 
                          : "bg-white border-stone-250 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 text-center">
                <button
                  onClick={handleRunQuiz}
                  disabled={!quizOccasion || !quizWeight || !quizDesign}
                  className={`py-3.5 px-8 text-xs font-serif uppercase tracking-widest rounded-sm shadow transition cursor-pointer ${
                    quizOccasion && quizWeight && quizDesign 
                      ? "bg-amber-800 hover:bg-amber-900 text-white shadow-amber-900/30" 
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  Confirm constraints & match drapes
                </button>
              </div>

            </div>
          ) : (
            <AnimatePresence>
              {quizRecommendation && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-amber-50/50 rounded-sm p-6 sm:p-8 border border-amber-200/50 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img 
                      src={quizRecommendation.imageUrl} 
                      alt={quizRecommendation.name}
                      className="w-24 h-32 object-cover object-top rounded border border-amber-200 shrink-0 shadow-sm"
                    />
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-[9px] uppercase font-bold text-amber-700 tracking-widest font-sans">
                        Your Perfect Heritage Heritage Match
                      </span>
                      <h4 className="text-xl font-serif font-bold text-amber-950 uppercase">
                        {quizRecommendation.name}
                      </h4>
                      <p className="text-xs font-sans italic text-amber-800 font-semibold mb-2">
                        "{quizRecommendation.tagline}"
                      </p>
                      <p className="text-xs text-stone-600 font-sans leading-relaxed">
                        {quizRecommendation.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-amber-100 pt-4 text-xs">
                    <div>
                      <p className="font-bold text-amber-950 font-serif">Estimated Craftsmanship:</p>
                      <p className="text-stone-600 font-sans mt-0.5">{quizRecommendation.weaverHours} of pristine weaving in {quizRecommendation.origin}</p>
                    </div>
                    <div>
                      <p className="font-bold text-amber-950 font-serif">Aesthetic Placement:</p>
                      <p className="text-stone-600 font-sans mt-0.5">{quizRecommendation.drapeRecommendation}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2 justify-center sm:justify-start">
                    <button
                      onClick={() => selectSuggestedSaree(quizRecommendation.key)}
                      className="bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-serif uppercase tracking-widest py-3 px-6 rounded shadow cursor-pointer flex items-center gap-1.5"
                    >
                      Inspect this weave showcase <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={handleResetQuiz}
                      className="border border-stone-300 hover:bg-white text-stone-700 text-[10px] font-sans uppercase tracking-wider py-3 px-6 rounded transition cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> Reset constraints
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

        </div>
      </section>

      {/* Specifications Sheet Modal Overlay (Tailored specs detail) */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border rounded-sm p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-amber-50 pb-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-amber-700 tracking-wider font-sans">Heritage Specs Blueprint</span>
                  <h4 className="font-serif font-bold text-amber-950 text-base">{quickViewProduct.name}</h4>
                </div>
                <button 
                  onClick={() => setQuickViewProduct(null)}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded-full text-sm font-bold font-sans"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans text-stone-700">
                
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 uppercase text-[9px] tracking-wider font-sans">Craft Looming Process:</p>
                  <p className="bg-stone-50 p-2.5 rounded text-stone-600 leading-relaxed italic border border-stone-200/50">
                    "{quickViewProduct.craftsmanship}"
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-amber-950 uppercase text-[9px] tracking-wider font-sans">Fabric & Metallic Threads:</p>
                  <p className="text-stone-600">
                    {quickViewProduct.fabric}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-bold text-amber-950 uppercase text-[9px] tracking-wider font-sans">Occasions:</p>
                    <p className="text-stone-600 font-sans mt-0.5">
                      {quickViewProduct.occasion.join(", ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-amber-950 uppercase text-[9px] tracking-wider font-sans">Secure Care Instruction:</p>
                    <p className="text-stone-600 font-sans mt-0.5">
                      {quickViewProduct.careInstructions}
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-amber-50 flex justify-end gap-3">
                <button
                  onClick={() => {
                    onAddToCart(quickViewProduct, quickViewProduct.sizes[0], quickViewProduct.colors[0]);
                    setQuickViewProduct(null);
                  }}
                  className="bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-serif uppercase tracking-widest py-2.5 px-5 rounded shadow cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingCart size={12} /> Add to Royal Bag ({formatPrice(quickViewProduct.discountPrice || quickViewProduct.price)})
                </button>
                <button
                  onClick={() => {
                    onViewProduct(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="border border-stone-300 hover:bg-stone-50 text-stone-700 text-[10px] font-sans uppercase tracking-wider py-2.5 px-4 rounded transition"
                >
                  Premium details
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
