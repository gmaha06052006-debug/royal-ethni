import React, { useState, useMemo } from "react";
import { SlidersHorizontal, Grid, Search, Heart, Eye, ShoppingCart, Check } from "lucide-react";
import { Product } from "../types";

interface CollectionPageProps {
  products: Product[];
  initialCategory?: string;
  initialSubCategory?: string;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currentCurrency: string;
}

export default function CollectionPage({
  products,
  initialCategory = "",
  initialSubCategory = "",
  onAddToCart,
  onViewProduct,
  wishlist,
  onToggleWishlist,
  currentCurrency
}: CollectionPageProps) {
  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSub, setSelectedSub] = useState<string>(initialSubCategory);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("featured");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Sync with prop changes
  React.useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedSub(initialSubCategory);
  }, [initialCategory, initialSubCategory]);

  const occasions = ["Wedding", "Main Ceremony", "Sangeet", "Mehendi", "Reception", "Haldi", "Festive Celebrations"];
  const colors = ["Crimson Red", "Champagne Gold", "Ivory Cream", "Fuchsia Pink", "Mustard Gold", "Royal Ivory", "Mint Green", "Sage Green", "Emerald Gold", "Crimson Maroon"];
  const sizes = ["S", "M", "L", "XL", "Custom Fit"];

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  // Memoized filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Subcategory match
      if (selectedSub && p.subCategory.toLowerCase() !== selectedSub.toLowerCase()) {
        return false;
      }
      // Max price match
      const activePrice = p.discountPrice || p.price;
      if (activePrice > maxPrice) {
        return false;
      }
      // Color match
      if (selectedColor && !p.colors.some((c) => c.toLowerCase().includes(selectedColor.toLowerCase()))) {
        return false;
      }
      // Size match
      if (selectedSize && !p.sizes.some((s) => s.toLowerCase().includes(selectedSize.toLowerCase()))) {
        return false;
      }
      // Occasion match
      if (selectedOccasion && !p.occasion.some((o) => o.toLowerCase().includes(selectedOccasion.toLowerCase()))) {
        return false;
      }
      // Search term match
      if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      const pA = a.discountPrice || a.price;
      const pB = b.discountPrice || b.price;
      if (sortOption === "price_asc") return pA - pB;
      if (sortOption === "price_desc") return pB - pA;
      if (sortOption === "rating") return b.rating - a.rating;
      return b.featured ? 1 : -1; // Default featured
    });
  }, [products, selectedCategory, selectedSub, maxPrice, selectedColor, selectedSize, selectedOccasion, sortOption, searchTerm]);

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedSub("");
    setMaxPrice(200000);
    setSelectedColor("");
    setSelectedSize("");
    setSelectedOccasion("");
    setSortOption("featured");
    setSearchTerm("");
  };

  return (
    <div id="collection-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title Header */}
      <div className="text-center mb-10 py-6 border-b border-amber-100">
        <h2 className="text-3xl font-serif font-bold text-amber-950 uppercase tracking-widest">
          {selectedCategory ? `${selectedCategory} Collection` : "Royal Master Catalog"}
        </h2>
        <p className="text-xs text-amber-600 font-sans tracking-widest uppercase mt-1">
          {selectedSub ? `${selectedSub} Edit` : "Intricately detailed garments crafted with absolute prestige"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden w-full">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full bg-amber-900 hover:bg-amber-950 text-white text-xs font-serif uppercase tracking-widest py-3 px-4 rounded shadow-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99] border border-amber-850"
          >
            <SlidersHorizontal size={14} /> 
            {showMobileFilters ? "Hide Filtering Options" : "Refine / Filter Collections"}
          </button>
        </div>
        
        {/* SIDEBAR FILTERS */}
        <aside 
          id="catalog-sidebar" 
          className={`bg-white border border-amber-100 rounded-sm p-6 space-y-6 h-fit h-auto shadow-xs lg:block ${
            showMobileFilters ? "block animate-fade-in" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between border-b border-amber-50 pb-3">
            <h3 className="font-serif font-bold text-sm tracking-widest text-amber-950 uppercase flex items-center gap-2">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-[10px] text-amber-700 hover:text-amber-950 font-sans uppercase tracking-wider font-bold hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Search bar inside filters */}
          <div className="space-y-2">
            <h4 className="text-xs font-serif text-amber-950 font-bold uppercase tracking-wider">Search Keywords</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex. Silk, Lehengas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-amber-50/20 border border-amber-200 rounded px-3 py-1.5 text-xs text-amber-950 focus:outline-none focus:border-amber-700 font-sans"
              />
              <Search size={14} className="absolute right-3 top-2.5 text-amber-600" />
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-serif text-amber-950 font-bold uppercase tracking-wider">Max Budget</h4>
              <span className="text-xs font-serif font-bold text-amber-800">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-800 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-sans">
              <span>{formatPrice(5000)}</span>
              <span>{formatPrice(200000)}</span>
            </div>
          </div>

          {/* Sizing Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-serif text-amber-950 font-bold uppercase tracking-wider">Size</h4>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
                  className={`text-[10px] uppercase font-sans border px-2.5 py-1 rounded transition-color ${
                    selectedSize === sz
                      ? "bg-amber-900 border-amber-900 text-amber-50"
                      : "bg-white border-amber-100 text-amber-950 hover:border-amber-400"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-serif text-amber-950 font-bold uppercase tracking-wider">Occasion</h4>
            <div className="space-y-1.5">
              {occasions.map((occ) => (
                <label key={occ} className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 hover:text-amber-900 select-none">
                  <input
                    type="checkbox"
                    checked={selectedOccasion === occ}
                    onChange={() => setSelectedOccasion(selectedOccasion === occ ? "" : occ)}
                    className="rounded border-amber-300 text-amber-800 accent-amber-800 focus:ring-amber-500"
                  />
                  <span>{occ}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Color Palettes Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-serif text-amber-950 font-bold uppercase tracking-wider">Color Palette</h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {colors.map((col) => (
                <label key={col} className="flex items-center gap-2 cursor-pointer text-xs text-stone-600 hover:text-amber-900 select-none">
                  <input
                    type="checkbox"
                    checked={selectedColor === col}
                    onChange={() => setSelectedColor(selectedColor === col ? "" : col)}
                    className="rounded border-amber-300 text-amber-800 accent-amber-800"
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* COMPILATION AND GRID RESULTS */}
        <div className="lg:col-span-3 space-y-6">
          {/* Grid control banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50/50 border border-amber-100 rounded-sm px-4 py-3 text-stone-500 text-xs">
            <p className="font-sans">
              Showing <span className="font-bold text-amber-950">{filteredProducts.length}</span> bespoke masterpieces
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-sans">Sort By:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-amber-100 py-1 px-2.5 rounded-sm focus:outline-none focus:border-amber-700 text-amber-950 cursor-pointer"
                >
                  <option value="featured">Royal Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Best Rated</option>
                </select>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-dashed border-amber-200 rounded-sm">
              <h3 className="font-serif font-bold text-lg text-amber-950 mb-1 uppercase tracking-widest">No garments match</h3>
              <p className="text-xs text-stone-500 mb-6 font-sans">Our AI stylists are ready to draft custom collections just for you!</p>
              <button 
                onClick={handleResetFilters}
                className="bg-amber-900 text-white font-serif tracking-widest uppercase text-xs px-6 py-2.5 hover:bg-amber-950 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const isSaved = wishlist.includes(p.id);
                const hasDiscount = p.discountPrice !== undefined;
                return (
                  <div 
                    key={p.id} 
                    className="group bg-white border border-amber-100 rounded-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 relative"
                  >
                    {/* Status Badge */}
                    {p.isNewArrival && (
                      <span className="absolute top-3 left-3 z-10 bg-amber-800 text-white font-serif tracking-wider uppercase text-[8px] px-2.5 py-1 shadow-sm font-bold">
                        Aura Edit
                      </span>
                    )}
                    {p.bestSeller && (
                      <span className="absolute top-3 left-3 z-10 bg-amber-900 text-amber-100 font-serif tracking-wider uppercase text-[8px] px-2.5 py-1 shadow-sm font-bold">
                        Signature Line
                      </span>
                    )}

                    {/* Image Area with Hover Zoom */}
                    <div className="h-80 overflow-hidden relative bg-stone-100 flex-shrink-0 cursor-pointer" onClick={() => onViewProduct(p)}>
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      {/* Dark overlay with quick controls */}
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(p.id);
                          }}
                          className={`p-2 rounded-full shadow-md transition ${
                            isSaved 
                              ? "bg-rose-700 text-white" 
                              : "bg-white text-amber-950 hover:bg-amber-50"
                          }`}
                          title="Save to Wishlist"
                        >
                          <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewProduct(p);
                          }}
                          className="bg-white text-amber-950 hover:bg-amber-50 p-2 rounded-full shadow-md transition"
                          title="Bespoke Quick View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(p, p.sizes[0], p.colors[0]);
                          }}
                          className="bg-amber-900 hover:bg-amber-950 text-white p-2 rounded-full shadow-md transition"
                          title="Add to Royal Bag"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Details Panel */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] tracking-wider text-amber-600 font-sans uppercase font-bold">{p.subCategory}</span>
                        <h4 
                          className="font-serif font-bold text-sm text-amber-950 mt-1 hover:text-amber-700 cursor-pointer line-clamp-1"
                          onClick={() => onViewProduct(p)}
                        >
                          {p.name}
                        </h4>
                        
                        {/* Star Rating summary */}
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500">
                          <span>★</span>
                          <span className="font-semibold text-stone-600">{p.rating}</span>
                        </div>
                      </div>

                      {/* Prices */}
                      <div className="mt-3 flex items-center justify-between border-t border-amber-50/60 pt-3">
                        <div className="flex items-center gap-2">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm font-serif font-bold text-amber-800">
                                {formatPrice(p.discountPrice!)}
                              </span>
                              <span className="text-xs text-stone-400 line-through">
                                {formatPrice(p.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-serif font-bold text-amber-950">
                              {formatPrice(p.price)}
                            </span>
                          )}
                        </div>
                        
                        <span className={`text-[9px] font-bold font-sans uppercase px-1.5 py-0.5 rounded ${
                          p.stock > 0 ? "text-green-700 bg-green-50" : "text-amber-800 bg-amber-50"
                        }`}>
                          {p.stock > 0 ? "In Stock" : "Reserve Fitting"}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
