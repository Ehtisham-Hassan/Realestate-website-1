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
    <div className="min-h-screen text-brand-black bg-brand-cream flex flex-col font-sans transition-colors duration-200">

      {/* 1. TOP HEADER DECOR */}
      <header className="sticky top-0 z-40 bg-brand-white/90 backdrop-blur-md border-b border-brand-border shadow-sm">
        <div id="navigation-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

          {/* Logo element */}
          <button
            onClick={() => { setViewMode('client'); handleResetFilters(); }}
            id="brand-logo-trigger"
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm border border-brand-border bg-brand-white flex-shrink-0 group-hover:opacity-80 transition-opacity">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80" 
                alt="Vantage Real Estate" 
                className="w-full h-full object-cover grayscale opacity-90"
              />
            </div>
            <div>
              <h1 className="text-xl font-serif text-brand-black tracking-tight leading-none">
                Vantage Real Estate
              </h1>
              <span className="text-[10px] uppercase tracking-widest text-brand-grey block mt-1">Luxury Real Estate Portal</span>
            </div>
          </button>

          {/* Navigation views state controls */}
          <nav className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('client')}
              id="switch-client-view"
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer ${viewMode === 'client'
                  ? 'bg-brand-black text-brand-white'
                  : 'text-brand-grey hover:text-brand-black'
                }`}
            >
              <Home className="w-4 h-4" />
              Explore Homes
            </button>

            <button
              onClick={() => setViewMode('admin')}
              id="switch-admin-view"
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150 cursor-pointer ${viewMode === 'admin'
                  ? 'bg-brand-grey text-brand-white hover:bg-brand-black'
                  : 'text-brand-grey hover:text-brand-black'
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

            {/* HERO SECTION BANNER */}
            <section className="relative overflow-hidden bg-brand-white rounded-2xl p-6 sm:p-12 mb-2 shadow-sm border border-brand-border">
              <div className="flex flex-col md:flex-row items-center gap-8 relative">
                <div className="flex-1 max-w-2xl relative">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-cream border border-brand-border text-brand-grey text-[10px] font-bold uppercase tracking-widest rounded mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Premium Selection
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-serif text-brand-black tracking-tight mb-4 leading-tight">
                    Exceptional Properties for Discerning Buyers
                  </h2>

                  <p className="text-brand-grey text-sm sm:text-base leading-relaxed mb-6">
                    Browse verified property listings, customize advanced filters, and submit secure inquiries directly to our administrative desk.
                  </p>

                  {/* Integrated search line */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-brand-cream-alt p-2.5 rounded-lg border border-brand-border w-full">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3.5 top-3 w-5 h-5 text-brand-grey" />
                      <input
                        type="text"
                        placeholder="Search by city, state, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent pl-11 pr-4 py-2.5 text-brand-black placeholder-gray-400 focus:outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-4 py-2.5 bg-brand-black hover:bg-brand-grey text-brand-white font-semibold text-xs rounded border border-brand-black flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-brand-white" />
                      {showFilters ? "Hide" : "Advanced"} Filters
                    </button>
                  </div>
                </div>

                {/* Realtor Agent Profile */}
                <div className="hidden md:flex flex-col items-center flex-shrink-0">
                  <div className="w-70 h-70 rounded-full overflow-hidden border-4 border-brand-cream-alt shadow-lg mb-8 relative group">
                    <div className="absolute inset-0 bg-brand-black/5 group-hover:bg-transparent transition-colors z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1627161683077-e34782c24d81?q=80&w=703&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Clay Elliot"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-serif text-brand-black tracking-tight">Clay Elliot</h3>
                    <p className="text-[10px] text-brand-grey uppercase tracking-widest font-bold">Top Realtor</p>
                  </div>
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
                  className="bg-brand-cream-alt border border-brand-border p-5 rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-4">
                    <h3 className="font-bold text-sm text-brand-black uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4.5 h-4.5 text-brand-black" /> Filter Criteria Config
                    </h3>

                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-rose-600 hover:text-rose-500 font-bold cursor-pointer transition-colors duration-150"
                    >
                      Reset All Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Filter: Property Type */}
                    <div>
                      <label className="text-[10px] font-bold text-brand-grey uppercase tracking-[0.15em] block mb-1">Property Build Type</label>
                      <select
                        value={propertyTypeFilter}
                        onChange={(e) => setPropertyTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-brand-white border border-brand-border text-brand-black rounded focus:border-brand-grey focus:outline-none font-semibold"
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
                      <label className="text-[10px] font-bold text-brand-grey uppercase tracking-[0.15em] block mb-1">Listing Type</label>
                      <div className="flex gap-1.5 p-1 bg-brand-cream border border-brand-border rounded">
                        {['All', 'Sale', 'Rent'].map((type) => (
                          <button
                            key={type}
                            onClick={() => setListingTypeFilter(type)}
                            className={`flex-grow py-1 text-[10px] uppercase font-extrabold rounded transition-all cursor-pointer ${listingTypeFilter === type
                                ? 'bg-brand-black text-brand-white'
                                : 'text-brand-grey hover:text-brand-black'
                              }`}
                          >
                            {type === 'All' ? 'Buy or Rent' : type === 'Sale' ? 'For Sale' : 'For Rent'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter: Beds */}
                    <div>
                      <label className="text-[10px] font-bold text-brand-grey uppercase tracking-[0.15em] block mb-1">Min Bedrooms</label>
                      <select
                        value={bedsFilter}
                        onChange={(e) => setBedsFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-brand-white border border-brand-border text-brand-black rounded focus:border-brand-grey font-semibold"
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
                        <label className="text-[10px] font-bold text-brand-grey uppercase tracking-[0.15em]">Max Price Limit</label>
                        <span className="text-xs font-mono font-bold text-brand-black">
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
                        className="w-full h-1.5 bg-brand-border rounded-lg appearance-none cursor-pointer accent-brand-black"
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
                  <div className="p-1 px-2.5 bg-brand-border text-brand-black text-[10px] font-extrabold uppercase rounded tracking-wider border border-brand-grey/20">
                    ★ Curator Picks
                  </div>
                  <h3 className="text-xl font-serif text-brand-black tracking-tight">
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
                    <div className="col-span-3 text-center py-6 text-brand-grey text-xs border border-dashed border-brand-border rounded-xl bg-brand-cream-alt">
                      No featured listings active in database. Add or flag properties in dashboard!
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* CATALOG SECTION GRID */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-3 gap-3">

                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-serif text-brand-black tracking-tight">
                    All Available Listings
                  </h3>
                  <span className="px-2.5 py-0.5 bg-brand-cream-alt text-brand-grey border border-brand-border text-xs font-bold rounded-full">
                    {sortedAndFilteredListings.length} matching
                  </span>
                </div>

                {/* Sort Option controls */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-brand-grey" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="px-3 py-1.5 bg-brand-white border border-brand-border text-brand-black rounded text-xs font-semibold focus:outline-none focus:border-brand-grey"
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
                <div className="flex flex-col items-center justify-center py-20 text-brand-grey gap-3">
                  <RefreshCw className="w-10 h-10 animate-spin text-brand-black" />
                  <p className="font-mono text-xs text-brand-grey">Accessing listings repository...</p>
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
                    <div className="text-center py-20 bg-brand-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col items-center gap-2 max-w-md mx-auto mt-6">
                      <Compass className="w-12 h-12 text-brand-grey animate-bounce" />
                      <h4 className="font-bold text-brand-black font-serif">No Listings Found</h4>
                      <p className="text-brand-grey text-xs text-center">
                        There are no listings matching your active query or pricing ranges. Reset filter conditions to explore other premium properties.
                      </p>

                      <button
                        onClick={handleResetFilters}
                        className="mt-2 text-xs font-bold text-brand-black hover:underline cursor-pointer"
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
      <footer className="bg-brand-white text-brand-grey text-xs py-10 mt-12 border-t border-brand-border">
        <div id="footer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

          <div className="flex flex-col gap-2">
            <h4 className="font-serif text-brand-black text-sm flex items-center gap-1.5 justify-center md:justify-start">
              <Building2 className="w-4 h-4 text-brand-black" />
              Vantage Real Estate Desk
            </h4>
            <p className="max-w-xs mx-auto md:mx-0 text-brand-grey text-[11px] leading-relaxed">
              Curating architectural gems and beautiful lifestyles. Every listing verified by an authorized agency consultant.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-brand-black text-sm mb-2">Platform Capabilities</h4>
            <ul className="flex flex-col gap-1 text-brand-grey text-[11px]">
              <li>• Secure Agent Passcode Locking</li>
              <li>• Live Inquiry Pipeline Monitoring</li>
              <li>• Interactive Catalog Editing Suite</li>
              <li>• Advanced Multidimensional Search</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-brand-black text-sm mb-2">Authorized Access only</h4>
            <p className="text-brand-grey text-[11px] mb-3">
              Only site administrators can edit entries and update availability statuses.
            </p>
            <button
              onClick={() => { setViewMode('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-xs font-bold text-brand-black hover:text-brand-grey hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Sign In to Management Panel <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-border mt-8 pt-6 text-center text-brand-grey text-[10px]">
          © {new Date().getFullYear()} Vantage Real Estate. Built with elegant React and live fullstack local persistence. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
