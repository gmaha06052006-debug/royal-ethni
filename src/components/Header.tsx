import React, { useState } from "react";
import { Search, ShoppingBag, Heart, User, MessageCircle, DollarSign, Menu, X } from "lucide-react";
import { Product } from "../types";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentCurrency: string;
  setCurrency: (curr: string) => void;
  onNavigate: (page: string, categoryFilter?: string, subCategoryFilter?: string) => void;
  onSearch: (query: string) => void;
  onOpenStylist: () => void;
  userName: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentCurrency,
  setCurrency,
  onNavigate,
  onSearch,
  onOpenStylist,
  userName,
  onOpenAuth,
  onLogout
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal);
    }
  };

  const navCategories = [
    {
      name: "Women",
      sub: ["Bridal Lehengas", "Wedding Lehengas", "Designer Sarees", "Silk Sarees", "Salwar Suits", "Anarkali Suits"]
    },
    {
      name: "Men",
      sub: ["Sherwani", "Kurta Sets", "Nehru Jackets"]
    },
    {
      name: "Accessories",
      sub: ["Jewellery", "Necklaces"]
    }
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm transition-all duration-300">
      {/* Top Banner Alert */}
      <div className="bg-amber-950 text-amber-100 text-xs py-2 text-center font-serif tracking-widest uppercase">
        Complimentary Custom Tailoring on all Bridal Haute Couture | Shipping Worldwide
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button
          id="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-amber-950 p-1"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Identity / Logo */}
        <div 
          id="brand-logo"
          className="cursor-pointer text-center flex-shrink-0"
          onClick={() => onNavigate("home")}
        >
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-widest text-amber-950 uppercase select-none">
            Royal <span className="font-light italic text-amber-700">Ethnica</span>
          </h1>
          <p className="text-[9px] tracking-[0.25em] text-amber-600 uppercase font-sans">
            Haute Couture India
          </p>
        </div>

        {/* Desktop Search */}
        <form 
          id="desktop-search-form"
          onSubmit={handleSearchSubmit} 
          className="hidden md:flex items-center flex-1 max-w-sm relative"
        >
          <input
            type="text"
            placeholder="AI Powered Search... (e.g. Sage Green Saree)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-amber-50/50 border border-amber-200/60 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-amber-700 font-sans focus:ring-1 focus:ring-amber-700 text-amber-950"
          />
          <button type="submit" className="absolute right-3 text-amber-700 hover:text-amber-950">
            <Search size={16} />
          </button>
        </form>

        {/* Utilities: Currency, Profile, Stylist, Wishlist, Cart */}
        <div id="header-utilities" className="flex items-center gap-3 sm:gap-4">
          {/* Currency Selector */}
          <div className="relative group hidden sm:flex items-center text-xs font-serif text-amber-950 cursor-pointer py-1">
            <span className="font-sans font-medium mr-1">
              {currentCurrency === "INR" ? "₹ INR" : "$ USD"}
            </span>
            <div className="absolute right-0 top-full mt-1 bg-white border border-amber-100 shadow-xl rounded-md py-1 hidden group-hover:block w-24">
              <button 
                onClick={() => setCurrency("INR")} 
                className="w-full text-left px-3 py-1.5 hover:bg-amber-50 text-xs font-sans text-amber-950 rounded-md"
              >
                ₹ INR
              </button>
              <button 
                onClick={() => setCurrency("USD")} 
                className="w-full text-left px-3 py-1.5 hover:bg-amber-50 text-xs font-sans text-amber-950 rounded-md"
              >
                $ USD
              </button>
            </div>
          </div>

          {/* AI Stylist Assistant Button (Elegant Callout) */}
          <button
            id="ai-stylist-trigger"
            onClick={onOpenStylist}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-900 to-amber-700 text-amber-50 text-xs py-1.5 px-3 rounded-full shadow hover:brightness-110 active:scale-95 transition-all font-serif"
          >
            <MessageCircle size={14} className="animate-pulse" />
            <span className="hidden sm:inline">AI Stylist</span>
          </button>

          {/* Wishlist */}
          <button
            id="header-wishlist"
            onClick={() => onNavigate("profile")}
            className="relative p-1.5 hover:bg-amber-50 rounded-full transition text-amber-900"
            title="Wishlist & Profile"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-700 text-white font-sans text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Toggle */}
          <button
            id="header-cart"
            onClick={() => onNavigate("cart")}
            className="relative p-1.5 hover:bg-amber-50 rounded-full transition text-amber-900"
            title="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-700 text-white font-sans text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Profile Button */}
          <div className="relative group p-1.5 hover:bg-amber-50 rounded-full transition text-amber-900 cursor-pointer">
            <User size={18} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-amber-100 shadow-xl rounded-md py-2 hidden group-hover:block w-48 text-left">
              {userName ? (
                <>
                  <div className="px-4 py-2 border-b border-amber-50">
                    <p className="text-[10px] text-amber-600 font-sans uppercase">Welcome back</p>
                    <p className="text-xs font-semibold text-amber-950 font-serif truncate">{userName}</p>
                  </div>
                  <button 
                    onClick={() => onNavigate("profile")} 
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-xs text-amber-900 font-sans"
                  >
                    Client Dashboard
                  </button>
                  <button 
                    onClick={() => onNavigate("admin")} 
                    className="w-full text-left px-4 py-2 hover:bg-amber-50 text-xs text-amber-900 font-sans border-t border-amber-50"
                  >
                    Atelier Admin Panel
                  </button>
                  <button 
                    onClick={onLogout} 
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-xs text-rose-800 font-sans border-t border-amber-50 font-bold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="p-3 text-center">
                  <p className="text-[10px] text-stone-500 font-sans mb-2">Access your bespoke profile</p>
                  <button 
                    onClick={onOpenAuth} 
                    className="w-full bg-amber-900 hover:bg-amber-950 text-white font-serif font-bold text-[10px] py-1.5 px-3 rounded-sm shadow-sm transition uppercase tracking-widest cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Main Mega Menu Navigation */}
      <nav id="desktop-nav" className="hidden lg:block bg-amber-50/40 border-t border-b border-amber-100/60 font-serif text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-center gap-10 py-3 text-amber-950 tracking-wider font-medium">
            <li className="hover:text-amber-700 cursor-pointer font-serif" onClick={() => onNavigate("home")}>
              Home
            </li>

            <li className="hover:text-amber-700 cursor-pointer font-serif font-bold text-amber-800 flex items-center gap-1" onClick={() => onNavigate("saree-collection")}>
              ✨ Saree Heritage
            </li>

            {navCategories.map((cat) => (
              <li key={cat.name} className="relative group py-1 cursor-pointer hover:text-amber-700">
                <span onClick={() => onNavigate("collection", cat.name)} className="flex items-center">
                  {cat.name}
                </span>
                
                {/* Mega Menu Dropdown */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[500px] bg-white border border-amber-100 shadow-xl rounded-b-lg p-6 grid grid-cols-2 gap-4 text-left invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div>
                    <h4 className="text-xs tracking-widest text-amber-700 font-serif font-bold border-b border-amber-50 pb-2 mb-3 uppercase">
                      Bespoke Collections
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-amber-900">
                      {cat.sub.slice(0, 3).map((sub) => (
                        <li 
                          key={sub} 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("collection", cat.name, sub);
                          }}
                          className="hover:translate-x-1 hover:text-amber-700 transition"
                        >
                          {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs tracking-widest text-amber-700 font-serif font-bold border-b border-amber-50 pb-2 mb-3 uppercase">
                      Seasonal Edits
                    </h4>
                    <ul className="space-y-2 text-xs font-sans text-amber-900">
                      {cat.sub.slice(3).map((sub) => (
                        <li 
                          key={sub} 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("collection", cat.name, sub);
                          }}
                          className="hover:translate-x-1 hover:text-amber-700 transition"
                        >
                          {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-amber-50 text-center font-serif italic text-xs text-amber-600">
                    Sown in Lucknow & Jaipur, Custom tailored for you.
                  </div>
                </div>
              </li>
            ))}

            <li className="hover:text-amber-700 cursor-pointer" onClick={() => onNavigate("collection")}>
              Explore Master Catalog
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Slide-out */}
      {mobileMenuOpen && (
        <div id="mobile-nav" className="lg:hidden bg-white border-b border-amber-100 px-4 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex relative items-center">
            <input
              type="text"
              placeholder="Search Royal Ethnica..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-amber-50/50 border border-amber-100 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none"
            />
            <button type="submit" className="absolute right-3 text-amber-700">
              <Search size={14} />
            </button>
          </form>

          <ul className="space-y-3 font-serif text-amber-950 text-sm">
            <li onClick={() => { onNavigate("home"); setMobileMenuOpen(false); }} className="hover:text-amber-700">
              Home
            </li>
            <li onClick={() => { onNavigate("saree-collection"); setMobileMenuOpen(false); }} className="hover:text-amber-700 font-bold text-amber-800 flex items-center gap-1">
              ✨ Saree Heritage Catalog
            </li>
            {navCategories.map((cat) => (
              <li key={cat.name} className="space-y-1">
                <span 
                  onClick={() => { onNavigate("collection", cat.name); setMobileMenuOpen(false); }}
                  className="font-bold text-amber-800 hover:text-amber-950"
                >
                  {cat.name}
                </span>
                <ul className="pl-3 space-y-1 text-xs font-sans text-amber-950/80">
                  {cat.sub.map((sub) => (
                    <li 
                      key={sub} 
                      onClick={() => { onNavigate("collection", cat.name, sub); setMobileMenuOpen(false); }}
                      className="hover:text-amber-700"
                    >
                      {sub}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            <li onClick={() => { onNavigate("collection"); setMobileMenuOpen(false); }} className="hover:text-amber-700 pt-2 border-t border-amber-50">
              Explore Master Catalog
            </li>
            <li onClick={() => { onNavigate("profile"); setMobileMenuOpen(false); }} className="hover:text-amber-700">
              My Profile & Wishlist
            </li>
            <li onClick={() => { onNavigate("admin"); setMobileMenuOpen(false); }} className="hover:text-amber-700 text-amber-700 font-bold">
              Admin Backstage
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
