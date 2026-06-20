import { Listing } from "../types";
import { BedDouble, Bath, Maximize2, MapPin } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface PropertyCardProps {
  property: Listing;
  onViewDetails: (property: Listing) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails }) => {
  // Format price
  const formatPrice = (price: number, type: 'Sale' | 'Rent') => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
    
    return type === 'Rent' ? `${formatted}/mo` : formatted;
  };

  const getStatusColor = (status: 'Active' | 'Pending' | 'Sold') => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500 text-white';
      case 'Pending':
        return 'bg-amber-500 text-white';
      case 'Sold':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      id={`property-card-${property.id}`}
      className="bg-[#111111] rounded-xl overflow-hidden border border-[#1F1F1F] hover:border-[#D4AF37]/55 shadow-xs transition-all duration-300 flex flex-col h-full group"
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[#0A0A0A]">
        <img
          src={property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=85"}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Listing Type Tag (Rent vs Sale) */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#0A0A0A]/95 text-[#D4AF37] border border-[#D4AF37]/35 rounded-sm shadow-sm backdrop-blur-xs">
            For {property.listingType}
          </span>
        </div>

        {/* Status Tag */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm border border-white/10 ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="px-3.5 py-1.5 bg-[#0A0A0A]/90 text-[#D4AF37] text-lg font-serif font-bold rounded-sm backdrop-blur-xs shadow-md border border-[#1F1F1F]">
            {formatPrice(property.price, property.listingType)}
          </div>
        </div>

        {property.featured && (
          <div className="absolute bottom-4 right-4 z-10">
            <span className="px-2.5 py-1 text-[9px] font-serif font-bold uppercase tracking-widest bg-[#D4AF37] text-black rounded-sm shadow-sm">
              ★ Premium
            </span>
          </div>
        )}
      </div>

      {/* Property Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#888]">
            {property.propertyType}
          </span>
        </div>
        
        <h3 className="text-lg font-serif text-white italic group-hover:text-[#D4AF37] transition-colors duration-200 line-clamp-1 mb-2">
          {property.title}
        </h3>

        <div className="flex items-center text-[#888] text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 shrink-0 text-[#D4AF37]" />
          <span className="truncate">{property.address}, {property.city}, {property.state}</span>
        </div>

        <div className="mt-auto border-t border-[#1F1F1F] pt-4 flex items-center justify-between text-[#888] text-sm">
          <div className="flex items-center" title="Bedrooms">
            <BedDouble className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
            <span className="font-medium text-white">{property.bedrooms} <span className="text-[#555] text-xs">Beds</span></span>
          </div>
          
          <div className="flex items-center" title="Bathrooms">
            <Bath className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
            <span className="font-medium text-white">{property.bathrooms} <span className="text-[#555] text-xs">Baths</span></span>
          </div>

          <div className="flex items-center" title="Area SqFt">
            <Maximize2 className="w-4 h-4 mr-1.5 text-[#D4AF37]" />
            <span className="font-medium text-white">{property.areaSqFt.toLocaleString()} <span className="text-[#555] text-xs">sqft</span></span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(property)}
          id={`view-details-${property.id}`}
          className="mt-4 w-full py-2.5 bg-[#1A1A1A] text-[#D4AF37] text-xs font-bold uppercase tracking-widest rounded-sm border border-[#1F1F1F] hover:bg-[#D4AF37] hover:text-black transition-all duration-200 cursor-pointer text-center"
        >
          View Listing Details
        </button>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
