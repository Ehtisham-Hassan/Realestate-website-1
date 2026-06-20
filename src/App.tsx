import { useState, useEffect } from "react";
import { Listing } from "./types";
import PropertyCard from "./components/PropertyCard";
import PropertyModal from "./components/PropertyModal";
import ChatBot from "./components/ChatBot";
import AdminPanel from "./components/AdminPanel";
import { 
  Building2, Search, SlidersHorizontal, MapPin, 
  Home, Shield, Grid, ArrowUpDown, RefreshCw, Sparkles, 
  ChevronRight, Compass, DollarSign, Bed, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Global property catalog
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Target view modes: 'client' | 'admin'
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [selectedProperty, setSelectedProperty] = useState<Listing | null>(null);

  // Filter conditions
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("All");
  const [listingTypeFilter, setListingTypeFilter] = useState<string>("All");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(6000000);
  const [bedsFilter, setBedsFilter] = useState<string>("Any");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch all listings
  const fetchListings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listings");
      if (!res.ok) {
        throw new Error("Could not fetch real estate listings from mock database.");
      }
      const data = await res.json();
      setListings(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load real estate catalog. Server status offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Filter listings algorithm
  const filteredListings = listings.filter((p) => {
    // 1. Text search
    const matchesQuery = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Property Type
    const matchesPropertyType = propertyTypeFilter === 'All' || p.propertyType === propertyTypeFilter;

    // 3. Listing Type (Rent vs Sale)
    const matchesListingType = listingTypeFilter === 'All' || p.listingType === listingTypeFilter;

    // 4. Max Price
    const matchesPrice = p.price <= maxPriceFilter;

    // 5. Bedrooms
    let matchesBeds = true;
    if (bedsFilter !== "Any") {
      const requiredBeds = parseInt(bedsFilter);
      matchesBeds = p.bedrooms >= requiredBeds;
    }

    return matchesQuery && matchesPropertyType && matchesListingType && matchesPrice && matchesBeds;
  });

  // Sort listings algorithm
  const sortedAndFilteredListings = [...filteredListings].sort((a, b) => {
    switch (sortOption) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'size-desc':
        return b.areaSqFt - a.areaSqFt;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - a.createdAt.localeCompare(b.createdAt);
    }
  });

  // Reset filtering options
  const handleResetFilters = () => {
    setSearchQuery("");
    setPropertyTypeFilter("All");
    setListingTypeFilter("All");
    setMaxPriceFilter(6000000);
    setBedsFilter("Any");
    setSortOption("newest");
  };

  // Find max listing price to bound sliders dynamically
  const highestPriceInCatalog = listings.length > 0 
    ? Math.max(...listings.map(l => l.price)) 
    : 6000000;

  useEffect(() => {
    if (highestPriceInCatalog > 0 && maxPriceFilter === 6000000) {
      setMaxPriceFilter(highestPriceInCatalog);
    }
  }, [highestPriceInCatalog]);

  return (
    <div className="min-h-screen text-[#E0E0E0] bg-[#0A0A0A] flex flex-col font-sans transition-colors duration-200">
      
      {/* 1. TOP HEADER DECOR */}
      <header className="sticky top-0 z-40 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-[#1F1F1F] shadow-md">
        <div id="navigation-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo element */}
          <button 
            onClick={() => { setViewMode('client'); handleResetFilters(); }}
            id="brand-logo-trigger"
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="bg-[#D4AF37] text-black p-2.5 rounded-lg shadow-sm transition-colors group-hover:bg-[#C5A267]">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-[#D4AF37] italic tracking-tighter leading-none">
                Vantage Real Estate
              </h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#888] block mt-1">Luxury Real Estate Portal</span>
            </div>
          </button>

          {/* Navigation views state controls */}
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('client')}
              id="switch-client-view"
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer ${
                viewMode === 'client' 
                  ? 'bg-[#1A1A1A] text-[#D4AF37] border border-[#D4AF37]/50' 
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              Explore Homes
            </button>

            <button
              onClick={() => setViewMode('admin')}
              id="switch-admin-view"
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer ${
                viewMode === 'admin' 
                  ? 'bg-[#D4AF37] text-black hover:bg-[#C5A267]' 
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Access
            </button>
          </nav>

        </div>
      </header>

      {/* 2. CHOOSE LAYOUT ON THE CORE VIEW MODE */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">

        {viewMode === 'admin' ? (
          /* ======================================================== */
          /* ADMINISTRATIVE SPACE                                     */
          /* ======================================================== */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-grow flex flex-col"
          >
            <AdminPanel 
              allListings={listings} 
              onListingChange={fetchListings} 
              onClosePanel={() => setViewMode('client')} 
            />
          </motion.div>
        ) : (
          /* ======================================================== */
          /* VISITOR / CLIENT EXPLORE SPACE                           */
          /* ======================================================== */
          <div className="flex flex-col gap-8 flex-grow">
            
            {/* HERO HERO SECTION BANNER */}
            <section className="relative overflow-hidden bg-[#111111] text-[#E0E0E0] rounded-2xl p-6 sm:p-12 mb-2 shadow-sm border border-[#1F1F1F]">
              {/* Backlight effect */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-[200px] h-[200px] bg-[#D4AF37]/5 rounded-full blur-2xl -z-10" />

              <div className="max-w-2xl relative">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1A1A] border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Dream Address Awaits
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-serif text-white italic tracking-tight mb-4 leading-tight">
                  Discover the Place You'll Love to Call Home
                </h2>
                
                <p className="text-[#888] text-sm sm:text-base leading-relaxed mb-6">
                  Browse real, agent-verified property listings, customize advanced filters, and submit secure inquiries directly to our administrative desk.
                </p>

                {/* Integrated search line */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#0A0A0A] p-2.5 rounded-lg border border-[#1F1F1F] w-full">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-3 w-5 h-5 text-[#888]" />
                    <input
                      type="text"
                      placeholder="Search by city, state, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent pl-11 pr-4 py-2.5 text-white placeholder-[#555] focus:outline-hidden text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white font-semibold text-xs rounded border border-[#333] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                    {showFilters ? "Hide" : "Advanced"} Filters
                  </button>
                </div>
              </div>
            </section>

            {/* DETAILED FILTERS ACCORDION */}
            <AnimatePresence>
              {(showFilters || propertyTypeFilter !== 'All' || listingTypeFilter !== 'All' || bedsFilter !== 'Any' || maxPriceFilter < highestPriceInCatalog) && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#0F0F0F] border border-[#1F1F1F] p-5 rounded-2xl shadow-xs overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3 mb-4">
                    <h3 className="font-bold text-sm text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4.5 h-4.5 text-[#D4AF37]" /> Filter Criteria Config
                    </h3>
                    
                    <button 
                      onClick={handleResetFilters}
                      className="text-xs text-rose-550 hover:text-rose-400 font-bold cursor-pointer transition-colors duration-150"
                    >
                      Reset All Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* Filter: Property Type */}
                    <div>
                      <label className="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] block mb-1">Property Build Type</label>
                      <select
                        value={propertyTypeFilter}
                        onChange={(e) => setPropertyTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#111] border border-[#1F1F1F] text-[#E0E0E0] rounded focus:border-[#D4AF37] focus:outline-hidden font-semibold"
                      >
                        <option value="All">All Types</option>
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Land">Land</option>
                      </select>
                    </div>

                    {/* Filter: Rent/Sale */}
                    <div>
                      <label className="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] block mb-1">Listing Type</label>
                      <div className="flex gap-1.5 p-1 bg-[#111] border border-[#1F1F1F] rounded">
                        {['All', 'Sale', 'Rent'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setListingTypeFilter(type)}
                            className={`flex-grow py-1 text-[10px] uppercase font-extrabold rounded transition-all cursor-pointer ${
                              listingTypeFilter === type 
                                ? 'bg-[#D4AF37] text-black' 
                                : 'text-[#888] hover:text-white'
                            }`}
                          >
                            {type === 'All' ? 'Buy or Rent' : type === 'Sale' ? 'For Sale' : 'For Rent'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter: Beds */}
                    <div>
                      <label className="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em] block mb-1">Min Bedrooms</label>
                      <select
                        value={bedsFilter}
                        onChange={(e) => setBedsFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#111] border border-[#1F1F1F] text-[#E0E0E0] rounded focus:border-[#D4AF37] text-slate-300 font-semibold"
                      >
                        <option value="Any">Any Amount</option>
                        <option value="1">1+ Bedrooms</option>
                        <option value="2">2+ Bedrooms</option>
                        <option value="3">3+ Bedrooms</option>
                        <option value="4">4+ Bedrooms</option>
                        <option value="5">5+ Bedrooms</option>
                      </select>
                    </div>

                    {/* Filter: Max Price Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-[#888] uppercase tracking-[0.15em]">Max Price Limit</label>
                        <span className="text-xs font-mono font-bold text-[#D4AF37]">
                          {maxPriceFilter === highestPriceInCatalog ? "Any Price" : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(maxPriceFilter)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={highestPriceInCatalog > 1000 ? highestPriceInCatalog : 6000000}
                        step={listingTypeFilter === 'Rent' ? 500 : 25000}
                        value={maxPriceFilter}
                        onChange={(e) => setMaxPriceFilter(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[#1F1F1F] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                      />
                    </div>

                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* ERROR VIEW CONTAINER */}
            {error && (
              <div className="p-4 bg-[#1F1315] border-2 border-red-950/40 rounded-xl flex items-center gap-3">
                <Info className="w-5 h-5 text-red-500 shrink-0" />
                <div className="text-red-400 text-sm font-semibold">{error}</div>
                <button 
                  onClick={fetchListings}
                  className="ml-auto px-3 py-1.5 bg-[#D4AF37] text-black font-bold text-xs rounded cursor-pointer"
                >
                  Retry Load
                </button>
              </div>
            )}

            {/* FEATURED PROPERTIES SECTION (Only render when there's no major filtering query for organic discoverability) */}
            {searchQuery === "" && propertyTypeFilter === "All" && listingTypeFilter === "All" && bedsFilter === "Any" && !loading && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 px-2.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-extrabold uppercase rounded tracking-wider border border-[#D4AF37]/20">
                    ★ Curator Picks
                  </div>
                  <h3 className="text-xl font-serif text-white italic tracking-tight">
                    Featured Properties
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {listings.filter(l => l.featured).slice(0, 3).map((property) => (
                    <PropertyCard 
                       key={property.id} 
                      property={property} 
                      onViewDetails={setSelectedProperty} 
                    />
                  ))}
                  {listings.filter(l => l.featured).length === 0 && (
                    <div className="col-span-3 text-center py-6 text-[#555] text-xs border border-dashed border-[#1F1F1F] rounded-xl bg-[#0F0F0F]">
                      No featured listings active in database. Add or flag properties in dashboard!
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* CATALOG SECTION GRID */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1F1F1F] pb-3 gap-3">
                
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif text-white italic tracking-tight">
                    All Available Listings
                  </h3>
                  <span className="px-2.5 py-0.5 bg-[#0F0F0F] text-[#888] border border-[#1F1F1F] text-xs font-bold rounded-full">
                    {sortedAndFilteredListings.length} matching
                  </span>
                </div>

                {/* Sort Option controls */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-[#888]" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="px-3 py-1.5 bg-[#111] border border-[#1F1F1F] text-[#E0E0E0] rounded text-xs font-semibold focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    <option value="newest">Newest Added first</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="size-desc">Square footage: Largest first</option>
                  </select>
                </div>

              </div>

              {loading ? (
                /* Loading screen */
                <div className="flex flex-col items-center justify-center py-20 text-[#555] gap-3">
                  <RefreshCw className="w-10 h-10 animate-spin text-[#D4AF37]" />
                  <p className="font-mono text-xs text-[#888]">Accessing listings repository...</p>
                </div>
              ) : (
                /* Grid of listing cards */
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {sortedAndFilteredListings.map((p) => (
                      <PropertyCard 
                        key={p.id} 
                        property={p} 
                        onViewDetails={setSelectedProperty} 
                      />
                    ))}
                  </div>

                  {sortedAndFilteredListings.length === 0 && (
                    <div className="text-center py-20 bg-[#0F0F0F] border border-[#1F1F1F] rounded-2xl p-6 shadow-xs flex flex-col items-center gap-2 max-w-md mx-auto mt-6">
                      <Compass className="w-12 h-12 text-[#555] animate-bounce" />
                      <h4 className="font-bold text-white font-serif">No Listings Found</h4>
                      <p className="text-[#888] text-xs text-center">
                        There are no listings matching your active query or pricing ranges. Reset filter conditions to explore other premium properties.
                      </p>
                      
                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-bold text-[#D4AF37] hover:underline cursor-pointer"
                      >
                        Reset searching and categories filter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

          </div>
        )}

      </main>

      {/* 3. SITE-WIDE FLOATING PROPERTY DETAILS DRAWER MODAL */}
      <PropertyModal 
        property={selectedProperty} 
        onClose={() => setSelectedProperty(null)} 
      />

      {/* CHATBOT */}
      <ChatBot 
        listings={listings} 
        onViewDetails={setSelectedProperty} 
      />

      {/* 4. SITE FOOTER */}
      <footer className="bg-[#0F0F0F] text-[#888] text-xs py-10 mt-12 border-t border-[#1F1F1F]">
        <div id="footer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div className="flex flex-col gap-2">
            <h4 className="font-serif text-[#D4AF37] text-sm italic flex items-center gap-1.5 justify-center md:justify-start">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
              Vantage Real Estate Desk
            </h4>
            <p className="max-w-xs mx-auto md:mx-0 text-[#555] text-[11px] leading-relaxed">
              Curating architectural gems and beautiful lifestyles since 2026. Every listing verified by an authorized agency consultant.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-white text-sm mb-2">Platform Capabilities</h4>
            <ul className="flex flex-col gap-1 text-[#555] text-[11px]">
              <li>• Secure Agent Passcode Locking</li>
              <li>• Live Inquiry Pipeline Monitoring</li>
              <li>• Interactive Catalog Editing Suite</li>
              <li>• Advanced Multidimensional Search</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-white text-sm mb-2">Authorized Access only</h4>
            <p className="text-[#555] text-[11px] mb-3">
              Only site administrators can edit entries and update availability statuses.
            </p>
            <button
              onClick={() => { setViewMode('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-bold text-[#D4AF37] hover:text-[#C5A267] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Sign In to Management Panel <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1F1F1F] mt-8 pt-6 text-center text-[#555] text-[10px]">
          © {new Date().getFullYear()} Vantage Real Estate. Built with elegant React and live fullstack local persistence. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
