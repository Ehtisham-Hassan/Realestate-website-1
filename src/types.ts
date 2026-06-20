export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  imageUrl: string;
  propertyType: 'House' | 'Apartment' | 'Condo' | 'Townhouse' | 'Land';
  listingType: 'Sale' | 'Rent';
  status: 'Active' | 'Pending' | 'Sold';
  yearBuilt: number;
  features: string[];
  featured: boolean;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  message: string;
  status: 'New' | 'Contacted' | 'Archived';
  createdAt: string;
}

export interface AdminStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalValue: number;
  totalInquiries: number;
  newInquiries: number;
}
