import type { Product } from './supabase';

export const FALLBACK_PRODUCTS: Omit<Product, 'created_at'>[] = [
  {
    "id": "1",
    "name": "LEGO Technic Mercedes-AMG F1 W14 E Performance 42171",
    "price": 99,
    "original_price": 18499,
    "rating": 4.9,
    "review_count": 8420,
    "description": "Get ready for the ultimate racing experience! Build the highly detailed 1:8 scale LEGO Technic Mercedes-AMG F1 W14 E Performance.",
    "images": [
      "/images/products/1_1.jpeg",
      "/images/products/1_2.jpeg",
      "/images/products/1_3.jpeg",
      "/images/products/1_4.jpeg"
    ],
    "highlights": { "Material": "ABS Plastic", "Age": "18+ years", "Pieces": "1642", "Theme": "Motorsport" },
    "badge": "Premium",
    "image_url": "/images/products/1_1.jpeg"
  },
  {
    "id": "2",
    "name": "Wembley Rechargeable Remote Control Rock Crawler 2.4 GHz 4WD",
    "price": 99,
    "original_price": 1999,
    "rating": 4.5,
    "review_count": 1284,
    "description": "High-powered 4WD rock crawler built for off-road dominance. Features dual motors and heavy-duty suspension.",
    "images": [
      "/images/products/2_1.jpeg",
      "/images/products/2_2.jpeg",
      "/images/products/2_3.jpeg",
      "/images/products/2_4.jpeg"
    ],
    "highlights": { "Top Speed": "30 km/h", "Scale": "1/16", "Drivetrain": "4WD", "Type": "Rock Crawler" },
    "badge": "Bestseller",
    "image_url": "/images/products/2_1.jpeg"
  },
  {
    "id": "3",
    "name": "Expleasia 360 Degree Rotating Stunt Car with Flashing Lights",
    "price": 99,
    "original_price": 1499,
    "rating": 4.6,
    "review_count": 3410,
    "description": "Amazing 360-degree rotating stunt car with flashing LED lights. Double-sided driving makes it roll forward no matter what.",
    "images": [
      "/images/products/3_1.jpeg",
      "/images/products/3_2.jpeg",
      "/images/products/3_3.jpeg",
      "/images/products/3_4.jpeg"
    ],
    "highlights": { "Battery": "Rechargeable", "Function": "360° Stunts", "Lights": "LED Intersect", "Type": "Stunt Car" },
    "badge": "Assured",
    "image_url": "/images/products/3_1.jpeg"
  },
  {
    "id": "4",
    "name": "Centy Toys Realistic Pull Back Innova Crysta Taxi",
    "price": 99,
    "original_price": 350,
    "rating": 4.4,
    "review_count": 5122,
    "description": "Highly detailed pull-back action model of the iconic Innova Crysta Taxi. Features opening doors and realistic detailing.",
    "images": [
      "/images/products/4_1.jpeg",
      "/images/products/4_2.jpeg",
      "/images/products/4_3.jpeg",
      "/images/products/4_4.jpeg"
    ],
    "highlights": { "Type": "Pull Back", "Material": "Plastic", "Doors": "Openable front", "Safety": "Non-Toxic" },
    "badge": "Most Wished",
    "image_url": "/images/products/4_1.jpeg"
  },
  {
    "id": "5",
    "name": "Hot Wheels Colossal Crash Track Set with Dual Loop",
    "price": 99,
    "original_price": 6490,
    "rating": 4.8,
    "review_count": 2100,
    "description": "The biggest Hot Wheels track set ever made! At over 5 feet wide, the Colossal Crash is the ultimate showstopper.",
    "images": [
      "/images/products/5_1.jpeg",
      "/images/products/5_2.jpeg",
      "/images/products/5_3.jpeg",
      "/images/products/5_4.jpeg"
    ],
    "highlights": { "Width": "Over 5 Feet", "Batteries": "Required", "Age": "5+ years", "Type": "Track Set" },
    "badge": "Premium",
    "image_url": "/images/products/5_1.jpeg"
  },
  {
    "id": "6",
    "name": "LEGO Marvel Avengers Tower (76269) Collector's Edition",
    "price": 99,
    "original_price": 50999,
    "rating": 4.9,
    "review_count": 1205,
    "description": "Recreate the iconic building in the Avengers Universe. This monumental build-and-display project is packed with memorable scenes.",
    "images": [
      "/images/products/6_1.jpeg",
      "/images/products/6_2.jpeg",
      "/images/products/6_3.jpeg",
      "/images/products/6_4.jpeg"
    ],
    "highlights": { "Material": "ABS Plastic", "Pieces": "5201", "Tags": "Marvel universe", "Type": "Collector" },
    "badge": "Assured",
    "image_url": "/images/products/6_1.jpeg"
  },
  {
    "id": "7",
    "name": "Toyshine Premium Wooden Chess Board Game Set",
    "price": 99,
    "original_price": 799,
    "rating": 4.5,
    "review_count": 890,
    "description": "Premium handcrafted wooden chess set with magnetic pieces. Perfect educational board game for strategy building.",
    "images": [
      "/images/products/7_1.jpeg",
      "/images/products/7_2.jpeg",
      "/images/products/7_3.jpeg",
      "/images/products/7_4.jpeg"
    ],
    "highlights": { "Material": "Wood", "Type": "Magnetic", "Box": "Folding storage", "Age": "8+ years" },
    "badge": "Top Rated",
    "image_url": "/images/products/7_1.jpeg"
  },
  {
    "id": "8",
    "name": "WISHKEY Transformer Robot Car with Remote Control",
    "price": 99,
    "original_price": 1299,
    "rating": 4.6,
    "review_count": 1560,
    "description": "Awesome 2-in-1 action figures model that transforms directly into a sports car via remote control. Features cool LED headlights.",
    "images": [
      "/images/products/8_1.jpeg",
      "/images/products/8_2.jpeg",
      "/images/products/8_3.jpeg",
      "/images/products/8_4.jpeg"
    ],
    "highlights": { "Function": "Transforms", "Control": "2.4GHz Auto", "Type": "Robot Car", "Battery": "Rechargeable" },
    "badge": "Assured",
    "image_url": "/images/products/8_1.jpeg"
  }
];
