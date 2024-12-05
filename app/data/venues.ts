// Define types
export interface Restaurant {
  id: number;
  name: string;
  type: "restaurant" | "bar";
  vibes: string[];
  time: string;
  duration: number;
  price: string;
  address: string;
  cuisine: string;
  placeId: string;
}

// Sample restaurant data
export const restaurantOptions: Restaurant[] = [
  {
    id: 101,
    name: "Casbah",
    type: "restaurant",
    vibes: ["romantic", "cozy"],
    time: "19:00",
    duration: 90,
    price: "$$$",
    address: "229 S Highland Ave, Pittsburgh, PA 15206",
    cuisine: "Mediterranean",
    placeId: "ChIJnetrqnTyNIgR7bt3L49RUTM"
  },
  {
    id: 102,
    name: "Monterey Bay Fish Grotto",
    type: "restaurant",
    vibes: ["romantic", "aesthetic"],
    time: "19:00",
    duration: 90,
    price: "$$$$",
    address: "1411 Grandview Ave, Pittsburgh, PA 15211",
    cuisine: "Seafood",
    placeId: "ChIJPz5dmKX2NIgRgcESndEXxLQ"
  },
  {
    id: 103,
    name: "Le Mont Restaurant",
    type: "restaurant",
    vibes: ["romantic", "aesthetic"],
    time: "19:00",
    duration: 90,
    price: "$$$$",
    address: "1114 Grandview Ave, Pittsburgh, PA 15211",
    cuisine: "French",
    placeId: "ChIJ06OQr6_2NIgRICqUO8vUW2s"
  },
  {
    id: 104,
    name: "Eleven",
    type: "restaurant",
    vibes: ["modern", "romantic"],
    time: "19:00",
    duration: 90,
    price: "$$$$",
    address: "1150 Smallman St, Pittsburgh, PA 15222",
    cuisine: "Contemporary American",
    placeId: "ChIJWc78NOLzNIgRcQKCaa4pSCU"
  },
  {
    id: 105,
    name: "Barcelona Wine Bar",
    type: "restaurant",
    vibes: ["fun", "modern"],
    time: "19:00",
    duration: 90,
    price: "$$$",
    address: "922 Penn Ave, Pittsburgh, PA 15222",
    cuisine: "Spanish Tapas",
    placeId: "ChIJa8m_owvxNIgRjqA4JlAe_Yg"
  }
];

// Sample bar data
export const barOptions: Restaurant[] = [
  {
    id: 201,
    name: "The Urban Tap - Shadyside",
    type: "bar",
    vibes: ["modern", "fun"],
    time: "21:00",
    duration: 60,
    price: "$$",
    address: "5500 Walnut St, Pittsburgh, PA 15232",
    cuisine: "Gastropub",
    placeId: "ChIJf8-9UXPyNIgR0MoGEhLB1VY"
  },
  {
    id: 202,
    name: "Whiskey B's",
    type: "bar",
    vibes: ["cozy", "romantic"],
    time: "21:00",
    duration: 60,
    price: "$$",
    address: "5752 Ellsworth Ave, Pittsburgh, PA 15232",
    cuisine: "Whiskey Bar",
    placeId: "ChIJrRaTrsnxNIgR9e4fo-RKDC4"
  },
  {
    id: 203,
    name: "Bridges & Bourbon",
    type: "bar",
    vibes: ["modern", "aesthetic"],
    time: "21:00",
    duration: 60,
    price: "$$$",
    address: "930 Penn Ave, Pittsburgh, PA 15222",
    cuisine: "Craft Cocktails",
    placeId: "ChIJueESRrnxNIgR4DeLRiwdNwo"
  },
  {
    id: 204,
    name: "Bonfire Food and Drink",
    type: "bar",
    vibes: ["cozy", "modern"],
    time: "21:00",
    duration: 60,
    price: "$$",
    address: "2100 E Carson St, Pittsburgh, PA 15203",
    cuisine: "Craft Cocktails",
    placeId: "ChIJZzOOvrDxNIgRg3CDDJJaEco"
  },
  {
    id: 205,
    name: "Hofbrauhaus Pittsburgh",
    type: "bar",
    vibes: ["fun", "aesthetic"],
    time: "21:00",
    duration: 90,
    price: "$$",
    address: "2705 S Water St, Pittsburgh, PA 15203",
    cuisine: "German Beer Hall",
    placeId: "ChIJEfe6zHfxNIgRGR0MD0pIGHU"
  }
];

// Initial activities for the itinerary
export const initialActivities: Restaurant[] = [
  {
    id: 101,
    name: "Casbah",
    type: "restaurant",
    vibes: ["romantic", "cozy"],
    time: "19:00",
    duration: 90,
    price: "$$$",
    address: "229 S Highland Ave, Pittsburgh, PA 15206",
    cuisine: "Mediterranean",
    placeId: "ChIJnetrqnTyNIgR7bt3L49RUTM"
  },
  {
    id: 203,
    name: "Bridges & Bourbon",
    type: "bar",
    vibes: ["modern", "aesthetic"],
    time: "20:45",
    duration: 60,
    price: "$$$",
    address: "930 Penn Ave, Pittsburgh, PA 15222",
    cuisine: "Craft Cocktails",
    placeId: "ChIJueESRrnxNIgR4DeLRiwdNwo"
  }
];
