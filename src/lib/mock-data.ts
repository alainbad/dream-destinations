export const destinations = [
  { city: "Dubai", country: "UAE", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { city: "Paris", country: "France", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { city: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { city: "New York", country: "USA", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80" },
  { city: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { city: "Maldives", country: "Maldives", img: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80" },
  { city: "London", country: "UK", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80" },
  { city: "Barcelona", country: "Spain", img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80" },
];

export type Hotel = {
  id: string;
  name: string;
  location: string;
  stars: number;
  rating: number;
  ratingLabel: string;
  reviews: number;
  price: number;
  img: string;
  gallery: string[];
  amenities: string[];
  description: string;
};

export const hotels: Hotel[] = [
  {
    id: "burj-al-arab",
    name: "Burj Al Arab",
    location: "Dubai, UAE",
    stars: 5, rating: 9.6, ratingLabel: "Exceptional", reviews: 4821, price: 1850,
    img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    ],
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant"],
    description: "An icon of architectural opulence rising from the Arabian Gulf, Burj Al Arab redefines luxury hospitality with butler-attended suites and helipad arrivals.",
  },
  {
    id: "atlantis-palm",
    name: "Atlantis The Palm",
    location: "Dubai, UAE",
    stars: 5, rating: 9.2, ratingLabel: "Wonderful", reviews: 6230, price: 720,
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    ],
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant"],
    description: "An ocean-themed resort on the Palm Jumeirah crescent with Aquaventure water park, marine habitat and 23 culinary experiences.",
  },
  {
    id: "four-seasons-bali",
    name: "Four Seasons Bali at Sayan",
    location: "Ubud, Bali",
    stars: 5, rating: 9.8, ratingLabel: "Exceptional", reviews: 2103, price: 980,
    img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
      "https://images.unsplash.com/photo-1610530460358-dc7088d75049?w=800&q=80",
    ],
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    description: "Treehouse-style villas perched above the Ayung River, with rainforest views and a sacred valley wellness program.",
  },
  {
    id: "ritz-paris",
    name: "The Ritz Paris",
    location: "Paris, France",
    stars: 5, rating: 9.5, ratingLabel: "Exceptional", reviews: 1832, price: 1450,
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    ],
    amenities: ["WiFi", "Spa", "Gym", "Restaurant"],
    description: "Place Vendôme legend reborn — gilded salons, Hemingway Bar martinis and the Chanel suite where Coco lived for 34 years.",
  },
  {
    id: "peninsula-ny",
    name: "The Peninsula New York",
    location: "New York, USA",
    stars: 5, rating: 9.3, ratingLabel: "Wonderful", reviews: 2941, price: 1120,
    img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1600&q=80",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
    ],
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant"],
    description: "Beaux-Arts grandeur on Fifth Avenue with a rooftop terrace overlooking Central Park.",
  },
  {
    id: "anantara-veli",
    name: "Anantara Veli Maldives",
    location: "South Malé Atoll, Maldives",
    stars: 5, rating: 9.4, ratingLabel: "Exceptional", reviews: 1576, price: 890,
    img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    ],
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    description: "Adults-only overwater bungalows in the Indian Ocean with a glass-bottom spa and freediving school.",
  },
];

export const rooms = [
  { name: "Deluxe King Room", bed: "1 King Bed", guests: 2, size: "48m²", price: 720, img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80" },
  { name: "Executive Suite", bed: "1 King + Living Area", guests: 3, size: "75m²", price: 1240, img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80" },
  { name: "Royal Panoramic Suite", bed: "2 King Beds", guests: 4, size: "180m²", price: 2980, img: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80" },
];

