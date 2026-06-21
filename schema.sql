-- Run these commands in your Neon DB SQL Editor to set up the tables.

CREATE TABLE listings (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  bedrooms DECIMAL(4, 1) NOT NULL,
  bathrooms DECIMAL(4, 1) NOT NULL,
  area_sq_ft INTEGER NOT NULL,
  image_url TEXT,
  property_type VARCHAR(50) NOT NULL,
  listing_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  year_built INTEGER,
  features TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inquiries (
  id VARCHAR(50) PRIMARY KEY,
  property_id VARCHAR(50) NOT NULL,
  property_title VARCHAR(255) NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  client_email VARCHAR(150) NOT NULL,
  client_phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default mock data for the portfolio
INSERT INTO listings (id, title, description, price, address, city, state, bedrooms, bathrooms, area_sq_ft, image_url, property_type, listing_type, status, year_built, features, featured) VALUES
('lst-1', 'Sleek Contemporary Villa', 'This architectural masterpiece showcases flawless modern design, boasting an expansive open-concept floor plan, double-height ceilings, and premium floor-to-ceiling glass walls that frame panoramic canyon views. Ideal for entertaining and luxury living.', 3450000, '8842 Sunset Crest Dr', 'Beverly Hills', 'CA', 5, 6, 5800, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', 'House', 'Sale', 'Active', 2022, ARRAY['Pool', 'Wine Cellar', 'Smarthome System', '3-Car Garage', 'Home Theater'], true),
('lst-2', 'Oceanfront Sunset Paradise', 'Located on Malibu''s ultra-exclusive shoreline, this oceanfront cottage offers unobstructed views of the Pacific Ocean. Complete with massive wrapping decks, private beach access, a state-of-the-art chef''s kitchen, and luxurious master quarters.', 5200000, '22814 Pacific Coast Hwy', 'Malibu', 'CA', 3, 3.5, 3400, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'House', 'Sale', 'Active', 2019, ARRAY['Ocean View', 'Private Beach Access', 'Spacious Deck', 'Chef''s Kitchen', 'Hot Tub'], true),
('lst-3', 'Sophisticated Midtown Penthouse', 'Soaring high above the sparkling city lights, this stunning high-floor penthouse represents urban luxury at its finest. Features bespoke white oak floors, automated custom gallery lighting, sub-zero appliances, and an expansive private terrace.', 1850000, '412 Park Ave, Apt 18B', 'New York', 'NY', 2, 2, 1850, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'Apartment', 'Sale', 'Active', 2015, ARRAY['City Skyline View', '24/7 Doorman', 'Private Terrace', 'Gym Access', 'Storage Space'], true),
('lst-4', 'Chic Minimalist Townhouse', 'Nestled in Seattle''s highly-sought historic Capitol Hill district, this beautiful multi-level townhouse features passive-house certifications, radiant hydronic floor heating, an intimate private garden, and a fully solar-equipped rooftop deck.', 980000, '1410 E Harrison St', 'Seattle', 'WA', 3, 2.5, 2100, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', 'Townhouse', 'Sale', 'Active', 2021, ARRAY['Rooftop Deck', 'Solar Panels', 'Private Garden', 'Heated Floors', 'EV Charger'], false),
('lst-5', 'Luxury Condo with Water Views', 'Indulge in resort-style lifestyle in this breezy waterfront condominium. Offering a beautifully open galley kitchen, top-tier Bosch appliances, expansive views of the marina, and 24-hour luxury concierge and security services.', 4200, '800 Brickell Ave, Apt 304', 'Miami', 'FL', 1, 1.5, 1100, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', 'Condo', 'Rent', 'Active', 2018, ARRAY['Marina View', 'Concierge Service', 'Pool & Spa', 'Fitness Center', 'Valet Parking'], false);

INSERT INTO inquiries (id, property_id, property_title, client_name, client_email, client_phone, message, status) VALUES
('inq-1', 'lst-1', 'Sleek Contemporary Villa', 'Eleanor Vance', 'eleanor.v@example.com', '+1 (310) 555-0198', 'Hello, I am extremely interested in this estate. Can we schedule a private showing for next Tuesday?', 'New'),
('inq-2', 'lst-3', 'Sophisticated Midtown Penthouse', 'David Harris', 'david.harris@example.com', '+1 (212) 555-0322', 'Does the penthouses HOA covers gas, water, and building amenities? Also, does the unit come with the custom artwork?', 'Contacted');
