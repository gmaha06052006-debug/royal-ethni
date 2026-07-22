import React, { useState } from "react";
import { Heart, Landmark, Trash2, ShieldCheck, MapPin, Plus, PackageCheck, Eye, Compass } from "lucide-react";
import { Product, Order, SavedAddress } from "../types";

interface ClientDashboardProps {
  userEmail: string;
  userName: string;
  wishlistProducts: Product[];
  savedAddresses: SavedAddress[];
  orders: Order[];
  onRemoveWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onViewProduct: (product: Product) => void;
  handleAddAddress: (addr: Omit<SavedAddress, "id">) => void;
  handleDeleteAddress: (addrId: string) => void;
  currentCurrency: string;
}

export default function ClientDashboard({
  userEmail,
  userName,
  wishlistProducts,
  savedAddresses,
  orders,
  onRemoveWishlist,
  onAddToCart,
  onViewProduct,
  handleAddAddress,
  handleDeleteAddress,
  currentCurrency
}: ClientDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses">("orders");
  const [showNewAddress, setShowNewAddress] = useState(false);

  // New Address form states
  const [addrName, setAddrName] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrPhone, setAddrPhone] = useState("");

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  const onAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrState || !addrZip) return;
    handleAddAddress({
      name: addrName || "New Address",
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zip: addrZip,
      phone: addrPhone,
      isDefault: savedAddresses.length === 0
    });
    setAddrName("");
    setAddrStreet("");
    setAddrCity("");
    setAddrState("");
    setAddrZip("");
    setAddrPhone("");
    setShowNewAddress(false);
  };

  // Tracking milestones status mapping helper
  const getTimelineSteps = (status: "Pending" | "Tailoring" | "Shipped" | "Delivered") => {
    const steps = [
      { key: "Pending", title: "Consignment Confirmed", desc: "Design draft finalized" },
      { key: "Tailoring", title: "Tailoring Atelier", desc: "Master handcraft zardozi stitch" },
      { key: "Shipped", title: "In White-glove Transit", desc: "Premium courier allocated" },
      { key: "Delivered", title: "Delivered", desc: "Arrived at residence" }
    ];

    const activeWeights: Record<string, number> = {
      "Pending": 1,
      "Tailoring": 2,
      "Shipped": 3,
      "Delivered": 4
    };

    return steps.map((st) => ({
      ...st,
      active: activeWeights[status] >= activeWeights[st.key]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Visual Welcome Ribbon */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-sm p-6 sm:p-8 text-amber-50 shadow-md relative overflow-hidden mb-8">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 select-none font-serif text-9xl">R</div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest text-amber-300 font-bold uppercase block">Royal Ethnica Elite Member</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">{userName}</h2>
            <p className="text-xs text-amber-100/80 font-sans">{userEmail} • Sibling of the Royal Craft</p>
          </div>
          <div className="flex gap-4 items-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-sm">
            <ShieldCheck className="text-amber-300 pointer-events-none" size={24} />
            <div className="text-[10px] font-sans leading-tight">
              <p className="text-amber-300 uppercase tracking-wider font-bold">Client Support Line Active</p>
              <p className="text-amber-100/75 mt-0.5">Complimentary atelier fitting consultations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Control List */}
        <div className="space-y-2.5">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left py-3 px-4 rounded-sm flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider transition ${
              activeTab === "orders" ? "bg-amber-900 text-amber-50" : "bg-white border text-stone-700 hover:bg-stone-50"
            }`}
          >
            My Custom Tailored Orders
            <PackageCheck size={14} />
          </button>
          
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`w-full text-left py-3 px-4 rounded-sm flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider transition ${
              activeTab === "wishlist" ? "bg-amber-900 text-amber-50" : "bg-white border text-stone-700 hover:bg-stone-50"
            }`}
          >
            My Wishlist Sketches
            <Heart size={14} />
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left py-3 px-4 rounded-sm flex items-center justify-between text-xs font-serif font-bold uppercase tracking-wider transition ${
              activeTab === "addresses" ? "bg-amber-900 text-amber-50" : "bg-white border text-stone-700 hover:bg-stone-50"
            }`}
          >
            Private Saved Addresses
            <MapPin size={14} />
          </button>
        </div>

        {/* Dashboard Work Space */}
        <div className="md:col-span-3">

          {/* ACTIVE ORDER MILESTONE TRACKING DYNAMIC MODULE */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif font-bold text-lg text-amber-950 uppercase tracking-widest border-b border-amber-50 pb-2.5">
                Consigned Tailoring Orders ({orders.length})
              </h3>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-stone-200 p-8 rounded-sm text-stone-500">
                  <Compass className="mx-auto text-amber-700 mb-3" size={32} />
                  <p className="text-xs font-sans">No bespoke orders placed currently.</p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-sm mx-auto">Explore our master collections to select your desired luxury wedding apparel.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {orders.map((ord) => {
                    const timeline = getTimelineSteps(ord.status);
                    return (
                      <div 
                        key={ord.id} 
                        className="bg-white border border-amber-100 p-6 rounded-sm space-y-6 shadow-xs relative"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-50 pb-4">
                          <div>
                            <p className="text-[9px] text-amber-600 font-sans tracking-widest uppercase font-bold">Consignment Ref</p>
                            <h4 className="font-serif font-bold text-amber-950 text-sm tracking-wide">{ord.id}</h4>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 font-sans tracking-widest uppercase">Placed Date</p>
                            <p className="text-stone-700 text-xs font-bold">{new Date(ord.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 font-sans tracking-widest uppercase">Estimated Value</p>
                            <p className="text-amber-800 text-xs font-bold font-serif">{formatPrice(ord.total)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-stone-400 font-sans tracking-widest uppercase">Clearance</p>
                            <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold py-0.5 px-2 rounded uppercase">
                              {ord.paymentStatus} via {ord.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Order items lists */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 py-1 font-sans">
                          <div>
                            <p className="font-serif font-bold text-amber-950 text-xs mb-2">Selected Wear:</p>
                            <ul className="space-y-1.5 pl-3 border-l border-amber-200">
                              {ord.items.map((item, idx) => (
                                <li key={idx} className="truncate">
                                  • {item.name} x {item.quantity} ({item.size}) - {item.color}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-serif font-bold text-amber-950 text-xs mb-1">Shipping coordinates:</p>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                              {ord.shippingAddress.street}, {ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.zip}, Ph: {ord.shippingAddress.phone}
                            </p>
                            <p className="text-[10px] text-amber-700 font-semibold mt-1">Waybill No: {ord.trackingNumber || "RE-PENDING"}</p>
                          </div>
                        </div>

                        {/* HIGH-END INTERACTIVE TIMELINE GRAPH */}
                        <div className="pt-6 border-t border-amber-50/60 select-none">
                          <p className="text-[9px] text-amber-800 font-serif font-bold uppercase tracking-widest mb-4">Consignment Tailoring Timeline</p>
                          
                          <div className="grid grid-cols-4 gap-2 relative">
                            {/* Horizontal Line backdrop */}
                            <div className="absolute top-[15px] left-0 right-0 h-0.5 bg-stone-200 z-0"></div>
                            
                            {timeline.map((step, sIdx) => (
                              <div key={sIdx} className="text-center space-y-1.5 relative z-10 flex flex-col items-center">
                                {/* Dot indicator */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow border transition-all ${
                                  step.active 
                                    ? "bg-amber-900 border-amber-900 text-amber-50" 
                                    : "bg-white border-stone-200 text-stone-400"
                                }`}>
                                  {sIdx + 1}
                                </div>
                                
                                {/* Label details */}
                                <div className="text-center">
                                  <p className={`text-[9px] font-serif font-bold tracking-tight uppercase leading-tight ${
                                    step.active ? "text-amber-950" : "text-stone-400 font-light"
                                  }`}>
                                    {step.title}
                                  </p>
                                  <p className="text-[8px] text-stone-400 leading-normal hidden sm:block font-sans">{step.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST SKETCHBOOK GRID PANEL */}
          {activeTab === "wishlist" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-serif font-bold text-lg text-amber-950 uppercase tracking-widest border-b border-amber-50 pb-2.5">
                My Style Sketches Wishlist
              </h3>

              {wishlistProducts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-stone-200 rounded-sm p-8 text-stone-500">
                  <Compass className="mx-auto text-amber-700 mb-3" size={32} />
                  <p className="text-xs font-sans">No custom items favorited.</p>
                  <p className="text-[10px] text-stone-400 mt-1 max-w-sm mx-auto">Click the heart button on standard clothes item cards to preserve options.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistProducts.map((p) => {
                    const activeP = p.discountPrice || p.price;
                    return (
                      <div 
                        key={p.id} 
                        className="bg-white border border-amber-50 p-4 rounded-sm flex gap-4 hover:border-amber-400 transition cursor-pointer relative"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-18 h-24 object-cover object-top rounded-sm cursor-pointer border"
                          onClick={() => onViewProduct(p)}
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider text-amber-700 font-bold font-sans">{p.subCategory}</span>
                            <h4 
                              onClick={() => onViewProduct(p)}
                              className="font-serif font-bold text-xs text-amber-950 mt-0.5 hover:text-amber-800 line-clamp-1"
                            >
                              {p.name}
                            </h4>
                            <p className="text-xs font-serif font-bold text-amber-900 mt-1">{formatPrice(activeP)}</p>
                          </div>
                          
                          <button
                            onClick={() => onAddToCart(p, p.sizes[0], p.colors[0])}
                            className="text-[10px] bg-amber-900 hover:bg-amber-950 text-white font-serif tracking-widest uppercase py-1.5 px-3 w-fit rounded-sm transition active:scale-95 mt-2"
                          >
                            Add to Bag
                          </button>
                        </div>

                        {/* Delete button absolute corner */}
                        <button
                          onClick={() => onRemoveWishlist(p.id)}
                          className="absolute right-3 top-3 text-stone-400 hover:text-rose-700 p-1 rounded-full transition"
                          title="Remove sketch"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PRIVATE SAVED ADDRESSES PANEL */}
          {activeTab === "addresses" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-amber-50 pb-2.5">
                <h3 className="font-serif font-bold text-lg text-amber-950 uppercase tracking-widest">
                  Secure Delivery Coordinates
                </h3>
                <button
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="bg-amber-850 hover:bg-amber-950 text-white text-[10px] py-1.5 px-3.5 font-serif uppercase tracking-widest rounded-full flex items-center gap-1 transition"
                >
                  <Plus size={12} /> Add Address
                </button>
              </div>

              {/* Form address adding */}
              {showNewAddress && (
                <form onSubmit={onAddressSubmit} className="bg-amber-50/40 p-5 border border-amber-100 rounded-sm space-y-4 animate-fade-down text-xs">
                  <h4 className="font-serif font-semibold text-amber-950 uppercase tracking-wider text-xs">Register Custom Coordinates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-900">Address Label</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Mumbai Atelier"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-900">Phone Contact</label>
                      <input
                        type="text"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-900">Street & Apartment Details</label>
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-900">City</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-900">State / Region</label>
                      <input
                        type="text"
                        required
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-amber-900">Postal Zip Code</label>
                      <input
                        type="text"
                        required
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-amber-900 hover:bg-amber-950 text-white font-serif uppercase tracking-widest text-[10px] py-2 px-6 rounded-sm transition"
                    >
                      Save Coordinates
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(false)}
                      className="bg-transparent border border-stone-300 hover:bg-stone-100 text-stone-700 text-[10px] font-sans uppercase py-2 px-6 rounded-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Delivery list cards */}
              {savedAddresses.length === 0 ? (
                <div className="text-center py-10 bg-white border rounded p-6">
                  <p className="text-xs text-stone-500 font-sans">No saved coordinates detected. Custom addresses facilitate immediate checkout.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className="bg-white border border-amber-100 p-5 rounded-sm relative shadow-xs flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-xs text-amber-950">{addr.name}</h4>
                          {addr.isDefault && (
                            <span className="text-[8px] bg-amber-100 text-amber-900 uppercase tracking-wider font-bold py-0.5 px-2 rounded-full font-sans">
                              Default Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 font-sans leading-relaxed pt-1">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                        <p className="text-[10px] text-stone-400 font-semibold pt-1">Contact Phone: {addr.phone}</p>
                      </div>

                      {/* Controls Delete */}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="absolute right-4 bottom-4 text-stone-400 hover:text-rose-700 p-1 border rounded-md border-stone-100 hover:bg-rose-50 transition"
                        title="Delete coordinates"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
