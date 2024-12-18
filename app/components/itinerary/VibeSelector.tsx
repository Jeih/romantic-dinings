import { GoogleAddress } from "@/app/types/google";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Place, PlaceType } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PlaceSearch } from "./PlaceSearch";

interface VibeSelectorProps {
  onPlaceSelect: (place: Place) => void;
}

export const VibeSelector = ({ onPlaceSelect }: VibeSelectorProps) => {
  const [selectedVibe, setSelectedVibe] = useState<string>("lively");
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [bars, setBars] = useState<Place[]>([]);

  useEffect(() => {
    const fetchPlaces = async () => {
      const [restaurantResponse, barResponse] = await Promise.all([
        fetch(`/api/places?type=${PlaceType.restaurant}`),
        fetch(`/api/places?type=${PlaceType.bar}`)
      ]);

      const [fetchedRestaurants, fetchedBars] = await Promise.all([
        restaurantResponse.json(),
        barResponse.json()
      ]);

      setRestaurants(fetchedRestaurants);
      setBars(fetchedBars);
    };
    fetchPlaces();
  }, []);

  const vibes = [
    { name: "Lively", color: "purple" },
    { name: "Chill", color: "blue" },
    { name: "Intimate", color: "pink" },
    { name: "Elegant", color: "slate" },
    { name: "Trendy", color: "rose" },
    { name: "Uncategorized", color: "gray" },
  ];

  const getFilteredPlaces = (places: Place[], vibe: string) => {
    if (vibe === "uncategorized") {
      const uncategorized = places.filter(place => place.vibes.length === 0);
      return shuffleArray(uncategorized).slice(0, 5);
    }

    const filtered = places.filter(place =>
      place.vibes.includes(vibe.toLowerCase())
    );
    return shuffleArray(filtered).slice(0, 5);
  };

  const shuffleArray = <T,> (array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const filteredRestaurants = getFilteredPlaces(restaurants, selectedVibe);
  const filteredBars = getFilteredPlaces(bars, selectedVibe);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, place: Place) => {
    e.dataTransfer.setData("place", JSON.stringify(place));
  };

  const priceToSymbol = (level: number | null): string => {
    return level ? "$".repeat(level) : "$$";
  };

  return (
    <div className="space-y-6">
      <PlaceSearch onPlaceSelect={onPlaceSelect} />

      <div className="flex flex-wrap gap-2">
        {vibes.map((vibe) => (
          <button
            key={vibe.name}
            onClick={() => setSelectedVibe(vibe.name.toLowerCase())}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${selectedVibe === vibe.name.toLowerCase()
                ? `bg-${vibe.color}-500 text-white`
                : `bg-${vibe.color}-100 text-${vibe.color}-700 hover:bg-${vibe.color}-200`
              }`}
          >
            {vibe.name}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Restaurants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              draggable
              onDragStart={(e) => handleDragStart(e, restaurant)}
              onClick={() => onPlaceSelect(restaurant)}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex gap-4">
                <Image
                  src={`/api/places/${restaurant.place_id}/photo?maxwidth=400`}
                  alt={restaurant.name}
                  width={150}
                  height={150}
                  className="rounded object-cover w-[150px] h-[150px]"
                  priority={false}
                  loading="lazy"
                  unoptimized
                />
                <div>
                  <h3 className="font-semibold">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.cuisine[0]}</p>
                  <p className="text-sm text-gray-500">
                    {(restaurant.address as unknown as GoogleAddress).formatted_address}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-600 mr-3">
                      {priceToSymbol(restaurant.price_level)}
                    </span>
                    <span className="text-gray-600">90 min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Bars</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredBars.map((bar) => (
            <div
              key={bar.id}
              draggable
              onDragStart={(e) => handleDragStart(e, bar)}
              onClick={() => onPlaceSelect(bar)}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex gap-4">
                <Image
                  src={`/api/places/${bar.place_id}/photo?maxwidth=400`}
                  alt={bar.name}
                  width={150}
                  height={150}
                  className="rounded object-cover w-[150px] h-[150px]"
                  priority={false}
                  loading="lazy"
                  unoptimized
                />
                <div>
                  <h3 className="font-semibold">{bar.name}</h3>
                  <p className="text-sm text-gray-600">{bar.cuisine[0]}</p>
                  <p className="text-sm text-gray-500">
                    {(bar.address as unknown as GoogleAddress).formatted_address}
                  </p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-600 mr-3">{priceToSymbol(bar.price_level)}</span>
                    <span className="text-gray-600">60 min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};