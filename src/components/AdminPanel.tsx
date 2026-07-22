import React, { useState } from "react";
import { Plus, Trash2, Edit, Save, Package, ShoppingBag, Banknote, Users, Check, AlertTriangle, TrendingUp } from "lucide-react";
import { Product, Order } from "../types";

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (prod: any) => Promise<any>;
  onUpdateProduct: (pId: string, updates: Partial<Product>) => Promise<any>;
  onDeleteProduct: (pId: string) => Promise<any>;
  onUpdateOrderStatus: (oId: string, status: string, tracking?: string) => Promise<any>;
  currentCurrency: string;
}

export default function AdminPanel({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  currentCurrency
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "catalog" | "orders">("analytics");
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  
  // Inline Catalog Edit state
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);

  // New product form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState(25000);
  const [newCategory, setNewCategory] = useState("Women");
  const [newSub, setNewSub] = useState("Designer Sarees");
  const [newCrafts, setNewCrafts] = useState("Handmade tilla work embroidery from Banaras");
  const [newFabric, setNewFabric] = useState("Pure Viscose Georgette");
  const [newImg, setNewImg] = useState("https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=800");

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  // Analytics Metrics calculations
  const totalSalesVal = orders.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const totalClients = Array.from(new Set(orders.map((o) => o.customerEmail))).length;

  const handleAddNewProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCategory || !newSub || !newPrice) return;
    
    await onAddProduct({
      name: newName,
      description: newDesc,
      price: newPrice,
      category: newCategory,
      subCategory: newSub,
      craftsmanship: newCrafts,
      fabric: newFabric,
      images: [newImg],
      colors: ["Royal Ivory", "Crimson Red"],
      sizes: ["S", "M", "L", "XL", "Custom Fit"],
      stock: 10
    });

    setNewName("");
    setNewDesc("");
    setNewPrice(25000);
    setNewCrafts("Handmade tilla work embroidery from Banaras");
    setNewFabric("Pure Viscose Georgette");
    setShowAddForm(false);
  };

  const handleSaveInlineProduct = async (pId: string) => {
    await onUpdateProduct(pId, { price: editPrice, stock: editStock });
    setEditingProdId(null);
  };

  const startInlineEdit = (prod: Product) => {
    setEditingProdId(prod.id);
    setEditPrice(prod.price);
    setEditStock(prod.stock);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Title Header */}
      <div className="text-center mb-8 border-b border-amber-100 pb-5">
        <span className="text-[10px] font-sans tracking-[0.2em] font-bold text-amber-700 uppercase">
          Backstage Administration
        </span>
        <h2 className="text-2xl font-serif font-bold text-stone-900 uppercase tracking-widest mt-1">
          The Atelier Command Desk
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 max-w-md mx-auto text-xs font-serif uppercase tracking-widest text-center font-bold">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 py-3 text-stone-850 hover:text-amber-805 transition border-b-2 ${
            activeTab === "analytics" ? "border-amber-900 text-amber-900" : "border-transparent"
          }`}
        >
          Analytics & Desk
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`flex-1 py-3 text-stone-850 hover:text-amber-805 transition border-b-2 ${
            activeTab === "catalog" ? "border-amber-900 text-amber-900" : "border-transparent"
          }`}
        >
          Product Catalog
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-3 text-stone-850 hover:text-amber-805 transition border-b-2 ${
            activeTab === "orders" ? "border-amber-900 text-amber-900" : "border-transparent"
          }`}
        >
          Live Orders
        </button>
      </div>

      {/* ANALYTICS DASHBOARD SCREEN */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Quick Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white border rounded p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block font-bold">Gross Sales Revenues</span>
                <span className="text-xl font-serif font-bold text-stone-900">{formatPrice(totalSalesVal)}</span>
              </div>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-full"><Banknote size={20} /></div>
            </div>

            <div className="bg-white border rounded p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block font-bold">Reservations Placed</span>
                <span className="text-xl font-serif font-bold text-stone-900">{orders.length} orders</span>
              </div>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-full"><ShoppingBag size={20} /></div>
            </div>

            <div className="bg-white border rounded p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block font-bold">Crafted Garments</span>
                <span className="text-xl font-serif font-bold text-stone-900">{products.length} catalog items</span>
              </div>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-full"><Package size={20} /></div>
            </div>

            <div className="bg-white border rounded p-5 flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400 font-sans uppercase tracking-wider block font-bold">Discerning Clients</span>
                <span className="text-xl font-serif font-bold text-stone-900">{totalClients > 0 ? totalClients : 1} active profiles</span>
              </div>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-full"><Users size={20} /></div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Elegant SVG/CSS Bar Chart representing Categorical Sales ratios */}
            <div className="lg:col-span-2 bg-white border rounded p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b pb-3.5">
                <h4 className="font-serif font-bold text-sm text-stone-900 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-amber-700" /> Catalog Categorical Weight
                </h4>
                <span className="text-stone-400 text-[10px] font-sans">Live stock breakdown</span>
              </div>

              {/* Simple handcrafted flex grid charts */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1 font-sans">
                    <span>Lehengas / Suits (Women)</span>
                    <span className="font-bold">5 Items (62%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-900 h-full rounded-full" style={{ width: "62%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1 font-sans">
                    <span>Sherwanis / Kurtas (Men)</span>
                    <span className="font-bold">2 Items (25%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-700 h-full rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-stone-600 mb-1 font-sans">
                    <span>Jewellery Accessories</span>
                    <span className="font-bold">1 Items (13%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "13%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Block */}
            <div className="bg-white border rounded p-6 space-y-4 shadow-xs">
              <h4 className="font-serif font-bold text-sm text-amber-900 uppercase tracking-widest border-b pb-3 flex items-center gap-1.5">
                <AlertTriangle size={16} /> Low Inventory Alerts
              </h4>

              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-stone-400 font-sans">All noble garments are well-stocked.</p>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 text-xs font-sans">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="p-3 bg-amber-50 border border-amber-100 rounded flex justify-between items-center">
                      <div>
                        <p className="font-serif font-bold text-amber-950 truncate max-w-[150px]">{p.name}</p>
                        <p className="text-[10px] text-stone-500 uppercase">{p.subCategory}</p>
                      </div>
                      <span className="bg-amber-900 text-stone-100 font-sans text-[10px] font-bold px-2 py-0.5 rounded">
                        Only {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* CATALOG MANAGEMENT WORKSPACE (ADD, UPDATE, DELETE) */}
      {activeTab === "catalog" && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Header add triggers */}
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-serif font-bold text-sm text-stone-900 uppercase">Artisans Catalog ({products.length} garments)</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-900 hover:bg-amber-950 text-white font-serif uppercase tracking-widest text-[10px] py-1.5 px-3.5 rounded flex items-center gap-1 transition-all"
            >
              <Plus size={14} /> Add Luxury Garment
            </button>
          </div>

          {/* Add product form */}
          {showAddForm && (
            <form onSubmit={handleAddNewProductSubmit} className="bg-amber-50/40 p-5 border border-amber-100 rounded-sm space-y-4 font-sans max-w-2xl">
              <h4 className="text-xs font-serif font-bold text-amber-950 uppercase tracking-widest">Register New Haute Couture Design</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Garment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="The Shalimar Queen Lehenga"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Base Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Primary Core category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2 py-1.5 focus:outline-none"
                  >
                    <option>Women</option>
                    <option>Men</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Sub-category</label>
                  <input
                    type="text"
                    required
                    placeholder="Bespoke Sarees, Kurta Sets"
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Artisanal Details Description</label>
                  <textarea
                    rows={2}
                    placeholder="Provide luxurious yarn, wire-embroidery, drapes references..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none"
                  ></textarea>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Craftsmanship hours & source</label>
                  <input
                    type="text"
                    value={newCrafts}
                    onChange={(e) => setNewCrafts(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Primary Fabric Base</label>
                  <input
                    type="text"
                    value={newFabric}
                    onChange={(e) => setNewFabric(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-amber-900">Stock Image URL (Unsplash portrait path)</label>
                  <input
                    type="text"
                    value={newImg}
                    onChange={(e) => setNewImg(e.target.value)}
                    className="w-full bg-white border border-stone-250 rounded px-2.5 py-1.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-amber-900 hover:bg-amber-950 text-white text-[10px] font-serif uppercase tracking-widest py-2 px-6 rounded shadow-sm"
                >
                  Confirm Design Addition
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-transparent border border-stone-300 hover:bg-stone-150 text-stone-700 text-[10px] font-sans uppercase py-2 px-6 rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Catalog grid rows list */}
          <div className="overflow-x-auto border border-stone-200 rounded">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-amber-50 text-amber-900 font-serif font-bold uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="py-3 px-4">Garment Item</th>
                  <th className="py-3 px-4">Categorization</th>
                  <th className="py-3 px-4">Price Value</th>
                  <th className="py-3 px-4">Inventory Stock</th>
                  <th className="py-3 px-4 text-center">Desk Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans">
                {products.map((p) => {
                  const isEditing = editingProdId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/20 transition">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            className="w-7 h-10 object-cover object-top rounded-sm border"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate max-w-[200px]" title={p.name}>{p.name}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 capitalize">
                        {p.category} • {p.subCategory}
                      </td>
                      <td className="py-3.5 px-4 text-stone-900">
                        {isEditing ? (
                          <input
                            type="number"
                            required
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-24 border rounded px-1.5 py-0.5"
                          />
                        ) : (
                          formatPrice(p.price)
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-900">
                        {isEditing ? (
                          <input
                            type="number"
                            required
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                            className="w-16 border rounded px-1.5 py-0.5"
                          />
                        ) : (
                          <span className={`font-bold ${p.stock <= 5 ? "text-amber-800" : "text-stone-700"}`}>
                            {p.stock} units
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveInlineProduct(p.id)}
                              className="text-green-700 hover:bg-green-50 p-1.5 rounded border border-green-200 transition"
                              title="Update design coordinates"
                            >
                              <Save size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => startInlineEdit(p)}
                              className="text-amber-800 hover:bg-amber-50 p-1.5 rounded border border-amber-100 transition"
                              title="Modify coordinates"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="text-stone-400 hover:text-rose-700 p-1.5 rounded border border-stone-50 transition"
                            title="Delete SKU design"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* LIVE ORDERS SECTIONS (EDIT STATUS & TRACKING) */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-fade-in text-xs">
          <h3 className="font-serif font-bold text-sm text-stone-900 uppercase">Order Fulfillment Desk</h3>

          <div className="overflow-x-auto border rounded">
            <table className="w-full text-left text-xs bg-white">
              <thead className="bg-amber-50 text-amber-900 font-serif font-bold uppercase tracking-wider text-[10px] border-b">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Discerning Client</th>
                  <th className="py-3 px-4">Schedules Status</th>
                  <th className="py-3 px-4">Consignment Total</th>
                  <th className="py-3 px-4 text-center">Update Fulfillment Stages</th>
                </tr>
              </thead>
              <tbody className="divide-y font-sans">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-3.5 px-4 font-semibold text-stone-900 whitespace-nowrap">
                      {ord.id}
                      <p className="text-[10px] text-stone-400 font-light mt-0.5 font-sans">Waybill: {ord.trackingNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{ord.customerName}</p>
                      <p className="text-[10px] text-stone-400 font-light font-sans">{ord.customerEmail}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === "Delivered" ? "bg-green-50 text-green-700" :
                        ord.status === "Shipped" ? "bg-blue-50 text-blue-700" :
                        ord.status === "Tailoring" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-amber-800 font-serif font-bold">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {ord.status !== "Delivered" && (
                          <button
                            onClick={async () => {
                              const nextStatusMap: Record<string, string> = {
                                "Pending": "Tailoring",
                                "Tailoring": "Shipped",
                                "Shipped": "Delivered"
                              };
                              const nextStatus = nextStatusMap[ord.status] || "Delivered";
                              await onUpdateOrderStatus(ord.id, nextStatus);
                            }}
                            className="bg-amber-850 hover:bg-amber-950 text-white font-serif uppercase tracking-widest text-[9px] py-1 px-3 rounded shadow-xs"
                          >
                            Advance Stage →
                          </button>
                        )}
                        {ord.status === "Delivered" && (
                          <span className="text-stone-400 italic font-sans flex items-center gap-1">
                            <Check size={12} className="text-green-700 pointer-events-none" /> Fully Dispatched
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
