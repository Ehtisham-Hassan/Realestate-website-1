import React, { useState, useEffect } from "react";
import { Listing, Inquiry, AdminStats } from "../types";
import { 
  Building2, Plus, Edit3, Trash2, Mail, Phone, Clock, Check, 
  Sparkles, ShieldCheck, Lock, LogOut, CheckCircle2, ChevronRight,
  TrendingUp, BarChart3, Inbox, FileText, AlertCircle, RefreshCw, X, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminPanelProps {
  onListingChange: () => void;
  allListings: Listing[];
  onClosePanel: () => void;
}

export default function AdminPanel({ onListingChange, allListings, onClosePanel }: AdminPanelProps) {
  // Auth state
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Tab view: 'listings' | 'inquiries' | 'stats'
  const [activeTab, setActiveTab] = useState<'listings' | 'inquiries'>('listings');

  // Backend state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  // CRUD Property modal states
  const [showPropertyFormModal, setShowPropertyFormModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Listing | null>(null);

  // Form states for property creation/edit
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formStateVal, setFormStateVal] = useState("");
  const [formBedrooms, setFormBedrooms] = useState("3");
  const [formBathrooms, setFormBathrooms] = useState("2");
  const [formAreaSqFt, setFormAreaSqFt] = useState("2000");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formPropertyType, setFormPropertyType] = useState<Listing['propertyType']>("House");
  const [formListingType, setFormListingType] = useState<Listing['listingType']>("Sale");
  const [formStatus, setFormStatus] = useState<Listing['status']>("Active");
  const [formYearBuilt, setFormYearBuilt] = useState("2020");
  const [formFeatures, setFormFeatures] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Authenticate password with server
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login Verification failed.");
      }

      localStorage.setItem("admin_token", data.token);
      setToken(data.token);
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout action
  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken(null);
  };

  // Fetch admin stats & inquiries
  const fetchAdminData = async () => {
    if (!token) return;
    setLoadingData(true);
    setDataError("");

    try {
      // Fetch inquiries
      const inqRes = await fetch("/api/inquiries", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!inqRes.ok) throw new Error("Could not fetch user inquiries.");
      const inqData = await inqRes.json();
      setInquiries(inqData);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error("Could not calculate statistics.");
      const statsData = await statsRes.json();
      setStats(statsData);

    } catch (err: any) {
      console.error(err);
      setDataError(err.message || "Could not synchronize dashboard state.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, allListings]);

  // Open property form in Add Mode
  const handleOpenAddMode = () => {
    setEditingProperty(null);
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormAddress("");
    setFormCity("");
    setFormStateVal("");
    setFormBedrooms("3");
    setFormBathrooms("2.5");
    setFormAreaSqFt("1800");
    setFormImageUrl("");
    setFormPropertyType("House");
    setFormListingType("Sale");
    setFormStatus("Active");
    setFormYearBuilt("2021");
    setFormFeatures("Pool, Garage, Air Conditioning, Garden");
    setFormFeatured(false);
    
    setFormError("");
    setShowPropertyFormModal(true);
  };

  // Open property form in Edit Mode
  const handleOpenEditMode = (property: Listing) => {
    setEditingProperty(property);
    setFormTitle(property.title);
    setFormDescription(property.description);
    setFormPrice(property.price.toString());
    setFormAddress(property.address);
    setFormCity(property.city);
    setFormStateVal(property.state);
    setFormBedrooms(property.bedrooms.toString());
    setFormBathrooms(property.bathrooms.toString());
    setFormAreaSqFt(property.areaSqFt.toString());
    setFormImageUrl(property.imageUrl);
    setFormPropertyType(property.propertyType);
    setFormListingType(property.listingType);
    setFormStatus(property.status);
    setFormYearBuilt(property.yearBuilt.toString());
    setFormFeatures(property.features ? property.features.join(", ") : "");
    setFormFeatured(property.featured || false);

    setFormError("");
    setShowPropertyFormModal(true);
  };

  // Save/Update Property handler
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formAddress || !formCity || !formStateVal) {
      setFormError("Crucial items (Title, Price, Address, City, State) are required.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    // Prepare feature array from string
    const parsedFeatures = formFeatures
      .split(",")
      .map(item => item.trim())
      .filter(item => item !== "");

    // Generate random suitable unsplash images if empty based on type
    let finalImg = formImageUrl.trim();
    if (!finalImg) {
      if (formPropertyType === 'Apartment') {
        finalImg = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80";
      } else if (formPropertyType === 'Condo') {
        finalImg = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
      } else {
        finalImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
      }
    }

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim() || "An incredible lifestyle opportunity is waiting in this prime location, representing executive craftsmanship, luxurious dimensions, and exquisite neighborhood surroundings.",
      price: Math.max(0, parseFloat(formPrice)),
      address: formAddress.trim(),
      city: formCity.trim(),
      state: formStateVal.trim().toUpperCase(),
      bedrooms: Math.max(0, parseFloat(formBedrooms) || 0),
      bathrooms: Math.max(0, parseFloat(formBathrooms) || 0),
      areaSqFt: Math.max(0, parseInt(formAreaSqFt) || 0),
      imageUrl: finalImg,
      propertyType: formPropertyType,
      listingType: formListingType,
      status: formStatus,
      yearBuilt: Math.max(1800, parseInt(formYearBuilt) || 2020),
      features: parsedFeatures,
      featured: formFeatured
    };

    const url = editingProperty ? `/api/listings/${editingProperty.id}` : "/api/listings";
    const method = editingProperty ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Could not commit real estate listing modification.");
      }

      setShowPropertyFormModal(false);
      onListingChange(); // Refresh outer listings list
    } catch (err: any) {
      setFormError(err.message || "Form submission error, retry.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Listing handler
  const handleDeleteListing = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to remove listing.");
      }

      onListingChange(); // Refresh outer listings list
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Update Inquiries status handler
  const handleUpdateInquiryStatus = async (id: string, newStatus: Inquiry['status']) => {
    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error("Could not update status.");
      }

      // Update locally
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
      
      // Re-fetch stats to trigger counter adjustment
      const statsRes = await fetch("/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Helper formats
  const formatValue = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="w-full min-h-[85vh] bg-[#0A0A0A] rounded-xl overflow-hidden border border-[#1F1F1F] shadow-md flex flex-col md:flex-row">
      
      {/* Sidebar: controls login verification or tabs */}
      <div className="w-full md:w-64 bg-[#0F0F0F] text-[#E0E0E0] flex flex-col p-6 shrink-0 border-r border-[#1F1F1F]">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-[#D4AF37]/15 border border-[#D4AF37]/35 rounded-sm text-[#D4AF37]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-sm tracking-widest text-[#D4AF37]">ADMIN ACCESS</h2>
            <p className="text-[9px] text-[#888] font-mono">AUTHORIZED PORTAL</p>
          </div>
        </div>

        {token ? (
          /* Logged In Sidebar Items */
          <div className="flex flex-col flex-grow justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Navigation</span>
              
              <button
                onClick={() => setActiveTab('listings')}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xs text-xs uppercase tracking-widest font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === 'listings' ? 'bg-[#D4AF37] text-black shadow-sm' : 'text-[#888] hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4.5 h-4.5" />
                Manage Listings
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center justify-between px-4 py-3 rounded-xs text-xs uppercase tracking-widest font-bold transition-all duration-150 cursor-pointer ${
                  activeTab === 'inquiries' ? 'bg-[#D4AF37] text-black shadow-sm' : 'text-[#888] hover:text-white hover:bg-white/5'
                }`}
              >
                <div id="inquiry-tab-selector" className="flex items-center gap-2.5">
                  <Inbox className="w-4.5 h-4.5" />
                  Inquiry Queue
                </div>
                {stats && stats.newInquiries > 0 && (
                  <span className="px-2 py-0.5 text-[9px] bg-red-600 text-white rounded-xs font-bold animate-pulse">
                    {stats.newInquiries} New
                  </span>
                )}
              </button>
            </div>

            <div className="border-t border-[#1F1F1F] pt-6">
              <div className="bg-[#111111] p-3.5 rounded-sm border border-[#1F1F1F] flex items-center justify-between mb-4">
                <p className="text-[10px] text-[#888] font-mono uppercase">Status: Live Access</p>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              </div>

              <button
                onClick={handleLogout}
                id="admin-logout-button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1A1A] hover:bg-rose-955 text-rose-400 hover:text-white rounded-sm text-xs font-bold uppercase tracking-widest border border-rose-950/40 transition-all duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Panel
              </button>
            </div>
          </div>
        ) : (
          /* Logged Out Sidebar Info */
          <div className="flex flex-col justify-between flex-grow">
            <p className="text-xs text-[#888] leading-relaxed">
              Verify the authorized passcode to unlock catalogs editing capabilities, register properties, adjust pricing tier statuses, or answer live luxury home search requests.
            </p>
            <div className="mt-8 pt-4 border-t border-[#1F1F1F]">
              <button
                onClick={onClosePanel}
                className="text-xs text-[#D4AF37] hover:text-[#C5A267] font-semibold flex items-center gap-1 cursor-pointer"
              >
                ← Back to Homepage
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow p-6 sm:p-8 flex flex-col gap-6 overflow-hidden bg-[#0A0A0A] text-[#E0E0E0]">
        
        {/* If NOT LOGGED IN, show Login Screen */}
        {!token ? (
          <div className="flex-grow flex items-center justify-center max-w-md mx-auto py-12 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0F0F0F] border border-[#1F1F1F] p-8 rounded-sm shadow-lg w-full flex flex-col"
            >
              <div className="mx-auto bg-[#111] p-3.5 rounded-full text-[#D4AF37] mb-4 shadow-sm border border-[#1F1F1F]">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-serif text-white text-center mb-1 italic font-bold">
                Authorized Login Gate
              </h2>
              <p className="text-[#888] text-xs text-center mb-6">
                Enter your security administrative passcode. (Default: <code className="font-mono bg-[#0A0A0A] border border-[#1F1F1F] px-1 py-0.5 rounded text-[#D4AF37]">admin123</code>)
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#888] uppercase tracking-wider block mb-1">
                    Administrative Passcode
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-sm focus:border-[#D4AF37] focus:outline-hidden text-center text-lg font-mono tracking-widest text-white transition-all duration-150"
                  />
                </div>

                {authError && (
                  <div className="text-xs font-bold text-[#ff4f5a] bg-rose-955/20 p-2.5 rounded border border-rose-955/40 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-550 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  id="admin-login-submit"
                  className="w-full py-3 bg-[#D4AF37] hover:bg-[#C5A267] disabled:bg-[#333] text-black font-bold text-xs uppercase tracking-widest rounded-sm cursor-pointer shadow-sm transition-all duration-150"
                >
                  {authLoading ? "Unlocking Portal..." : "Authorize Access"}
                </button>
              </form>

              <button
                onClick={onClosePanel}
                className="mt-6 text-xs text-[#888] hover:text-white font-bold text-center underline cursor-pointer"
              >
                Cancel and return home
              </button>
            </motion.div>
          </div>
        ) : (
          /* Logged In Dashboard Console */
          <div className="flex flex-col gap-6 h-full overflow-hidden">
            
            {/* Top header stats bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1F1F1F] pb-5">
              <div>
                <h1 className="text-2xl font-serif text-white italic font-bold">
                  Dashboard Hub Console
                </h1>
                <p className="text-xs text-[#888] flex flex-wrap items-center gap-2">
                  <span>Authorized console</span>
                  <span>•</span>
                  <span>Manage {allListings.length} active listings</span>
                  <span>•</span>
                  <button 
                    onClick={fetchAdminData} 
                    disabled={loadingData}
                    className="text-[#D4AF37] hover:underline inline-flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingData ? 'animate-spin' : ''}`} /> Sync Database
                  </button>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleOpenAddMode}
                  id="admin-add-listing-button"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C5A267] text-black font-extrabold text-xs uppercase tracking-widest rounded-sm flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4.5 h-4.5" />
                  Add New Listing
                </button>
              </div>
            </div>

            {/* Stats Cards Grid */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-4 rounded-sm shadow-xs">
                  <span className="text-[#888] text-[9px] font-bold uppercase tracking-widest block">Listings Portfolio</span>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xl font-serif font-black text-[#D4AF37] italic">{stats.totalListings}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-[#1A1A1A] text-white border border-[#1F1F1F] rounded-sm">{stats.activeListings} Active</span>
                  </div>
                </div>

                <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-4 rounded-sm shadow-xs">
                  <span className="text-[#888] text-[9px] font-bold uppercase tracking-widest block">Total Portfolio Value</span>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sm font-serif font-black text-white italic truncate" title={formatValue(stats.totalValue)}>
                      {formatValue(stats.totalValue)}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] rounded-sm uppercase">Est</span>
                  </div>
                </div>

                <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-4 rounded-sm shadow-xs">
                  <span className="text-[#888] text-[9px] font-bold uppercase tracking-widest block">Status Distribution</span>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 rounded-md">{stats.pendingListings} Pend</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25 rounded-md">{stats.soldListings} Sold</span>
                  </div>
                </div>

                <div className="bg-[#0F0F0F] border border-[#1F1F1F] p-4 rounded-sm shadow-xs">
                  <span className="text-[#888] text-[9px] font-bold uppercase tracking-widest block">Total Inquiries</span>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xl font-serif font-black text-[#D4AF37] italic">{stats.totalInquiries}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-[#D4AF37] text-black rounded-sm uppercase tracking-wide">{stats.newInquiries} Action</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTAINER VIEW */}
            {activeTab === 'listings' ? (
              /* TAB: MANAGE LISTINGS */
              <div className="flex-grow flex flex-col min-h-0 bg-[#0F0F0F] border border-[#1F1F1F] rounded-sm overflow-hidden shadow-xs">
                <div className="p-4 bg-[#111] border-b border-[#1F1F1F] flex items-center justify-between">
                  <h3 className="font-bold text-[#E0E0E0] text-sm flex items-center gap-1.5 font-serif italic">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    Property Catalog Directory ({allListings.length})
                  </h3>
                  <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Live catalog</span>
                </div>

                <div className="flex-grow overflow-auto p-2">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-widest text-[#888] font-bold border-b border-[#1F1F1F]">
                        <th className="p-3">Property Name</th>
                        <th className="p-3">Price Bracket</th>
                        <th className="p-3">Specs</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allListings.map((p) => (
                        <tr key={p.id} className="hover:bg-[#111111] border-b border-[#1F1F1F]/40 transition-colors duration-100 group">
                          
                          {/* Property Details Column */}
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-10 object-cover rounded-sm bg-[#0A0A0A] border border-[#1F1F1F] shrink-0"
                              />
                              <div className="truncate max-w-[200px]">
                                <h4 className="font-bold font-serif text-white group-hover:text-[#D4AF37] italic truncate">{p.title}</h4>
                                <span className="text-[#888] text-[11px] flex items-center gap-1 truncate">
                                  <Clock className="w-3" /> {p.address}, {p.city}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="p-3 font-semibold text-white font-mono">
                            {formatValue(p.price)}
                            {p.listingType === 'Rent' && <span className="text-[10px] text-[#555]">/mo</span>}
                          </td>

                          {/* Specifics */}
                          <td className="p-3 text-xs text-[#888] font-medium font-mono">
                            {p.bedrooms} Beds / {p.bathrooms} Baths • {p.areaSqFt.toLocaleString()} sqft
                          </td>

                          {/* Property Type Badge */}
                          <td className="p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#111] border border-[#1F1F1F] rounded-sm text-white">
                              {p.propertyType}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="p-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm inline-block border ${
                              p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              p.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </td>

                          {/* Action panel Buttons */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditMode(p)}
                                id={`edit-button-${p.id}`}
                                className="p-1.5 hover:bg-[#1A1A1A] border border-transparent hover:border-[#1F1F1F] rounded-xs text-[#888] hover:text-[#D4AF37] transition-all cursor-pointer"
                                title="Edit parameters"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(p.id, p.title)}
                                id={`delete-button-${p.id}`}
                                className="p-1.5 hover:bg-rose-955/20 border border-transparent hover:border-rose-950/45 rounded-xs text-[#555] hover:text-red-450 transition-all cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}

                      {allListings.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-[#888]">
                            No listings saved in catalog database yet. Click "Add New Listing" to get began.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* TAB: MANAGE INQUIRIES */
              <div className="flex-grow flex flex-col min-h-0 bg-[#0F0F0F] border border-[#1F1F1F] rounded-sm overflow-hidden shadow-xs">
                <div className="p-4 bg-[#111] border-b border-[#1F1F1F] flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-1.5 font-serif italic">
                    <Inbox className="w-4 h-4 text-[#D4AF37]" />
                    Inquiry Repository Desk ({inquiries.length})
                  </h3>
                  <span className="text-[10px] font-mono text-[#888] uppercase tracking-widest">Interactive desk</span>
                </div>

                <div className="flex-grow overflow-auto p-4 flex flex-col gap-4">
                  {inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      className={`p-4 rounded-sm border transition-all duration-150 relative ${
                        inq.status === 'New' ? 'bg-[#D4AF37]/5 border-[#D4AF37]/25' : 
                        inq.status === 'Contacted' ? 'bg-[#111111] border-[#1F1F1F]' : 'bg-[#111111]/30 border-[#1F1F1F] opacity-50'
                      }`}
                    >
                      {/* Priority tag */}
                      {inq.status === 'New' && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-650 text-white rounded-sm">
                            New Input
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Seeker parameters (4 cols) */}
                        <div className="md:col-span-4 flex flex-col gap-1.5">
                          <h4 className="font-bold text-white font-serif text-sm italic">
                            {inq.clientName}
                          </h4>
                          <p className="text-xs text-[#888] flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <a href={`mailto:${inq.clientEmail}`} className="hover:underline transition-colors duration-100 truncate hover:text-[#D4AF37]">
                              {inq.clientEmail}
                            </a>
                          </p>
                          {inq.clientPhone && (
                            <p className="text-xs text-[#888] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                              <a href={`tel:${inq.clientPhone}`} className="hover:underline transition-colors duration-100 truncate hover:text-[#D4AF37]">
                                {inq.clientPhone}
                              </a>
                            </p>
                          )}
                          <p className="text-[10px] text-[#555] font-mono mt-1">
                            Submitted: {new Date(inq.createdAt).toLocaleDateString()} at {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Message / property link (5 cols) */}
                        <div className="md:col-span-5 flex flex-col gap-2">
                          <div className="bg-[#0A0A0A] hover:bg-[#111111] px-3 py-1.5 rounded-sm border border-[#1F1F1F] inline-flex items-center gap-1 text-[10px] font-bold text-[#E0E0E0] w-fit">
                            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Regarding: <span className="text-[#D4AF37] truncate max-w-[170px] font-serif italic">{inq.propertyTitle}</span>
                          </div>
                          
                          <blockquote className="text-xs text-[#888] bg-[#0A0A0A] p-2.5 rounded-sm border border-[#1F1F1F]/60 italic leading-relaxed">
                            "{inq.message}"
                          </blockquote>
                        </div>

                        {/* Status modifiers (3 cols) */}
                        <div className="md:col-span-3 flex flex-col md:items-end justify-between gap-3">
                          <div className="flex flex-col gap-1 w-full md:items-end font-mono">
                            <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block">Pipeline Status</label>
                            <select
                              value={inq.status}
                              onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value as Inquiry['status'])}
                              className={`text-xs font-bold rounded-sm px-2 w-full max-w-[120px] py-1 bg-[#0A0A0A] border focus:outline-hidden transition-all duration-100 ${
                                inq.status === 'New' ? 'border-[#D4AF37]/50 text-[#D4AF37]' :
                                inq.status === 'Contacted' ? 'border-sky-500/40 text-sky-400' : 'border-[#1F1F1F] text-[#555]'
                              }`}
                            >
                              <option value="New" className="bg-[#0A0A0A] text-[#D4AF37]">New</option>
                              <option value="Contacted" className="bg-[#0A0A0A] text-sky-400">Contacted</option>
                              <option value="Archived" className="bg-[#0A0A0A] text-[#555]">Archived</option>
                            </select>
                          </div>

                          <a
                            href={`mailto:${inq.clientEmail}?subject=Regarding your inquiry on ${encodeURIComponent(inq.propertyTitle)}`}
                            className="text-xs font-bold text-[#D4AF37] hover:text-white flex items-center gap-1 hover:underline transition-colors"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Mail className="w-3.5 h-3.5" /> Direct Email Reply
                          </a>
                        </div>
                      </div>

                    </div>
                  ))}

                  {inquiries.length === 0 && (
                    <div className="text-center py-12 text-[#888]">
                      No customer inquiries have been submitted yet. When clients fill the real estate details modal form, they appear here.
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT PROPERTY */}
      <AnimatePresence>
        {showPropertyFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPropertyFormModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col h-[90vh] z-10"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    {editingProperty ? `Edit Listing: ${editingProperty.title}` : "Create Real Estate Catalog Entry"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input property configuration details correctly. Parsed dynamically to visitors.
                  </p>
                </div>
                <button
                  onClick={() => setShowPropertyFormModal(false)}
                  className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form container scroll area */}
              <form onSubmit={handleSaveProperty} className="overflow-y-auto p-6 sm:p-8 flex-grow flex flex-col gap-5">
                
                {/* Visual feedback warning */}
                {formError && (
                  <div className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Section: Title, Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Property Header Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Ultra-Modern Beverly Hills Villa"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden transition-all duration-150"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Property Types & Categories *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={formPropertyType}
                        onChange={(e) => setFormPropertyType(e.target.value as Listing['propertyType'])}
                        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Land">Land</option>
                      </select>

                      <select
                        value={formListingType}
                        onChange={(e) => setFormListingType(e.target.value as Listing['listingType'])}
                        className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section: Price, Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Pricing (USD) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="e.g., 850000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Status pipeline *</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as Listing['status'])}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Featured Highlight</label>
                    <div className="flex items-center gap-2 h-[42px] px-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <input
                        type="checkbox"
                        id="form-featured-check"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="form-featured-check" className="text-xs text-slate-650 cursor-pointer font-bold select-none">
                        Promote to Home Featured
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section: Address, City, State */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 204 Pine St"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Austin"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">State Code (e.g. CA, NY) *</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="TX"
                      value={formStateVal}
                      onChange={(e) => setFormStateVal(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Section: Bedrooms, Bathrooms, Area, Built */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Bedrooms</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(e.target.value)}
                      className="w-full px-2.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-center focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Bathrooms</label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(e.target.value)}
                      className="w-full px-2.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-center focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">SqFt Area</label>
                    <input
                      type="number"
                      min={0}
                      value={formAreaSqFt}
                      onChange={(e) => setFormAreaSqFt(e.target.value)}
                      className="w-full px-2.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-center focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Year Built</label>
                    <input
                      type="number"
                      min={1700}
                      max={2027}
                      value={formYearBuilt}
                      onChange={(e) => setFormYearBuilt(e.target.value)}
                      className="w-full px-2.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-center focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Image URL input */}
                <div>
                  <label className="text-xs font-extrabold text-slate-600 block mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or leave blank for dynamic placeholder image"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  />
                </div>

                {/* Features input */}
                <div>
                  <label className="text-xs font-extrabold text-slate-600 block mb-1">Features (comma-separated list for tags)</label>
                  <input
                    type="text"
                    placeholder="e.g. Garden, Central Air, Security Cameras, Smart Lock, Garage"
                    value={formFeatures}
                    onChange={(e) => setFormFeatures(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Divide items with commas. They will render beautifully as specific icons or amenity items on the property drawer.
                  </span>
                </div>

                {/* Description textarea */}
                <div>
                  <label className="text-xs font-extrabold text-slate-600 block mb-1">Property Narrative Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the highlight factors of the property, structural perks, neighborhood attributes..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Sticky save panel */}
                <div className="mt-4 border-t border-slate-100 pt-4 flex items-center justify-end gap-3 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowPropertyFormModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    id="save-property-submit"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl cursor-pointer shadow-xs disabled:bg-slate-350"
                  >
                    {formSubmitting ? "Committing..." : "Save Listing"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
