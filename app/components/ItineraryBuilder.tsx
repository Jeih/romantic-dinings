"use client";

import { GoogleAddress } from '@/app/types/google';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Place } from "@prisma/client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import MapView from "./MapView";
import { PlaceCard } from "./itinerary/PlaceCard";
import { VibeSelector } from "./itinerary/VibeSelector";

const ItineraryBuilder = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [draggedItem, setDraggedItem] = useState<Place | null>(null);
  const [travelDurations, setTravelDurations] = useState<Record<string, number>>({});

  // Load initial places (optional, you can start with an empty itinerary)
  useEffect(() => {
    const loadInitialPlaces = async () => {
      const response = await fetch(`/api/places/rest_101`);
      const restaurant = await response.json();
      if (restaurant && !restaurant.error) {
        setPlaces([restaurant]);
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
      const startCoords = (start.address as unknown as GoogleAddress).geometry!.location;
      const endCoords = (end.address as unknown as GoogleAddress).geometry!.location;

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
                      <PlaceCard
                        place={place}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onRemove={removePlace}
                      />

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

export { ItineraryBuilder };
