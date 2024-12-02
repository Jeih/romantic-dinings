// Define types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: number;
  name: string;
  type: "restaurant" | "bar";
  vibes: string[];
  time: string;
  duration: number;
  price: string;
  address: string;
  imageUrl: string;
  coordinates: Coordinates;
  cuisine: string;
}

// Sample restaurant data
export const restaurantOptions: Restaurant[] = [
  {
    id: 101,
    name: "La Belle Rose",
    type: "restaurant",
    vibes: ["romantic", "aesthetic"],
    time: "19:00",
    duration: 90,
    price: "$$$",
    address: "567 Love Avenue",
    imageUrl: "/api/placeholder/200/100",
    coordinates: { lat: 40.7138, lng: -74.0050 },
    cuisine: "French"
  },
  {
    id: 102,
    name: "Tokyo Modern",
    type: "restaurant",
    vibes: ["modern", "aesthetic"],
    time: "19:00",
    duration: 90,
    price: "$$",
    address: "890 Style Street",
    imageUrl: "/api/placeholder/200/100",
    coordinates: { lat: 40.7148, lng: -74.0040 },
    cuisine: "Japanese Fusion"
  },
];

// Sample bar data
export const barOptions: Restaurant[] = [
  {
    id: 201,
    name: "Cloud Nine Lounge",
    type: "bar",
    vibes: ["romantic", "aesthetic"],
    time: "21:00",
    duration: 60,
    price: "$$$",
    address: "123 Sky Lane",
    imageUrl: "/api/placeholder/200/100",
    coordinates: { lat: 40.7158, lng: -74.0030 },
    cuisine: "Cocktail Bar"
  },
];

// Initial activities for the itinerary
export const initialActivities: Restaurant[] = [
  {
    id: 1,
    type: "restaurant",
    name: "Moonlight Bistro",
    time: "19:00",
    duration: 90,
    price: "$$",
    address: "123 Romance Street",
    imageUrl: "/api/placeholder/200/100",
    coordinates: { lat: 40.7128, lng: -74.006 },
    vibes: ["romantic", "romantic"],
    cuisine: "Italian",
  },
  {
    id: 2,
    type: "bar",
    name: "Starlight Rooftop Bar",
    time: "20:45",
    duration: 60,
    price: "$$$",
    address: "456 Love Lane",
    imageUrl: "/api/placeholder/200/100",
    coordinates: { lat: 40.7168, lng: -74.0077 },
    vibes: ["romantic", "romantic"],
    cuisine: "Italian",
  },
];
