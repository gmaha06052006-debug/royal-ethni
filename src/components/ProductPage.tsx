import React, { useState } from "react";
import { Heart, ShoppingBag, Share2, Ruler, Shield, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Product } from "../types";
import VirtualFittingRoom from "./VirtualFittingRoom";
import SareeCanvas3D from "./SareeCanvas3D";

interface ProductPageProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, size: string, color: string) => void;
  onViewProduct: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  currentCurrency: string;
}

export default function ProductPage({
  product,
  allProducts,
  onAddToCart,
  onViewProduct,
  wishlist,
  onToggleWishlist,
  currentCurrency
}: ProductPageProps) {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "Custom Fit");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Default");
  const [activeTab, setActiveTab] = useState<"craft" | "fabric" | "shipping">("craft");
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showVirtualFitting, setShowVirtualFitting] = useState(false);
  const [view3DMode, setView3DMode] = useState(false);

  const isSaved = wishlist.includes(product.id);
  const hasDiscount = product.discountPrice !== undefined;

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  // Find related products in same category
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div id="product-details-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Back button wrapper */}
      <div className="mb-6">
        <button
          onClick={() => {
            // Force a scroll top and fallback navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-xs text-amber-900 group hover:text-amber-700 flex items-center gap-1.5 font-serif font-bold uppercase tracking-wider"
        >
          ← Back to Collections
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: MULTI-IMAGE GALLERIES */}
        <div id="product-gallery-section" className="space-y-4">
          
          {/* View Toggle Controls */}
          <div className="flex justify-between items-center bg-amber-50/40 p-2 rounded-sm border border-amber-100">
            <span className="text-[9.5px] font-sans font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
              Studio Visualizer Active
            </span>
            <div className="flex gap-1 bg-stone-100 p-0.5 rounded border border-stone-200">
              <button
                onClick={() => setView3DMode(false)}
                className={`px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-wider rounded-sm cursor-pointer transition ${
                  !view3DMode ? "bg-amber-950 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                📷 Atelier Image
              </button>
              <button
                onClick={() => setView3DMode(true)}
                className={`px-3 py-1 text-[9px] font-sans font-bold uppercase tracking-wider rounded-sm cursor-pointer transition flex items-center gap-1 ${
                  view3DMode ? "bg-amber-950 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <RefreshCw size={10} className={view3DMode ? "animate-spin" : ""} /> ✨ Interactive 3D Model
              </button>
            </div>
          </div>

          {/* Main Stage Image / R3F 3D Canvas */}
          <div className="h-[480px] sm:h-[580px] bg-stone-100 border border-amber-100 rounded-sm overflow-hidden relative">
            {view3DMode ? (
              <SareeCanvas3D product={product} selectedColor={selectedColor} />
            ) : (
              <>
                <img
                  src={product.images[selectedImgIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                  referrerPolicy="no-referrer"
                />
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-amber-900 text-amber-50 font-serif text-[10px] tracking-widest uppercase py-1 px-3">
                    Wedding special rate
                  </span>
                )}
              </>
            )}
          </div>

          {/* Sizing indicators underneath main stage if more than 1 image exists */}
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIdx(idx)}
                  className={`w-20 h-24 border rounded-sm overflow-hidden bg-stone-50 transition ${
                    selectedImgIdx === idx ? "border-amber-800 ring-1 ring-amber-800" : "border-stone-200"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - ${idx}`}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REFINED PANELS DETAILS */}
        <div id="product-details-form" className="space-y-6">
          <div>
            <span className="text-[11px] font-sans text-amber-600 tracking-widest uppercase font-bold">
              {product.category} • {product.subCategory}
            </span>
            <h2 className="text-3xl font-serif font-bold text-amber-950 mt-1 leading-tight">
              {product.name}
            </h2>
            
            {/* Reviews count */}
            <div className="flex items-center gap-2 mt-2">
              <div className="text-amber-500 font-sans text-sm">★★★★★</div>
              <span className="text-stone-500 text-xs font-sans">
                {product.reviews.length > 0 ? `${product.rating} / 5 (${product.reviews.length} Verified Client Reviews)` : "No historic reviews yet, handcrafted on reservation"}
              </span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-4 bg-amber-50/55 border border-amber-100 rounded-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Exclusive Atelier Rate</span>
              <div className="flex items-center gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-2xl font-serif font-semibold text-amber-950">
                      {formatPrice(product.discountPrice!)}
                    </span>
                    <span className="text-sm text-stone-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-serif font-semibold text-amber-950">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] uppercase font-bold px-2 py-1 rounded font-sans">
                Handloom Certified
              </span>
            </div>
          </div>

          <p className="text-stone-700 text-sm leading-relaxed font-sans font-light">
            {product.description}
          </p>

          {/* Colors Selection Grid */}
          <div className="space-y-2.5">
            <span className="text-xs font-serif text-amber-950 tracking-wider uppercase font-bold block">Select Tone Accent</span>
            <div className="flex gap-2">
              {product.colors.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(col)}
                  className={`text-xs px-4 py-1.5 rounded-full border transition ${
                    selectedColor === col
                      ? "bg-amber-950 text-white border-amber-950"
                      : "bg-white text-amber-950 border-amber-100 hover:border-amber-400"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Sizing selection panel */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-serif text-amber-950 font-bold uppercase tracking-wider">
              <span>Client Sizing Selection</span>
              <button 
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-[10px] text-amber-700 flex items-center gap-1 hover:underline cursor-pointer lowercase tracking-normal"
              >
                <Ruler size={12} /> size matrix guide
              </button>
            </div>

            {/* Micro Size Guide block */}
            {showSizeGuide && (
              <div className="bg-stone-100 border border-amber-100 p-3 rounded-md text-stone-600 text-[10px] space-y-1.5 transition">
                <p className="font-bold">Standard Sizing Metric (Chest Dimensions):</p>
                <ul className="list-disc pl-5 font-sans">
                  <li>Small (XS/S): 34 - 36 IN</li>
                  <li>Medium (M): 38 - 40 IN</li>
                  <li>Large (L): 42 - 44 IN</li>
                  <li>Custom-fit: Our atelier contacts you post-purchase for detailed tailoring specs.</li>
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`text-xs px-3.5 py-2 border rounded transition ${
                    selectedSize === sz
                      ? "bg-amber-900 text-amber-50 border-amber-900"
                      : "bg-white text-stone-900 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* CTA ACTIONS ADD TO CART & WISHLIST */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-amber-50">
            <button
              onClick={() => onAddToCart(product, selectedSize, selectedColor)}
              className="flex-1 bg-gradient-to-r from-amber-900 to-amber-700 hover:brightness-110 active:scale-95 text-stone-50 font-serif font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-sm shadow-md flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag size={14} /> Incorporate Into Atelier Bag
            </button>
            
            <button
              onClick={() => onToggleWishlist(product.id)}
              className={`p-4 border rounded-sm flex items-center justify-center transition active:scale-95 ${
                isSaved
                  ? "bg-rose-50 border-rose-300 text-rose-700"
                  : "bg-white hover:bg-stone-50 border-stone-200 text-stone-500"
              }`}
            >
              <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>

          {/* AI Virtual Try-On Fitting & 360° Drape Teaser Panel */}
          {(product.subCategory.toLowerCase().includes("saree") || product.name.toLowerCase().includes("saree")) && (
            <div id="ai-teaser-panel" className="bg-amber-50/70 border border-amber-200 p-4 rounded-sm space-y-3 shadow-xs">
              <div className="flex items-start gap-2.5">
                <span className="bg-amber-900 text-stone-100 p-1.5 rounded-full shrink-0">
                  <Sparkles size={14} className="animate-pulse" />
                </span>
                <div>
                  <h4 className="font-serif font-bold text-xs text-amber-950 uppercase tracking-widest">
                    AI Saree Fitting Room & 360° Drape
                  </h4>
                  <p className="text-[10px] text-stone-600 font-sans leading-relaxed mt-0.5">
                    See the luxury handloom drape from 8 virtual camera angles, upload your photo to simulate styling curves, and consult Maharani AI for pleating and custom jewelry suggestions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowVirtualFitting(true);
                  // Ensure window is scrolled slightly or modal triggers nicely
                }}
                className="w-full bg-amber-950 hover:bg-amber-900 border border-amber-800 text-stone-100 text-[10px] font-serif uppercase tracking-widest py-3 px-4 rounded shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={12} /> Launch Interactive Dressing Room ✨
              </button>
            </div>
          )}

          <div className="border border-amber-100 rounded-sm">
            {/* Elegant detail Tabs Header */}
            <div className="flex border-b border-amber-100 text-xs font-serif uppercase tracking-widest text-amber-950">
              <button
                onClick={() => setActiveTab("craft")}
                className={`flex-1 py-3 text-center border-r border-amber-100 font-bold transition ${
                  activeTab === "craft" ? "bg-amber-50" : "bg-white hover:bg-stone-50"
                }`}
              >
                The Craftsmanship
              </button>
              <button
                onClick={() => setActiveTab("fabric")}
                className={`flex-1 py-3 text-center border-r border-amber-100 font-bold transition ${
                  activeTab === "fabric" ? "bg-amber-50" : "bg-white hover:bg-stone-50"
                }`}
              >
                Fine Weave Fabrics
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`flex-1 py-3 text-center font-bold transition ${
                  activeTab === "shipping" ? "bg-amber-50" : "bg-white hover:bg-stone-50"
                }`}
              >
                Delivery & Care
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-4 text-xs leading-relaxed text-stone-600 font-sans">
              {activeTab === "craft" && (
                <p className="flex items-start gap-2.5">
                  <Sparkles size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>{product.craftsmanship}</span>
                </p>
              )}
              {activeTab === "fabric" && (
                <p className="flex items-start gap-2.5">
                  <Shield size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <span>Base properties: {product.fabric} - genuine yarn, handcrafted margins.</span>
                </p>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-2">
                  <p className="font-bold text-amber-900 uppercase tracking-widest text-[9px]">Atelier Storage Guidelines</p>
                  <p>{product.careInstructions}</p>
                  <p className="text-[10px] text-stone-400">Complimentary global white glove delivery inside structural velvet boxes in 12-14 business days.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* VERIFIED CLIENT REVIEWS */}
      <section id="reviews-block" className="mt-16 border-t border-amber-100 pt-10">
        <h3 className="font-serif font-bold text-lg text-amber-950 uppercase tracking-widest mb-6">
          Atelier Guest Reviews
        </h3>
        
        {product.reviews.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 border rounded-sm">
            <p className="text-xs text-stone-500 font-sans">This masterpiece is individually tailored post reserving. Be the first to catalog your styling review once finished.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-white border border-stone-100 rounded-sm space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <p className="font-bold text-amber-950 font-serif">{rev.author}</p>
                  <p className="text-stone-400">{rev.date}</p>
                </div>
                <div className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</div>
                <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RELATED MASTERPIECES CROSS SELL */}
      {related.length > 0 && (
        <section id="related-products-block" className="mt-16 border-t border-amber-100 pt-10">
          <h3 className="font-serif font-bold text-lg text-amber-950 uppercase tracking-widest text-center mb-8">
            Complete the Royal Ensembles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((p) => (
              <div 
                key={p.id} 
                onClick={() => {
                  onViewProduct(p);
                  setSelectedImgIdx(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="group border border-amber-50 hover:border-amber-400 p-3 bg-white rounded-sm cursor-pointer hover:shadow-md transition text-center"
              >
                <div className="h-64 overflow-hidden mb-3.5 bg-stone-50">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-amber-700 font-sans font-bold">{p.subCategory}</span>
                <h4 className="font-serif font-bold text-xs text-amber-950 mt-1 line-clamp-1">{p.name}</h4>
                <p className="text-xs font-serif font-bold text-amber-800 mt-1">{formatPrice(p.price)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {showVirtualFitting && (
        <VirtualFittingRoom 
          products={allProducts}
          initialProduct={product}
          onClose={() => setShowVirtualFitting(false)}
          onAddToCart={onAddToCart}
          currentCurrency={currentCurrency}
        />
      )}

    </div>
  );
}
