"use client";

import { GoogleAddress } from "@/app/types/google";
import { getCoordinates } from "@/app/utils/coordinatesCache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Place, PlaceType } from "@prisma/client";
import { Clock, DollarSign, GripVertical, MapPin, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import MapView from "./MapView";

const ItineraryBuilder = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [draggedItem, setDraggedItem] = useState<Place | null>(null);
  const [travelDurations, setTravelDurations] = useState<Record<string, number>>({});

  // Load initial places (optional, you can start with an empty itinerary)
  useEffect(() => {
    const loadInitialPlaces = async () => {
      const response = await fetch(`/api/places?type=${PlaceType.restaurant}`);
      const restaurants = await response.json();
      // Take first restaurant as initial place (optional)
      if (restaurants.length > 0) {
        setPlaces([restaurants[0]]);
      }
    };
    loadInitialPlaces();
  }, []);

  // Add a new function to handle adding places to the itinerary
  const addPlaceToItinerary = (place: Place) => {
    setPlaces(currentPlaces => {
      // Check if place is already in itinerary
      if (currentPlaces.some(p => p.id === place.id)) {
        return currentPlaces; // Don't add duplicates
      }
      return [...currentPlaces, place];
    });
  };

  // Calculate travel time function
  const calculateTravelTime = async (start: Place, end: Place): Promise<number> => {
    try {
      const startCoords = await getCoordinates(start.place_id);
      const endCoords = await getCoordinates(end.place_id);

      const response = await fetch(
        `/api/distance?` +
        `origin=${startCoords.lat},${startCoords.lng}&` +
        `destination=${endCoords.lat},${endCoords.lng}`
      );

      const data = await response.json();
      return data.duration;
    } catch (error) {
      console.error("Error calculating travel time:", error);
      return 900; // Default to 15 minutes (in seconds) if calculation fails
    }
  };

  useEffect(() => {
    const updateDurations = async () => {
      const durations: Record<string, number> = {};
      for (let i = 0; i < places.length - 1; i++) {
        const key = `${places[i].id}-${places[i + 1].id}`;
        const duration = await calculateTravelTime(places[i], places[i + 1]);
        durations[key] = Math.ceil(duration / 60);
      }
      setTravelDurations(durations);
    };

    if (places.length >= 2) {
      updateDurations();
    }
  }, [places]);

  // Update event handlers with proper types
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, place: Place) => {
    setDraggedItem(place);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, position: 'before' | 'after') => {
    e.preventDefault();
    if (position === 'before') {
      e.currentTarget.style.borderTop = "2px solid pink";
    } else {
      e.currentTarget.style.borderBottom = "2px solid pink";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderTop = "none";
    e.currentTarget.style.borderBottom = "none";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPlace: Place, position: 'before' | 'after') => {
    e.preventDefault();
    e.currentTarget.style.borderTop = "none";
    e.currentTarget.style.borderBottom = "none";

    // First, try to handle venue drops from recommendations
    const placeData = e.dataTransfer.getData("place");
    if (placeData) {
      try {
        const newPlace = JSON.parse(placeData) as Place;
        // Don't add if already exists
        if (places.some(p => p.id === newPlace.id)) {
          return;
        }

        const targetIndex = places.findIndex(p => p.id === targetPlace.id);
        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;

        const newPlaces = [...places];
        newPlaces.splice(insertIndex, 0, newPlace);
        setPlaces(newPlaces);
      } catch (error) {
        console.error("Error processing dropped place:", error);
      }
      return;
    }

    // Handle reordering existing places
    if (!draggedItem || draggedItem.id === targetPlace.id) return;

    const newPlaces = [...places];
    const draggedIndex = places.findIndex(p => p.id === draggedItem.id);
    let targetIndex = places.findIndex(p => p.id === targetPlace.id);

    if (position === 'after') {
      targetIndex += 1;
    }

    newPlaces.splice(draggedIndex, 1);
    newPlaces.splice(targetIndex, 0, draggedItem);

    setPlaces(newPlaces);
  };

  const removePlace = (id: string) => {
    setPlaces(places.filter((place) => place.id !== id));
  };

  const priceToSymbol = (level: number | null): string => {
    return level ? "$".repeat(level) : "$$";
  };

  return (
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Itinerary Timeline */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Romantic Evening</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Map View */}
              <div className="mb-6">
                <MapView places={places} />
              </div>

              {/* Places List */}
              {places.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Add places to your itinerary from the recommendations
                </div>
              ) : (
                <div className="space-y-4">
                  {places.map((place, index) => (
                    <div key={place.id}>
                      {/* Drop zone before first item */}
                      {index === 0 && (
                        <div
                          className="h-8 flex items-center justify-center"
                          onDragOver={(e) => handleDragOver(e, 'before')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, place, 'before')}
                        >
                          <div className="w-full h-2 rounded hover:bg-gray-100" />
                        </div>
                      )}

                      {/* Show travel time from previous location */}
                      {index > 0 && (
                        <div className="flex items-center justify-center py-2 text-gray-500">
                          <div className="flex items-center space-x-2">
                            <div className="border-l-2 border-dashed border-gray-300 h-8" />
                            <div className="flex items-center space-x-1 text-sm">
                              <Clock className="w-3 h-3" />
                              <span>
                                {travelDurations[`${places[index - 1].id}-${place.id}`] || 0} min travel
                              </span>
                            </div>
                            <div className="border-l-2 border-dashed border-gray-300 h-8" />
                          </div>
                        </div>
                      )}

                      {/* Place card */}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, place)}
                        onDragEnd={handleDragEnd}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="flex items-center text-gray-400 cursor-move">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-lg">{place.name}</h4>
                              <button
                                onClick={() => removePlace(place.id)}
                                className="p-1 hover:bg-gray-100 rounded text-red-500"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <Image
                                src={`/api/places/${place.place_id}/photo?maxwidth=400`}
                                alt={place.name}
                                width={150}
                                height={150}
                                className="rounded object-cover w-[150px] h-[150px]"
                                priority={false}
                                loading="lazy"
                                unoptimized
                              />
                              <div className="space-y-2">
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>{place.type === 'restaurant' ? '90 min' : '60 min'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{(place.address as unknown as GoogleAddress).formatted_address}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-2" />
                                  <span>{priceToSymbol(place.price_level)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drop zone after each item */}
                      <div
                        className="h-8 flex items-center justify-center"
                        onDragOver={(e) => handleDragOver(e, 'after')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, place, 'after')}
                      >
                        <div className="w-full h-2 rounded hover:bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vibe Selector and Recommendations */}
        <div className="md:col-span-1">
          <VibeSelector onPlaceSelect={addPlaceToItinerary} />
        </div>
      </div>
    </div>
  );
};

// Update VibeSelector to handle place selection
const VibeSelector = ({ onPlaceSelect }: { onPlaceSelect: (place: Place) => void }) => {
  const [selectedVibe, setSelectedVibe] = useState<string>("romantic");
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
    { name: "Romantic", color: "pink" },
    { name: "Modern", color: "slate" },
    { name: "Fun", color: "purple" },
    { name: "Aesthetic", color: "rose" },
    { name: "Cozy", color: "amber" },
  ];

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.vibes.includes(selectedVibe.toLowerCase())
  );

  const filteredBars = bars.filter((bar) =>
    bar.vibes.includes(selectedVibe.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, place: Place) => {
    e.dataTransfer.setData("place", JSON.stringify(place));
  };

  const priceToSymbol = (level: number | null): string => {
    return level ? "$".repeat(level) : "$$";
  };

  return (
    <div className="space-y-6">
      {/* Vibe Selector Bubbles */}
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

      {/* Recommendations */}
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

export { ItineraryBuilder };
