<div align="center">

# 👗 Royal Ethnica

### AI-Powered Ethnic Fashion E-Commerce Platform

*Experience the future of saree shopping — with 3D visualization, AI styling, and virtual try-on*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-black?style=for-the-badge&logo=threedotjs)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.4-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

</div>

---

## 🛍️ About

**Royal Ethnica** is a modern, AI-enhanced e-commerce platform specializing in ethnic Indian fashion — primarily sarees and traditional wear. It blends a seamless online shopping experience with cutting-edge AI and 3D technologies to help customers discover, visualize, and purchase ethnic fashion like never before.

---

## ✨ Key Features

### 🛒 Full E-Commerce Experience
- Product catalog with categories, filters, and search
- Shopping cart, wishlist, and coupon/discount system
- Checkout flow with saved addresses
- Order history and client dashboard
- Multi-currency support

### 🤖 AI-Powered Features
- **AI Stylist Drawer** — Get personalized outfit recommendations powered by Google Gemini AI
- **Semantic AI Search** — Natural language product search using AI
- **Styling Suggestions** — AI-generated looks based on occasion, color, and preference

### 🧥 Virtual Fitting Room
- Upload your photo for an AI-powered try-on experience
- **MediaPipe Pose Detection** — Detects body landmarks for accurate garment placement
- Body measurement section and size recommendations

### 🎨 3D Saree Visualization
- Interactive 360° saree viewing using **Three.js + React Three Fiber**
- Rotate, zoom, and explore draping styles in real time
- Multiple body type and color/design previews

### 🔐 Admin Panel
- Secure admin authentication with passcode
- Product management (add, edit, remove)
- Order management and coupon creation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript |
| **Styling** | TailwindCSS 4 |
| **Build Tool** | Vite 6 |
| **3D Engine** | Three.js + React Three Fiber + Drei |
| **AI / ML** | Google Gemini API (`@google/genai`) |
| **Body Detection** | MediaPipe Tasks Vision |
| **Animations** | Motion (Framer Motion v12) |
| **Icons** | Lucide React |
| **Backend** | Express.js (TypeScript) |
| **Runtime** | Node.js ≥ 18 |

---

## 📁 Project Structure

```
royal-ethnica/
├── src/
│   ├── App.tsx                  # Main app with routing & state
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   ├── types.ts                 # TypeScript types (Product, Order, etc.)
│   ├── components/
│   │   ├── Header.tsx           # Navigation header
│   │   ├── HeroSlider.tsx       # Hero banner carousel
│   │   ├── SareeCollection.tsx  # Product collection grid
│   │   ├── CollectionPage.tsx   # Category collection page
│   │   ├── ProductPage.tsx      # Product detail page
│   │   ├── SareeCanvas3D.tsx    # 3D saree visualization
│   │   ├── VirtualFittingRoom.tsx # AI virtual try-on
│   │   ├── AIStylistDrawer.tsx  # AI stylist sidebar
│   │   ├── CheckoutPage.tsx     # Checkout flow
│   │   ├── ClientDashboard.tsx  # User dashboard
│   │   └── AdminPanel.tsx       # Admin management panel
│   ├── utils/                   # Helper utilities
│   └── server/                  # Server-side modules
├── server.ts                    # Express backend server
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies & scripts
├── requirements.txt             # Human-readable dependency list
└── .env.example                 # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.0.0 → [Download](https://nodejs.org/)
- A **Google Gemini API key** → [Get one free](https://ai.google.dev/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/gmaha06052006-debug/royal-ethni.git
cd royal-ethni

# 2. Install dependencies
npm install

# 3. Set up environment variables
copy .env.example .env
# Open .env and add your GEMINI_API_KEY

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | TypeScript type checking |
| `npm run clean` | Remove build artifacts |

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ Never commit your `.env` file — it is already in `.gitignore`

---

## 🗺️ Pages & Routes

| Page | Description |
|------|-------------|
| `/` Home | Hero slider, featured collections, AI stylist |
| Collection | Browse sarees by category |
| Product | Product details, 3D view, size selector |
| Virtual Try-On | AI-powered fitting room |
| Checkout | Address, payment, order summary |
| Dashboard | Order history, wishlist, profile |
| Admin | Product & order management (passcode protected) |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is private. All rights reserved © Royal Ethnica.
