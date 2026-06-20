import React, { useState } from "react";
import { Listing } from "../types";
import { 
  X, BedDouble, Bath, Maximize2, MapPin, 
  Calendar, Check, User, Mail, Phone, MessageSquare, 
  Sparkles, CheckCircle2, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PropertyModalProps {
  property: Listing | null;
  onClose: () => void;
}

export default function PropertyModal({ property, onClose }: PropertyModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");


  // Set default prepopulated message
  React.useEffect(() => {
    if (property) {
      setMessage(`Hi! I am extremely interested in "${property.title}" listed at ${property.price.toLocaleString()} located at ${property.address}, ${property.city}. Can you details or scheduling a showing?`);
      setSuccess(false);
      setError("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
    }
  }, [property]);

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim() || !message.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          clientPhone: clientPhone.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry to the database server.");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Format price helper
  const formatPrice = (price: number, type: 'Sale' | 'Rent') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
    
    return type === 'Rent' ? `${formatted}/mo` : formatted;
  };

  return (
    <AnimatePresence>
      {property && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          id="modal-backdrop"
          className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          id="modal-window"
          className="relative bg-[#0F0F0F] w-full max-w-5xl rounded-xl overflow-hidden shadow-2xl border border-[#1F1F1F] text-[#E0E0E0] flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={onClose}
              id="close-modal-button"
              className="p-2 bg-[#0A0A0A]/80 hover:bg-[#D4AF37] hover:text-black text-white rounded-full transition-all duration-200 cursor-pointer shadow-md backdrop-blur-xs border border-[#1F1F1F]"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="overflow-y-auto flex-grow">
            {/* Top Large banner */}
            <div className="relative h-[250px] sm:h-[350px] bg-[#0A0A0A]">
              <img
                src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=85"}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent flex items-end p-6 sm:p-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#D4AF37] font-bold text-[10px] text-black uppercase tracking-wider rounded-sm shadow-xs">
                      For {property.listingType}
                    </span>
                    <span className="px-2.5 py-1 bg-[#1A1A1A] border border-[#1F1F1F] text-[10px] font-bold text-white tracking-widest uppercase rounded-sm">
                      {property.propertyType}
                    </span>
                  </div>
                  
                  <h1 className="text-xl sm:text-3xl font-serif text-white italic tracking-tight drop-shadow-md">
                    {property.title}
                  </h1>
                  
                  <div className="flex items-center text-[#888] mt-1.5 text-sm sm:text-base drop-shadow-xs">
                    <MapPin className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
                    <span>{property.address}, {property.city}, {property.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split layout: Property stats + Inquiry Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
              {/* Left Column: Property Specifics (8 columns) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Price and Core Stats Bar */}
                <div className="flex flex-wrap items-center justify-between p-4 bg-[#111111] border border-[#1F1F1F] rounded-lg gap-4">
                  <div>
                    <span className="text-[#888] text-[10px] uppercase font-bold tracking-widest block">Price Tag</span>
                    <span className="text-2xl sm:text-3xl font-serif text-[#D4AF37] italic font-bold">
                      {formatPrice(property.price, property.listingType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-5 text-white">
                    <div className="text-center">
                      <BedDouble className="w-5 h-5 mx-auto text-[#D4AF37] mb-0.5" />
                      <span className="text-sm font-bold text-white">{property.bedrooms}</span>
                      <span className="text-[#555] text-[10px] block">Beds</span>
                    </div>
                    <div className="h-8 w-px bg-[#1F1F1F]" />
                    <div className="text-center">
                      <Bath className="w-5 h-5 mx-auto text-[#D4AF37] mb-0.5" />
                      <span className="text-sm font-bold text-white">{property.bathrooms}</span>
                      <span className="text-[#555] text-[10px] block">Baths</span>
                    </div>
                    <div className="h-8 w-px bg-[#1F1F1F]" />
                    <div className="text-center">
                      <Maximize2 className="w-5 h-5 mx-auto text-[#D4AF37] mb-0.5" />
                      <span className="text-sm font-bold text-white">{property.areaSqFt.toLocaleString()}</span>
                      <span className="text-[#555] text-[10px] block">SqFT</span>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-[#D4AF37] mb-2 border-b border-[#1F1F1F] pb-2 flex items-center gap-1.5">
                    <Building2 className="w-5 h-5 text-[#D4AF37]" />
                    Property Description
                  </h3>
                  <p className="text-[#888] text-sm leading-relaxed whitespace-pre-line text-justify">
                    {property.description}
                  </p>
                </div>

                {/* Specifications Grid */}
                <div className="grid grid-cols-2 gap-4 bg-[#111111] p-4 border border-[#1F1F1F] rounded-lg">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#555] block">Property Code</span>
                    <span className="text-sm font-bold text-[#D4AF37] font-mono">{property.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#555] block">Year Built</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#D4AF37]" />
                      {property.yearBuilt}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#555] block">Listing Status</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-sm inline-block mt-0.5 border ${
                      property.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      property.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      ● {property.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#555] block">Property Type</span>
                    <span className="text-sm font-bold text-[#E0E0E0]">{property.propertyType}</span>
                  </div>
                </div>

                {/* Amenities / Key Features */}
                <div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-[#D4AF37] mb-3 border-b border-[#1F1F1F] pb-2">
                    Premium Features & Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {property.features && property.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-[#111111] border border-[#1F1F1F] p-2.5 rounded-sm">
                        <div className="bg-[#D4AF37]/10 p-1 rounded-sm border border-[#D4AF37]/35">
                          <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                        </div>
                        <span className="text-xs font-bold text-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Inquiry Floating Card (5 columns) */}
              <div className="lg:col-span-5">
                <div className="sticky top-0 bg-[#111111] border border-[#1F1F1F] p-5 rounded-lg shadow-sm">
                  
                  {/* Header info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest mb-1">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      Assigned Agent Desk
                    </div>
                    <h3 className="text-lg font-serif italic text-white font-bold">
                      Request Information
                    </h3>
                    <p className="text-[#888] text-xs">
                      Submit an inquiry request and our real estate consultant will contact you within 2 hours.
                    </p>
                  </div>

                  {success ? (
                    /* Inquiry success screen */
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-6 rounded-lg text-center flex flex-col items-center gap-3 my-4"
                    >
                      <div className="bg-[#D4AF37]/20 p-3 rounded-full text-[#D4AF37] shadow-sm">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-base font-bold text-[#D4AF37] font-serif">
                        Inquiry Submitted Successfully!
                      </h4>
                      <p className="text-[#888] text-xs">
                        Thank you for your interest in {property.title}. An authorized agent has received your details and will call or email you shortly.
                      </p>
                      
                      <button
                        onClick={() => setSuccess(false)}
                        className="mt-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    /* The submission form */
                    <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-3">
                      
                      {/* Name input */}
                      <div>
                        <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#555]" />
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm focus:border-[#D4AF37] focus:outline-hidden text-white transition-all duration-150"
                          />
                        </div>
                      </div>

                      {/* Email input */}
                      <div>
                        <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#555]" />
                          <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm focus:border-[#D4AF37] focus:outline-hidden text-white transition-all duration-150"
                          />
                        </div>
                      </div>

                      {/* Phone input */}
                      <div>
                        <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                          Phone Number <span className="text-[#555] font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#555]" />
                          <input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm focus:border-[#D4AF37] focus:outline-hidden text-white transition-all duration-150"
                          />
                        </div>
                      </div>

                      {/* Message text zone */}
                      <div>
                        <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                          Custom Message <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <MessageSquare className="absolute left-3 top-2.5 w-4.5 h-4.5 text-[#555]" />
                          <textarea
                            required
                            rows={3}
                            placeholder="Write your inquiries details here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm focus:border-[#D4AF37] focus:outline-hidden text-white transition-all duration-150 resize-none"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="text-xs font-bold text-[#ff4f5a] bg-rose-950/20 p-2.5 border border-red-950/40 rounded">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        id="submit-inquiry-button"
                        className="w-full py-3 bg-[#D4AF37] hover:bg-[#C5A267] disabled:bg-[#333] text-black font-bold text-xs uppercase tracking-widest rounded-sm cursor-pointer shadow-sm transition-all duration-150"
                      >
                        {submitting ? "Sending details..." : "Contact Agent Desk"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
