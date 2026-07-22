import React, { useState, useEffect } from "react";
import { MessageCircle, ShoppingBag, Heart, ArrowRight, ShieldCheck, Mail, Sparkles, Send, Trash2, ShieldAlert, X } from "lucide-react";
import { Product, Order, SavedAddress, OrderItem, Coupon, ShippingAddress } from "./types";
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import AIStylistDrawer from "./components/AIStylistDrawer";
import CollectionPage from "./components/CollectionPage";
import ProductPage from "./components/ProductPage";
import CheckoutPage from "./components/CheckoutPage";
import ClientDashboard from "./components/ClientDashboard";
import AdminPanel from "./components/AdminPanel";
import SareeCollection from "./components/SareeCollection";
import VirtualFittingRoom from "./components/VirtualFittingRoom";

export default function App() {
  // Navigation Routing States
  const [page, setPage] = useState<string>("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showHomeFittingRoom, setShowHomeFittingRoom] = useState(false);

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // User Auth Profile Coordinates
  const [userEmail, setUserEmail] = useState<string>("aahiltokalatech@gmail.com");
  const [userName, setUserName] = useState<string>("Aahil Tokala");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Auth Overlay toggles
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Admin Security
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");

  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Cart Management States
  const [cart, setCart] = useState<{ product: Product; quantity: number; size: string; color: string }[]>([]);
  const [isStylistOpen, setIsStylistOpen] = useState(false);
  const [currency, setCurrency] = useState<string>("INR");

  // Semantic AI Search helpers
  const [searchTermQuery, setSearchTermQuery] = useState("");
  const [semanticSearchReason, setSemanticSearchReason] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Load product catalog details from express server
  const loadData = async (emailToLoad = userEmail) => {
    try {
      const pRes = await fetch("/api/products");
      const pData = await pRes.json();
      setProducts(pData);

      const cRes = await fetch("/api/coupons");
      const cData = await cRes.json();
      setCoupons(cData);

      if (emailToLoad) {
        const oRes = await fetch(`/api/orders?email=${emailToLoad}`);
        const oData = await oRes.json();
        setOrders(oData);

        // Auth Profile synchronization
        const uRes = await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToLoad })
        });
        if (uRes.ok) {
          const uData = await uRes.json();
          if (uData) {
            setUserName(uData.name || "Noble Guest");
            setSavedAddresses(uData.addresses || []);
            setWishlist(uData.wishlist || []);
          }
        }
      } else {
        setOrders([]);
        setSavedAddresses([]);
        setWishlist([]);
      }
    } catch (err) {
      console.error("Failed to load server database coordinates.", err);
    }
  };

  useEffect(() => {
    loadData(userEmail);
    // Ingest local storage cart state
    const localCart = localStorage.getItem("re_cart");
    if (localCart) {
      try {
        setCart(JSON.parse(localCart));
      } catch (err) {
        console.error("Cart retrieval broken", err);
      }
    }
  }, [userEmail]);

  const saveCartToLocalStorage = (newCart: typeof cart) => {
    setCart(newCart);
    localStorage.setItem("re_cart", JSON.stringify(newCart));
  };

  // -------------------------------------------------------------------------
  // CORE CART & WISHLIST HANDLERS
  // -------------------------------------------------------------------------

  const handleAddToCart = (product: Product, size: string, color: string) => {
    const existingIdx = cart.findIndex(
      (item) => item.product.id === product.id && item.size === size && item.color === color
    );

    const updatedCart = [...cart];
    if (existingIdx > -1) {
      updatedCart[existingIdx].quantity += 1;
    } else {
      updatedCart.push({ product, quantity: 1, size, color });
    }

    saveCartToLocalStorage(updatedCart);
    
    // Quick user notification
    showToast(`Incorporated "${product.name}" (${size}) into your luxury bag.`, "success");
  };

  const handleUpdateCartQty = (productId: string, size: string, color: string, delta: number) => {
    const idx = cart.findIndex(
      (item) => item.product.id === productId && item.size === size && item.color === color
    );
    if (idx === -1) return;

    const updated = [...cart];
    updated[idx].quantity += delta;
    if (updated[idx].quantity <= 0) {
      updated.splice(idx, 1);
    }
    saveCartToLocalStorage(updated);
  };

  const handleRemoveFromCart = (productId: string, size: string, color: string) => {
    const updated = cart.filter(
      (item) => !(item.product.id === productId && item.size === size && item.color === color)
    );
    saveCartToLocalStorage(updated);
  };

  const handleToggleWishlist = async (pId: string) => {
    const isPresent = wishlist.includes(pId);
    const updated = isPresent ? wishlist.filter((id) => id !== pId) : [...wishlist, pId];
    
    setWishlist(updated);

    try {
      await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, wishlist: updated })
      });
    } catch (err) {
      console.error("Wishlist sync failure", err);
    }
  };

  // -------------------------------------------------------------------------
  // PROFILE CUSTOM OPERATIONS
  // -------------------------------------------------------------------------

  const handleAddAddress = async (addr: Omit<SavedAddress, "id">) => {
    const newAddr: SavedAddress = {
      ...addr,
      id: "addr_" + Date.now()
    };
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);

    try {
      await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, addresses: updated })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    const updated = savedAddresses.filter((a) => a.id !== addrId);
    setSavedAddresses(updated);

    try {
      await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, addresses: updated })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------------------
  // CHECKOUT & LOGISTIC RESERVATIONS
  // -------------------------------------------------------------------------

  const handlePlaceOrder = async (
    address: ShippingAddress,
    method: "COD" | "Razorpay",
    appliedDiscount: number
  ) => {
    const sub = cart.reduce((acc, curr) => acc + (curr.product.discountPrice || curr.product.price) * curr.quantity, 0);
    const del = sub > 30000 ? 0 : 500;
    const finalTotal = sub - appliedDiscount + del;

    const orderPayload = {
      customerEmail: userEmail,
      customerName: userName,
      shippingAddress: address,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.discountPrice || item.product.price,
        image: item.product.images[0],
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })),
      total: finalTotal,
      paymentMethod: method
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      throw new Error("Checkout placement failed");
    }

    const data = await response.json();
    
    // Clear cart upon ordering
    saveCartToLocalStorage([]);
    
    // Sync Orders list
    const oRes = await fetch(`/api/orders?email=${userEmail}`);
    const oData = await oRes.json();
    setOrders(oData);

    return data;
  };

  // -------------------------------------------------------------------------
  // ADMIN DECK HANDLERS
  // -------------------------------------------------------------------------

  const handleAdminAddProduct = async (payload: any) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    loadData();
    return data;
  };

  const handleAdminUpdateProduct = async (pId: string, updates: Partial<Product>) => {
    const res = await fetch(`/api/products/${pId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    loadData();
    return data;
  };

  const handleAdminDeleteProduct = async (pId: string) => {
    const res = await fetch(`/api/products/${pId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    loadData();
    return data;
  };

  const handleAdminOrderStatus = async (oId: string, status: string, trackingNum?: string) => {
    const res = await fetch(`/api/orders/${oId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: trackingNum })
    });
    const data = await res.json();
    loadData();
    return data;
  };

  // -------------------------------------------------------------------------
  // AI PRODUCT SEMANTIC CHAT SEARCH IN Header
  // -------------------------------------------------------------------------

  const handleAISemanticSearchSubmit = async (query: string) => {
    setSearchTermQuery(query);
    setPage("collection");
    setSelectedCategory(""); // Reset categories to show matched semantic search items
    setSelectedSub("");
    setHasSearched(true);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (data && data.matches) {
        // Find best match and display as AI stylist commentary
        const matchReasons = data.matches.map((m: any) => m.aiReason).join(" | ");
        setSemanticSearchReason(matchReasons || "Stylist recommended matches based on elegance criteria.");
        
        // Filter catalog display to match specifically IDs found
        const matchIds = data.matches.map((m: any) => m.productId);
        const filtered = products.filter((p) => matchIds.includes(p.id));
        if (filtered.length > 0) {
          // Temporarily override listed products for search result
          setProducts(products.sort((a,b) => matchIds.indexOf(a.id) - matchIds.indexOf(b.id)));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------------------
  // PRICING CALCULATIONS FOR HOVER DRAWER
  // -------------------------------------------------------------------------

  const cartSubtotal = cart.reduce(
    (acc, curr) => acc + (curr.product.discountPrice || curr.product.price) * curr.quantity,
    0
  );

  const formatPrice = (price: number) => {
    if (currency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  return (
    <div id="root-theme-wrapper" className="min-h-screen bg-stone-50/75 flex flex-col justify-between">
      
      {/* Dynamic Header Component */}
      <Header
        cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
        wishlistCount={wishlist.length}
        currentCurrency={currency}
        setCurrency={setCurrency}
        onNavigate={(targetPage, cat, sub) => {
          setPage(targetPage);
          setSelectedProduct(null);
          if (cat) setSelectedCategory(cat);
          if (sub) setSelectedSub(sub);
          setHasSearched(false);
          setSemanticSearchReason("");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onSearch={handleAISemanticSearchSubmit}
        onOpenStylist={() => setIsStylistOpen(true)}
        userName={userEmail ? userName : null}
        onOpenAuth={() => {
          setAuthMode("login");
          setShowAuthModal(true);
        }}
        onLogout={() => {
          setUserEmail("");
          setUserName("");
          showToast("Secure session logged out.", "info");
          setPage("home");
        }}
      />

      <main className="flex-grow">
        
        {/* SEMANTIC SEARCH REASON IN collection Page */}
        {page === "collection" && hasSearched && semanticSearchReason && (
          <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-transparent border-l-4 border-amber-800 px-5 py-4 flex items-center gap-3.5 shadow-sm rounded-r">
              <Sparkles className="text-amber-800 animate-pulse shrink-0" size={18} />
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-900 font-sans tracking-widest">Maharani Semantic Match Commentary</p>
                <p className="text-xs text-stone-700 italic mt-0.5 leading-relaxed font-sans">{semanticSearchReason}</p>
              </div>
            </div>
          </div>
        )}

        {/* 1. HOME VIEW */}
        {page === "home" && (
          <div className="space-y-16 animate-fade-in">
            {/* Full width Hero */}
            <HeroSlider 
              onExplore={(cat) => {
                setPage("collection");
                if (cat) setSelectedCategory(cat);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }} 
            />

            {/* Saree Heritage Luxury Banner Teaser */}
            <section id="saree-heritage-teaser" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-amber-100/40 border border-amber-200/60 rounded-md p-6 sm:p-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xs">
                <div className="space-y-2 max-w-xl text-center md:text-left">
                  <span className="text-[10px] tracking-[0.25em] font-bold uppercase text-amber-700 font-sans block">
                    Exclusive Handloom Discovery
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-950 leading-tight uppercase tracking-wider">
                    The Seven Saree Empires
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    Uncover our interactive heritage directory outlining regional masterclasses in Varanasi silks, sheer Chanderis, temple border Kanjeevarams, and peacock Paithanis. Complete with difficulty-focused draping guides and an interactive matching quiz.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPage("saree-collection");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-stone-50 font-serif text-xs uppercase tracking-widest py-3.5 px-8 rounded-sm active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Enter Saree Atelier →
                </button>
              </div>
            </section>

            {/* Shop by Category grids */}
            <section id="shop-by-category" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 block mb-1">Visual Explorations</span>
                <h3 className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
                  Shop By Category
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-serif">
                {/* Women category card */}
                <div 
                  onClick={() => {
                    setPage("collection");
                    setSelectedCategory("Women");
                    setSelectedSub("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative h-[400px] border border-amber-50 rounded-sm overflow-hidden shadow-sm cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800"
                    alt="Women"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/45 transition-colors"></div>
                  <div className="absolute inset-x-0 bottom-6 text-center text-white">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Bespoke Silk & Lehengas</p>
                    <h4 className="text-xl font-bold tracking-wide mt-1">Bridal & Women</h4>
                    <span className="inline-block text-[9px] uppercase tracking-wider border-b border-white border-opacity-40 py-1 hover:border-opacity-150 transition h-auto">Browse Atelier</span>
                  </div>
                </div>

                {/* Men category card */}
                <div 
                  onClick={() => {
                    setPage("collection");
                    setSelectedCategory("Men");
                    setSelectedSub("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative h-[400px] border border-amber-50 rounded-sm overflow-hidden shadow-sm cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=800"
                    alt="Men"
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/45 transition-colors"></div>
                  <div className="absolute inset-x-0 bottom-6 text-center text-white">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Traditional Bandhgalas</p>
                    <h4 className="text-xl font-bold tracking-wide mt-1">Grooms & Men</h4>
                    <span className="inline-block text-[9px] uppercase tracking-wider border-b border-white border-opacity-40 py-1 hover:border-opacity-150 transition h-auto">Browse Atelier</span>
                  </div>
                </div>

                {/* Accessories category card */}
                <div 
                  onClick={() => {
                    setPage("collection");
                    setSelectedCategory("Accessories");
                    setSelectedSub("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group relative h-[400px] border border-amber-50 rounded-sm overflow-hidden shadow-sm cursor-pointer"
                >
                  <img
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800"
                    alt="Accessories"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/45 transition-colors"></div>
                  <div className="absolute inset-x-0 bottom-6 text-center text-white">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Kundan gold jewels</p>
                    <h4 className="text-xl font-bold tracking-wide mt-1">Royal Necklaces</h4>
                    <span className="inline-block text-[9px] uppercase tracking-wider border-b border-white border-opacity-40 py-1 hover:border-opacity-150 transition h-auto">Browse Atelier</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Products Grid */}
            <section id="featured-products-home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 block mb-1">Couture Spotlights</span>
                <h3 className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
                  Featured Masterpieces
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.filter(p => p.featured).slice(0, 4).map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => {
                      setSelectedProduct(p);
                      setPage("product");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group border border-amber-50 hover:border-amber-400 bg-white p-3.5 rounded-sm transition cursor-pointer relative shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-72 overflow-hidden mb-3 bg-stone-50">
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[9px] font-sans uppercase font-bold tracking-wider text-amber-700">{p.subCategory}</span>
                      <h4 className="font-serif font-bold text-xs text-amber-950 mt-1 line-clamp-1">{p.name}</h4>
                    </div>
                    <div className="mt-3 flex justify-between items-center pt-2.5 border-t border-amber-50">
                      <span className="text-xs font-serif font-bold text-amber-800">{formatPrice(p.price)}</span>
                      <span className="text-[10px] text-amber-700 underline font-serif">View Details</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Immersive AI Virtual Dressing Room & 360° Drape Section */}
            <section id="home-virtual-dressing-room" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-stone-900 text-stone-100 rounded-md border border-amber-500/25 p-8 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 shadow-xl">
                
                {/* Visual side illustration and live stats */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-800 text-stone-50 p-1 rounded-full animate-pulse">
                      <Sparkles size={14} />
                    </span>
                    <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-amber-300">
                      Interactive Studio Release
                    </span>
                  </div>
                  <h3 className="text-3xl font-serif font-light text-amber-100 uppercase tracking-wide leading-tight">
                    The Royal AI <span className="font-bold text-amber-500 block sm:inline">Dressing Chambers</span>
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed font-sans font-light">
                    Explore high-definition handloom drapes interactively. Drag our 360-degree turntable to inspect pleat weights, upload your own portrait to evaluate bust contour drops, and let Maharani AI draft real-time fabric fluidity and kundan styling recommendations bespoke to your physique.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-stone-950/60 border border-stone-850 rounded-sm">
                      <span className="text-amber-500 font-serif font-bold text-lg block">360°</span>
                      <span className="text-[9px] text-stone-400 font-sans uppercase tracking-wider block mt-1">Multi-angle turntable</span>
                    </div>
                    <div className="p-3 bg-stone-950/60 border border-stone-850 rounded-sm">
                      <span className="text-amber-500 font-serif font-bold text-lg block">Gemini AI</span>
                      <span className="text-[9px] text-stone-400 font-sans uppercase tracking-wider block mt-1">Atelier Consultation</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setShowHomeFittingRoom(true)}
                      className="bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 active:scale-95 text-stone-950 font-serif font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded-sm transition shadow-md cursor-pointer text-center block"
                    >
                      Enter Dressing Rooms ✨
                    </button>
                  </div>
                </div>

                {/* Right creative mockup simulating Try-On */}
                <div className="w-full lg:w-96 shrink-0 bg-stone-950 border border-stone-850 rounded p-4 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-950/90 z-10 pointer-events-none font-bold"></div>
                  
                  {/* Outer Frame Simulating Try-On model */}
                  <div className="relative h-72 rounded overflow-hidden">
                    <img 
                      src={products.find(p => p.id === "prod_saree_banarasi")?.images[0] || "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800"} 
                      alt="Model Dressing preview" 
                      className="w-full h-full object-cover object-top filter grayscale group-hover:grayscale-0 transition duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-stone-900/90 border border-amber-500/20 py-1 px-2.5 rounded text-[9px] text-amber-400 font-serif flex items-center gap-1.5 z-20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      ACTIVE PORTRAIT PROJECTION
                    </div>
                  </div>

                  <div className="pt-3 space-y-1 relative z-20">
                    <p className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Selected drape view:</p>
                    <p className="text-xs font-serif text-amber-100">Bespoke Varanasi Shahi Banarasi Saree</p>
                    <div className="flex justify-between items-center text-[10px] text-amber-400 pt-1.5 font-sans">
                      <span>Pleat Fall: Perfect Rigidity</span>
                      <span>Stitch Code: Pure Katan</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Immersive Wedding Collection Middle Banner */}
            <section id="wedding-cover" className="relative h-[450px] w-full overflow-hidden bg-amber-950 flex items-center">
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200"
                  alt="Wedding Collections"
                  className="w-full h-full object-cover object-center pointer-events-none opacity-45"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/60"></div>
              </div>
              <div className="max-w-3xl mx-auto px-4 text-center text-amber-50 relative z-10 space-y-4">
                <span className="text-[10px] tracking-[0.4em] text-amber-300 font-bold uppercase">THE HAUTE HOUSE ARCHIVES</span>
                <h3 className="text-3xl sm:text-4xl font-serif font-bold tracking-wide leading-tight">
                  Reserve Handcrafted Bespoke Fitting Appointments
                </h3>
                <p className="text-xs font-sans text-amber-100/80 max-w-lg mx-auto leading-relaxed">
                  Every bridal gown undergoes careful tailoring adjustments overseen by our master craftsmen. Arrange premium remote consultations with our styling panel in real time.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => setIsStylistOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-stone-50 font-serif text-xs uppercase tracking-widest py-3.5 px-8 rounded-sm active:scale-95 transition-all shadow-md shadow-amber-900/40"
                  >
                    Begin Consultation with Maharani
                  </button>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section id="guest-testimonials" className="max-w-4xl mx-auto px-4 text-center space-y-6">
              <span className="text-[10px] tracking-widest font-bold uppercase text-amber-700 block">Esteemed Reviews</span>
              <h3 className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
                Client Testimonials
              </h3>
              <div className="bg-white border rounded p-8 shadow-xs relative">
                <div className="text-5xl font-serif text-amber-100 absolute left-8 top-4 select-none">“</div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans italic relative z-15">
                  The raw fuchsia purple Brocade Saree exceeded every dream. Setting up the custom fitting alongside their online chat support was so seamless, in just two calls my custom sizing was registered and fit perfectly on the reception night. Masterful handwork.
                </p>
                <p className="text-xs font-serif font-bold text-amber-950 mt-4">— Dr. Shruti Sen, Mumbai Residence</p>
              </div>
            </section>

            {/* Elegant Newsletter Signup */}
            <section id="home-newsletter" className="bg-amber-50/50 border-t border-b border-amber-100 py-16 text-center">
              <div className="max-w-md mx-auto px-4 space-y-4">
                <h4 className="font-serif font-medium text-amber-950 text-xl uppercase tracking-widest">Join our Elite Atelier list</h4>
                <p className="text-xs text-stone-500 font-sans">Receive private notices regarding handcrafted custom saree drops, sangeet lines, and seasonal runway private edits.</p>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    showToast("A luxurious invitation details catalog envelope has been compiled to your inbox.", "success");
                  }} 
                  className="flex gap-2 pt-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="Provide email address..."
                    className="flex-1 bg-white border border-stone-250 px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                  />
                  <button 
                    type="submit"
                    className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-serif uppercase tracking-widest px-5 py-2 whitespace-nowrap shadow-sm"
                  >
                    Enroll
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}

        {/* 2. COLLECTION CATALOG VIEW */}
        {page === "collection" && (
          <CollectionPage
            products={products}
            initialCategory={selectedCategory}
            initialSubCategory={selectedSub}
            currentCurrency={currency}
            onAddToCart={handleAddToCart}
            onViewProduct={(prod) => {
              setSelectedProduct(prod);
              setPage("product");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}

        {/* 2b. INDIAN SAREE HERITAGE CATALOG VIEW */}
        {page === "saree-collection" && (
          <SareeCollection
            products={products}
            currentCurrency={currency}
            onAddToCart={handleAddToCart}
            onViewProduct={(prod) => {
              setSelectedProduct(prod);
              setPage("product");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onNavigateToCatalog={(category, subCategoryName) => {
              setPage("collection");
              setSelectedCategory(category);
              if (subCategoryName) {
                setSelectedSub(subCategoryName);
              }
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            showToast={showToast}
          />
        )}

        {/* 3. PRODUCT SPECIFIC DETAILS */}
        {page === "product" && selectedProduct && (
          <ProductPage
            product={selectedProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onViewProduct={(p) => setSelectedProduct(p)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentCurrency={currency}
          />
        )}

        {/* 4. SHOPPING CART VIEW SCREEN */}
        {page === "cart" && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
            <h2 className="text-2xl font-serif font-bold text-amber-950 text-center uppercase tracking-widest border-b border-amber-50 pb-5 mb-8">
              My Luxury Shopping Basket
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-20 bg-white border rounded">
                <p className="text-sm text-stone-500 font-sans">Your basket continues to remain empty.</p>
                <button
                  onClick={() => setPage("collection")}
                  className="bg-amber-900 text-white text-xs font-serif uppercase tracking-widest mt-6 py-2.5 px-6 rounded shadow"
                >
                  Explore Beautiful Garments
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cart Items list */}
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return (
                      <div 
                        key={`${item.product.id}-${item.size}`} 
                        className="bg-white border rounded p-4 flex gap-4 shadow-xs relative"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover object-top rounded-sm border"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 pr-10">
                          <span className="text-[9px] uppercase font-bold text-amber-700 font-sans">{item.product.subCategory}</span>
                          <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{item.product.name}</h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Tone Accent: {item.color} | Size: {item.size}
                          </p>
                          <p className="text-xs font-serif font-bold text-amber-800 mt-2">{formatPrice(price)}</p>
                          
                          {/* Quantity selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, item.size, item.color, -1)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold font-sans">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.product.id, item.size, item.color, 1)}
                              className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove item button absolute */}
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id, item.size, item.color)}
                          className="absolute right-4 top-4 text-stone-400 hover:text-rose-700 p-1 rounded-full transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Bill details side check */}
                <div className="bg-white border p-6 rounded-sm h-fit shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-sm text-stone-950 uppercase border-b pb-2">Atelier Pricing Breakdown</h3>
                  
                  <div className="space-y-2 text-xs text-stone-600 font-sans border-b pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal Value:</span>
                      <span className="font-semibold text-stone-900">{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Secure Transit:</span>
                      <span>{cartSubtotal > 30000 ? "Complimentary" : formatPrice(500)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-serif font-bold text-amber-950">
                    <span>Grand pricing:</span>
                    <span className="text-base text-amber-800">{formatPrice(cartSubtotal + (cartSubtotal > 30000 ? 0 : 500))}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!userEmail) {
                        setAuthMode("login");
                        setShowAuthModal(true);
                        showToast("Please authenticate to proceed with luxury checkout.", "info");
                      } else {
                        setPage("checkout");
                      }
                    }}
                    className="w-full bg-amber-900 hover:bg-amber-950 text-white font-serif font-bold tracking-widest text-xs py-3 rounded-sm shadow-md transition cursor-pointer"
                  >
                    Proceed to Haute Checkout →
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 5. CHECKOUT PAGE VIEW */}
        {page === "checkout" && (
          <CheckoutPage
            cartItems={cart.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              price: item.product.discountPrice || item.product.price,
              image: item.product.images[0],
              quantity: item.quantity,
              size: item.size,
              color: item.color
            }))}
            cartSubtotal={cartSubtotal}
            availableCoupons={coupons}
            currentCurrency={currency}
            onPlaceOrder={handlePlaceOrder}
            showToast={showToast}
          />
        )}

        {/* 6. PROFILE DASHBOARD VIEW */}
        {page === "profile" && (
          <ClientDashboard
            userEmail={userEmail}
            userName={userName}
            wishlistProducts={products.filter((p) => wishlist.includes(p.id))}
            savedAddresses={savedAddresses}
            orders={orders}
            onRemoveWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onViewProduct={(p) => {
              setSelectedProduct(p);
              setPage("product");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            handleAddAddress={handleAddAddress}
            handleDeleteAddress={handleDeleteAddress}
            currentCurrency={currency}
          />
        )}

        {/* 7. ADMIN BACKSTAGE PORT PANEL */}
        {page === "admin" && (
          !isAdminAuthenticated ? (
            <div className="max-w-md mx-auto my-16 p-8 bg-white border border-amber-100 rounded-sm shadow-md text-center space-y-6 font-sans">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-800">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-amber-950 uppercase tracking-widest">Atelier Access Verification</h3>
                <p className="text-xs text-stone-500 mt-1 font-sans">This terminal is restricted to Royal Ethnica directors.</p>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPasscode === "1947") {
                    setIsAdminAuthenticated(true);
                    showToast("Atelier administration security cleared.", "success");
                  } else {
                    showToast("Incorrect signature key.", "error");
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="password"
                  placeholder="Enter Secret Passcode (1947)..."
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-250 px-3 py-2 text-xs focus:outline-none focus:border-amber-700 text-center tracking-widest font-mono font-bold"
                />
                <button
                  type="submit"
                  className="w-full bg-amber-900 hover:bg-amber-950 text-white font-serif font-bold tracking-widest text-xs py-2.5 rounded-sm shadow-md transition cursor-pointer"
                >
                  Verify Atelier Key
                </button>
              </form>
            </div>
          ) : (
            <AdminPanel
              products={products}
              orders={orders}
              currentCurrency={currency}
              onAddProduct={handleAdminAddProduct}
              onUpdateProduct={handleAdminUpdateProduct}
              onDeleteProduct={handleAdminDeleteProduct}
              onUpdateOrderStatus={handleAdminOrderStatus}
            />
          )
        )}

      </main>

      {/* Persistent slide-out AI stylist consulting Drawer */}
      <AIStylistDrawer
        isOpen={isStylistOpen}
        onClose={() => setIsStylistOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        onViewProductDetails={(pId) => {
          const matched = products.find((p) => p.id === pId);
          if (matched) {
            setSelectedProduct(matched);
            setPage("product");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        currentCurrency={currency}
      />

      {/* Floating interactive WhatsApp Support button */}
      <div 
        id="whatsapp-floating-support"
        onClick={() => {
          showToast("Opening an encrypted WhatsApp chat channel with Royal Ethnica's private client services in Bandra, Mumbai (+91 91234 56789).", "info");
        }}
        className="fixed bottom-6 right-6 z-30 bg-emerald-600 hover:bg-emerald-700 text-stone-50 p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
        title="WhatsApp Live Support"
      >
        <MessageCircle size={22} className="pointer-events-none text-white fill-white" />
        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline pr-1 font-serif text-white">Guest Support</span>
      </div>

      {/* Visually refined elegant Footer */}
      <footer id="atelier-footer" className="bg-amber-950 text-amber-50/70 border-t border-amber-900/65 py-12 px-4 sm:px-6 lg:px-8 font-serif text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-amber-900/50">
          
          <div className="space-y-2">
            <h4 className="text-amber-100 font-bold uppercase tracking-wider text-base">Royal Ethnica</h4>
            <p className="font-sans leading-relaxed text-amber-50/50 max-w-sm">
              Sown in legacy, styled for the modern era. An elite wedding fashion house crafting magnificent raw red silks, zari weaves, and custom sherwanis.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-amber-100 font-bold uppercase tracking-wider">The Atelier Headquarters</h4>
            <p className="font-sans leading-relaxed text-amber-50/50">
              104 Pearl Heritage, Bandra Stand Road,<br />
              Bandra West, Mumbai, Maharashtra 400050<br />
              Ph: +91 91234 56789 | concierge@royalethnica.in
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-amber-100 font-bold uppercase tracking-wider">Atelier Logistics</h4>
            <p className="font-sans leading-relaxed text-amber-50/50">
              Immediate air courier transit to London, South Mumbai, Jaipur, Dubai, and silicon valley. Complimentary alterations globally.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] font-sans text-amber-100/40 gap-4">
          <p>© {new Date().getFullYear()} Royal Ethnica Haute Couture India Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Guidelines</span>
            <span className="hover:underline cursor-pointer">Bespoke Terms</span>
            <span className="hover:underline cursor-pointer">Secure Gateway Security</span>
          </div>
        </div>
      </footer>

      {showHomeFittingRoom && (
        <VirtualFittingRoom 
          products={products}
          onClose={() => setShowHomeFittingRoom(false)}
          onAddToCart={handleAddToCart}
          currentCurrency={currency}
        />
      )}

      {/* Elegant Authentication Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-amber-100 w-full max-w-sm rounded-sm shadow-2xl p-6 relative font-sans animate-fade-in space-y-4">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-amber-950 p-1 transition"
            >
              <X size={16} />
            </button>

            <div className="text-center">
              <h3 className="font-serif font-bold text-amber-950 text-base uppercase tracking-widest">
                {authMode === "login" ? "Atelier Sign In" : "Noble Enrolment"}
              </h3>
              <p className="text-[10px] text-amber-600 font-sans tracking-widest uppercase mt-0.5">
                {authMode === "login" ? "Welcome to your royal account" : "Begin your couture fashion journey"}
              </p>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const email = (form.elements.namedItem("email") as HTMLInputElement).value;
                const password = (form.elements.namedItem("password") as HTMLInputElement).value;
                const name = authMode === "signup" ? (form.elements.namedItem("name") as HTMLInputElement).value : "";

                try {
                  const url = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
                  const body = authMode === "login" ? { email, password } : { email, password, name };
                  const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setUserEmail(data.user.email);
                    setUserName(data.user.name);
                    setSavedAddresses(data.user.addresses || []);
                    setWishlist(data.user.wishlist || []);
                    setShowAuthModal(false);
                    showToast(`Greetings, ${data.user.name}. Secure session established.`, "success");
                  } else {
                    showToast(data.error || "Authentication encounter failure.", "error");
                  }
                } catch (err) {
                  showToast("Failed to connect to the atelier server.", "error");
                }
              }}
              className="space-y-3"
            >
              {authMode === "signup" && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block font-sans">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="E.g. Maharani Devi"
                    className="w-full bg-stone-50 border border-stone-250 px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-500 block font-sans">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="E.g. client@domain.com"
                  className="w-full bg-stone-50 border border-stone-250 px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-stone-500 block font-sans">Security Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-250 px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-900 hover:bg-amber-950 text-white font-serif font-bold tracking-widest text-xs py-2.5 rounded-sm shadow-md transition cursor-pointer mt-3"
              >
                {authMode === "login" ? "Establish Session" : "Register Signature"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-amber-50 text-[10px] text-stone-500">
              {authMode === "login" ? (
                <p>
                  New to our house?{" "}
                  <button 
                    onClick={() => setAuthMode("signup")}
                    className="text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Enrol as client
                  </button>
                </p>
              ) : (
                <p>
                  Already have a profile?{" "}
                  <button 
                    onClick={() => setAuthMode("login")}
                    className="text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Elegant Atelier Toast Notification Stack */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded shadow-lg text-xs font-sans tracking-wide text-white border pointer-events-auto transition-all duration-300 max-w-sm flex items-center gap-2 animate-fade-in ${
              toast.type === "success" 
                ? "bg-amber-900 border-amber-800" 
                : toast.type === "error" 
                  ? "bg-rose-900 border-rose-800" 
                  : "bg-stone-900 border-stone-800"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
