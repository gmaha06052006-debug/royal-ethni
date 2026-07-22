import React, { useState } from "react";
import { CreditCard, Truck, CheckCircle, Sparkles, Receipt, Percent } from "lucide-react";
import { OrderItem, ShippingAddress, Coupon } from "../types";

interface CheckoutPageProps {
  cartItems: OrderItem[];
  cartSubtotal: number;
  availableCoupons: Coupon[];
  onPlaceOrder: (address: ShippingAddress, method: "COD" | "Razorpay", appliedDiscount: number) => Promise<any>;
  currentCurrency: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export default function CheckoutPage({
  cartItems,
  cartSubtotal,
  availableCoupons,
  onPlaceOrder,
  currentCurrency,
  showToast
}: CheckoutPageProps) {
  // Address Form States
  const [name, setName] = useState("Aahil Tokala");
  const [street, setStreet] = useState("104 Pearl Heritage, Bandra Stand Road");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [zip, setZip] = useState("400050");
  const [phone, setPhone] = useState("+91 98765 43210");

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Razorpay">("Razorpay");
  
  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");

  // Gateway states
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [showRazorpayGateway, setShowRazorpayGateway] = useState(false);
  const [razorpayCard, setRazorpayCard] = useState("4111 2222 3333 4444");
  const [razorpayExpiry, setRazorpayExpiry] = useState("12/28");
  const [razorpayCvv, setRazorpayCvv] = useState("123");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpVal, setOtpVal] = useState("");
  const [otpError, setOtpError] = useState("");
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  const formatPrice = (price: number) => {
    if (currentCurrency === "INR") {
      return `₹${price.toLocaleString("en-IN")}`;
    } else {
      return `$${Math.round(price / 83).toLocaleString()}`;
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const matched = availableCoupons.find((c) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
    if (matched) {
      setAppliedCoupon(matched);
      setCouponCode("");
    } else {
      setCouponError("This luxury code has expired or is invalid.");
    }
  };

  // Calculations
  const discountAmount = appliedCoupon ? Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100) : 0;
  const deliveryCharges = cartSubtotal > 30000 ? 0 : 500; // Free for luxury items over 30k
  const grandTotal = cartSubtotal - discountAmount + deliveryCharges;

  const handleBeginCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !street || !city || !state || !zip || !phone) {
      showToast("Please provide all required delivery details.", "error");
      return;
    }

    if (paymentMethod === "COD") {
      // Direct placement
      setSubmittingOrder(true);
      try {
        const address: ShippingAddress = { street, city, state, zip, phone };
        const data = await onPlaceOrder(address, "COD", discountAmount);
        setOrderSuccessData(data.order);
      } catch (err) {
        showToast("Failed to place order. Please review your basket.", "error");
      } finally {
        setSubmittingOrder(false);
      }
    } else {
      // Trigger secure checkout overlay
      setShowRazorpayGateway(true);
    }
  };

  const handleVerifyRazorpayPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razorpayCard || !razorpayExpiry || !razorpayCvv) return;
    
    // Trigger OTP validation screen
    setShowOtpScreen(true);
  };

  const handleFinalOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVal !== "1234") {
      setOtpError("Incorrect secure signature. Try '1234' for developer test.");
      return;
    }

    setSubmittingOrder(true);
    setShowOtpScreen(false);
    setShowRazorpayGateway(false);

    try {
      const address: ShippingAddress = { street, city, state, zip, phone };
      const data = await onPlaceOrder(address, "Razorpay", discountAmount);
      setOrderSuccessData(data.order);
    } catch (err) {
      showToast("Payment verified but order registration failed. Contact client care.", "error");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (orderSuccessData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in font-sans">
        <div className="text-amber-800 bg-amber-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
          Consignment Order Placed
        </h2>
        <p className="text-xs text-stone-600 font-sans leading-relaxed max-w-md mx-auto">
          Honoured Client, we have successfully initialized tailoring and logistic routines for your bespoke Royal Ethnica items.
        </p>

        <div className="bg-white border border-amber-100 rounded-sm p-6 text-left space-y-3 shadow-xs">
          <p className="text-xs text-stone-500 font-sans uppercase tracking-widest font-bold">Atelier Consignment Bill</p>
          <div className="border-t border-amber-50 pt-2.5 text-xs text-amber-950 flex justify-between">
            <span>Order Reference:</span>
            <span className="font-bold underline">{orderSuccessData.id}</span>
          </div>
          <div className="text-xs text-amber-950 flex justify-between">
            <span>Estimated Tailoring:</span>
            <span className="font-bold">Pending Master Assignment</span>
          </div>
          <div className="text-xs text-amber-950 flex justify-between">
            <span>Consignment Status:</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              {orderSuccessData.status}
            </span>
          </div>
          <div className="text-xs text-amber-950 flex justify-between pt-2 border-t border-amber-50">
            <span>Consignment Total:</span>
            <span className="font-bold text-amber-800 text-sm">{formatPrice(orderSuccessData.total)}</span>
          </div>
        </div>

        <p className="text-[10px] text-stone-400 font-sans italic">
          An interactive order milestone graph is available inside your personal Client Dashboard.
        </p>

        <button
          onClick={() => {
            window.location.reload();
          }}
          className="bg-amber-900 text-white text-xs font-serif uppercase tracking-widest py-3 px-8 rounded-sm hover:bg-amber-950 active:scale-95 transition"
        >
          Return to Atelier Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="text-center mb-8">
        <span className="text-[10px] font-serif tracking-[0.3em] font-bold text-amber-600 uppercase block mb-1">
          Secured Reservation
        </span>
        <h2 className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
          Atelier Checkout Page
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COMPONENT: ADDRESS FORM & PAYMENT OPTIONS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Form */}
          <form onSubmit={handleBeginCheckout} className="space-y-6">
            
            {/* Delivery address details */}
            <div className="bg-white border border-amber-100 rounded-sm p-6 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-sm text-amber-950 uppercase border-b border-amber-50 pb-2.5 tracking-wider">
                1. Consigned Delivery Coordinates
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Client Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-amber-50/20 border border-amber-100 rounded px-3 py-2 text-xs focus:outline-none focus:border-amber-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Private Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-amber-50/20 border border-amber-100 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Avenue & Street Address</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-amber-50/20 border border-amber-100 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-amber-50/20 border border-amber-100 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">State / Region</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-amber-50/20 border border-amber-100 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-amber-900 font-bold uppercase tracking-wider">Postal / Zip Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full bg-amber-50/20 border border-amber-100 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Systems details */}
            <div className="bg-white border border-amber-100 rounded-sm p-6 space-y-4 shadow-xs">
              <h3 className="font-serif font-bold text-sm text-amber-950 uppercase border-b border-amber-50 pb-2.5 tracking-wider">
                2. Select Gate Way Clearance
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Option */}
                <label 
                  onClick={() => setPaymentMethod("Razorpay")}
                  className={`border rounded-sm p-4 flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "Razorpay" 
                      ? "border-amber-800 bg-amber-50/40 ring-1 ring-amber-800" 
                      : "border-stone-200 hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-amber-800"><CreditCard size={18} /></div>
                    <div>
                      <p className="text-xs font-serif font-bold text-amber-950">Razorpay Clearance</p>
                      <p className="text-[10px] text-stone-500 font-sans">Verified Cards, NetBanking, UPI</p>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "Razorpay" ? "border-amber-800 bg-amber-800 text-white" : "border-stone-300"
                  }`}>
                    {paymentMethod === "Razorpay" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </label>

                {/* COD Option */}
                <label 
                  onClick={() => setPaymentMethod("COD")}
                  className={`border rounded-sm p-4 flex items-center justify-between cursor-pointer transition ${
                    paymentMethod === "COD" 
                      ? "border-amber-800 bg-amber-50/40 ring-1 ring-amber-800" 
                      : "border-stone-200 hover:border-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-amber-800"><Truck size={18} /></div>
                    <div>
                      <p className="text-xs font-serif font-bold text-amber-950">Cash/Check on Delivery</p>
                      <p className="text-[10px] text-stone-500 font-sans">Payment on high-end courier handover</p>
                    </div>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "COD" ? "border-amber-800 bg-amber-800 text-white" : "border-stone-300"
                  }`}>
                    {paymentMethod === "COD" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </label>
              </div>
            </div>

            {/* Place direct order */}
            <button
              type="submit"
              disabled={submittingOrder}
              className="w-full bg-amber-900 border border-amber-900 hover:bg-amber-950 text-white p-4 text-xs font-serif font-bold tracking-widest uppercase transition flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
            >
              {submittingOrder ? "Confirming Atelier Schedules..." : "Reserve My Royal Attire →"}
            </button>

          </form>

        </div>

        {/* RIGHT COLUMN: RECEPTACLE SUMMARY & COUPONS */}
        <div id="checkout-summary-column" className="space-y-6">
          
          {/* Order Summary list */}
          <div className="bg-white border border-amber-100 rounded-sm p-6 space-y-4 shadow-xs">
            <h3 className="font-serif font-bold text-sm text-amber-950 uppercase border-b border-amber-50 pb-2.5 tracking-wider">
              Reserve Order Summary
            </h3>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-11 h-14 object-cover object-top rounded-sm border border-amber-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-amber-950 truncate">{item.name}</h4>
                    <p className="text-[9px] text-stone-500 font-sans">
                      Tone: {item.color} | Size: {item.size} • Qty: {item.quantity}
                    </p>
                    <p className="font-serif font-bold text-amber-800 mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupons Applying panel */}
            <div className="border-t border-amber-50/80 pt-4 space-y-2.5">
              <span className="text-[10px] text-amber-900 font-bold uppercase tracking-wider block">Exclusive Loyalty Coupon</span>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="EX: ROYAL10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="bg-amber-50/20 border border-amber-100 rounded px-2.5 py-1 text-xs text-amber-950 focus:outline-none w-full font-serif uppercase tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-amber-850 hover:bg-amber-950 text-white text-[10px] px-4 py-1.5 rounded font-sans uppercase tracking-widest"
                >
                  Apply
                </button>
              </form>
              
              {couponError && <p className="text-[10px] text-rose-700 font-sans">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-[10px] text-green-700 font-sans flex items-center gap-1">
                  <Percent size={10} /> Active: <b>{appliedCoupon.code}</b> ({appliedCoupon.discountPercent}% Saved)
                </p>
              )}
            </div>

            {/* Math pricing list */}
            <div className="border-t border-amber-50 pt-4 space-y-2.5 text-xs text-stone-600 font-sans">
              <div className="flex justify-between">
                <span>Selected Items Subtotal:</span>
                <span className="font-serif font-bold text-amber-950">{formatPrice(cartSubtotal)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-green-700">
                  <span>Code Discount ({appliedCoupon.code}):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Atelier Secure Courier:</span>
                <span>{deliveryCharges === 0 ? "Complimentary" : formatPrice(deliveryCharges)}</span>
              </div>

              <div className="border-t border-amber-100 pt-3 flex justify-between text-amber-950 font-serif">
                <span className="font-bold">Estimated Grand Total:</span>
                <span className="font-bold text-amber-800 text-lg">{formatPrice(grandTotal)}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* RAZORPAY SECURE GATEWAY OVERLAY MOCKUP */}
      {showRazorpayGateway && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center font-sans">
          <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs" onClick={() => setShowRazorpayGateway(false)} />
          
          <div className="bg-white border rounded shadow-2xl relative w-full max-w-sm overflow-hidden z-10 p-6 space-y-5 animate-fade-up">
            
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-amber-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-1 rounded-sm text-xs font-bold font-sans">R</div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 font-sans tracking-wide">Razorpay Secure Checkout</h4>
                  <p className="text-[8px] text-stone-500 uppercase font-sans">Merchant: Royal Ethnica</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRazorpayGateway(false)}
                className="text-stone-400 hover:text-stone-900 text-xs"
              >
                ✕ Close
              </button>
            </div>

            {!showOtpScreen ? (
              <form onSubmit={handleVerifyRazorpayPayment} className="space-y-4 text-xs select-none">
                <div className="bg-amber-50/40 p-3 rounded text-stone-700 text-center space-y-1">
                  <p className="text-[10px] uppercase font-bold text-amber-800">Clearance Total</p>
                  <p className="text-lg font-serif font-bold text-amber-950">{formatPrice(grandTotal)}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-stone-600 font-bold uppercase tracking-wider block">Credit / Debit Card Number</label>
                  <input
                    type="text"
                    required
                    value={razorpayCard}
                    onChange={(e) => setRazorpayCard(e.target.value)}
                    className="w-full bg-stone-100 border border-stone-200 rounded px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-600 font-bold uppercase tracking-wider block">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={razorpayExpiry}
                      onChange={(e) => setRazorpayExpiry(e.target.value)}
                      className="w-full bg-stone-100 border border-stone-200 rounded px-2 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-stone-600 font-bold uppercase tracking-wider block">Security CVV</label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      value={razorpayCvv}
                      onChange={(e) => setRazorpayCvv(e.target.value)}
                      className="w-full bg-stone-100 border border-stone-200 rounded px-2 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs py-3 rounded uppercase transition flex items-center justify-center gap-1.5"
                >
                  <Receipt size={14} /> Pay {formatPrice(grandTotal)}
                </button>

                <p className="text-[9px] text-stone-400 text-center font-sans">
                  By clicking Pay, you authorize a test clearance request.
                </p>
              </form>
            ) : (
              <form onSubmit={handleFinalOtpSubmit} className="space-y-4 text-xs select-none">
                <div className="bg-blue-50 border border-blue-100 p-3.5 rounded text-blue-900 text-center text-[10px] space-y-1">
                  <p className="font-bold">Bank Secure OTP Sent</p>
                  <p>A simulated OTP has been forwarded to code console. Input <b>1234</b> to verify transaction.</p>
                </div>

                <div className="space-y-1.5 text-center">
                  <label className="text-[10px] text-stone-600 font-bold uppercase tracking-wider block">Enter OTP Codes</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1234"
                    value={otpVal}
                    onChange={(e) => setOtpVal(e.target.value)}
                    className="bg-stone-50 border border-stone-300 rounded text-center text-lg letter-spacing-widest py-1.5 focus:outline-none w-32 mx-auto"
                  />
                  {otpError && <p className="text-[9px] text-rose-700 font-semibold">{otpError}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold text-xs py-3 rounded uppercase transition"
                >
                  {submittingOrder ? "Confirming clearance..." : "Confirm Security Signature"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
