"use client";

import {
  Restaurant,
  barOptions,
  initialActivities,
  restaurantOptions,
} from "@/app/data/venues";
import { getCoordinates } from "@/app/utils/coordinatesCache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, GripVertical, MapPin, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import MapView from "./MapView";

const ItineraryBuilder = () => {
  const [activities, setActivities] = useState<Restaurant[]>(initialActivities);
  const [draggedItem, setDraggedItem] = useState<Restaurant | null>(null);
  const [travelDurations, setTravelDurations] = useState<
    Record<string, number>
  >({});

  // Calculate travel time function
  const calculateTravelTime = async (
    start: Restaurant,
    end: Restaurant
  ): Promise<number> => {
    try {
      const startCoords = await getCoordinates(start.placeId);
      const endCoords = await getCoordinates(end.placeId);

      const response = await fetch(
        `/api/distance?` +
          `origin=${startCoords.lat},${startCoords.lng}&` +
          `destination=${endCoords.lat},${endCoords.lng}`
      );

      const data = await response.json();
      // Return raw duration in seconds
      return data.duration;
    } catch (error) {
      console.error("Error calculating travel time:", error);
      return 900; // Default to 15 minutes (in seconds) if calculation fails
    }
  };

  useEffect(() => {
    const updateDurations = async () => {
      const durations: Record<string, number> = {};
      for (let i = 0; i < activities.length - 1; i++) {
        const key = `${activities[i].id}-${activities[i + 1].id}`;
        const duration = await calculateTravelTime(
          activities[i],
          activities[i + 1]
        );
        durations[key] = Math.ceil(duration / 60);
      }
      setTravelDurations(durations);
    };

    if (activities.length >= 2) {
      updateDurations();
    }
  }, [activities]);

  // Update event handlers with proper types
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    activity: Restaurant
  ) => {
    setDraggedItem(activity);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderTop = "2px solid pink";
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderTop = "none";
  };

  // Add the new handleActivityDrop function
  const handleActivityDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetActivity: Restaurant
  ) => {
    e.preventDefault();
    const venueData = e.dataTransfer.getData("venue");
    if (!venueData) return;

    try {
      const newVenue = JSON.parse(venueData) as Restaurant;
      const newActivities = activities.map((activity) =>
        activity.id === targetActivity.id
          ? { ...newVenue, id: activity.id }
          : activity
      );

      // Update times
      for (let index = 0; index < newActivities.length; index++) {
        const activity = newActivities[index];
        if (index === 0) {
          activity.time = "19:00";
        } else {
          const prevActivity = newActivities[index - 1];
          const prevTime = new Date(`2024-01-01 ${prevActivity.time}`);
          const travelTime = await calculateTravelTime(prevActivity, activity);
          prevTime.setMinutes(
            prevTime.getMinutes() +
              prevActivity.duration +
              Math.ceil(travelTime / 60)
          );
          activity.time = prevTime.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        }
      }

      setActivities(newActivities);
    } catch (error) {
      console.error("Error processing dropped venue:", error);
    }
  };

  // Update the existing handleDrop to use both functions
  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetActivity: Restaurant
  ) => {
    e.preventDefault();
    e.currentTarget.style.borderTop = "none";

    // First, try to handle venue drops
    const venueData = e.dataTransfer.getData("venue");
    if (venueData) {
      handleActivityDrop(e, targetActivity);
      return;
    }

    // If no venue data, handle reordering
    if (!draggedItem || draggedItem === targetActivity) return;

    const newActivities = [...activities];
    const draggedIndex = activities.findIndex(
      (item) => item.id === draggedItem.id
    );
    const targetIndex = activities.findIndex(
      (item) => item.id === targetActivity.id
    );

    newActivities.splice(draggedIndex, 1);
    newActivities.splice(targetIndex, 0, draggedItem);

    // Update times
    for (let index = 0; index < newActivities.length; index++) {
      const activity = newActivities[index];
      if (index === 0) {
        activity.time = "19:00";
      } else {
        const prevActivity = newActivities[index - 1];
        const prevTime = new Date(`2024-01-01 ${prevActivity.time}`);
        const travelTime = await calculateTravelTime(prevActivity, activity);
        prevTime.setMinutes(
          prevTime.getMinutes() +
            prevActivity.duration +
            Math.ceil(travelTime / 60)
        );
        activity.time = prevTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }
    }

    setActivities(newActivities);
  };

  const removeActivity = (id: number) => {
    setActivities(activities.filter((activity) => activity.id !== id));
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
                <MapView activities={activities} />
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id}>
                    {/* Show travel time from previous location if not first item */}
                    {index > 0 && (
                      <div className="flex items-center justify-center py-2 text-gray-500">
                        <div className="flex items-center space-x-2">
                          {/* Dotted line */}
                          <div className="border-l-2 border-dashed border-gray-300 h-8" />
                          {/* Travel time */}
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>
                              {travelDurations[
                                `${activities[index - 1].id}-${activity.id}`
                              ] || 0}{" "}
                              min travel
                            </span>
                          </div>
                          <div className="border-l-2 border-dashed border-gray-300 h-8" />
                        </div>
                      </div>
                    )}

                    {/* Existing activity card */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, activity)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e)}
                      onDragLeave={(e) => handleDragLeave(e)}
                      onDrop={(e) => handleDrop(e, activity)}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Drag Handle */}
                        <div className="flex items-center text-gray-400 cursor-move">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Activity content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">
                              {activity.name}
                            </h4>
                            <button
                              onClick={() => removeActivity(activity.id)}
                              className="p-1 hover:bg-gray-100 rounded text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Image
                              src={`/api/places/${activity.placeId}/photo?maxwidth=400`}
                              alt={activity.name}
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
                                <span>
                                  {activity.time} ({activity.duration} min)
                                </span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{activity.address}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <DollarSign className="w-4 h-4 mr-2" />
                                <span>{activity.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vibe Selector and Recommendations */}
        <div className="md:col-span-1">
          <VibeSelector />
        </div>
      </div>
    </div>
  );
};

// Move VibeSelector to a separate component
const VibeSelector = () => {
  const [selectedVibe, setSelectedVibe] = useState<string>("romantic");

  const vibes = [
    { name: "Romantic", color: "pink" },
    { name: "Modern", color: "slate" },
    { name: "Fun", color: "purple" },
    { name: "Aesthetic", color: "rose" },
    { name: "Cozy", color: "amber" },
  ];

  const filteredRestaurants = restaurantOptions.filter((restaurant) =>
    restaurant.vibes.includes(selectedVibe.toLowerCase())
  );

  const filteredBars = barOptions.filter((bar) =>
    bar.vibes.includes(selectedVibe.toLowerCase())
  );

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    venue: Restaurant
  ) => {
    e.dataTransfer.setData("venue", JSON.stringify(venue));
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
              ${
                selectedVibe === vibe.name.toLowerCase()
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
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-move"
            >
              <div className="flex gap-4">
                <Image
                  src={`/api/places/${restaurant.placeId}/photo?maxwidth=400`}
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
                  <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                  <p className="text-sm text-gray-500">{restaurant.address}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-600 mr-3">
                      {restaurant.price}
                    </span>
                    <span className="text-gray-600">
                      {restaurant.duration} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Similar card for bars */}
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
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-move"
            >
              <div className="flex gap-4">
                <Image
                  src={`/api/places/${bar.placeId}/photo?maxwidth=400`}
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
                  <p className="text-sm text-gray-600">{bar.cuisine}</p>
                  <p className="text-sm text-gray-500">{bar.address}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="text-gray-600 mr-3">{bar.price}</span>
                    <span className="text-gray-600">{bar.duration} min</span>
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
