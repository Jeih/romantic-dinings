"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, GripVertical, MapPin, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Restaurant,
  initialActivities,
  restaurantOptions,
  barOptions,
} from "@/app/data/venues";
import MapView from "./MapView";

const ItineraryBuilder = () => {
  const [activities, setActivities] = useState<Restaurant[]>(initialActivities);

  const [draggedItem, setDraggedItem] = useState<Restaurant | null>(null);
  const [travelTimes, setTravelTimes] = useState<Record<string, number>>({});

  // Fix the calculateTravelTime function with proper types
  const calculateTravelTime = (start: Restaurant, end: Restaurant): number => {
    const distance = Math.sqrt(
      Math.pow(end.coordinates.lat - start.coordinates.lat, 2) +
        Math.pow(end.coordinates.lng - start.coordinates.lng, 2)
    );
    return Math.round(distance * 1000);
  };

  useEffect(() => {
    // Fix the type for times object
    const times: Record<string, number> = {};
    for (let i = 0; i < activities.length - 1; i++) {
      const key = `${activities[i].id}-${activities[i + 1].id}`;
      times[key] = calculateTravelTime(activities[i], activities[i + 1]);
    }
    setTravelTimes(times);
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
  const handleActivityDrop = (
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
      newActivities.forEach((activity, index) => {
        if (index === 0) {
          activity.time = "19:00";
        } else {
          const prevActivity = newActivities[index - 1];
          const prevTime = new Date(`2024-01-01 ${prevActivity.time}`);
          const travelTime = calculateTravelTime(prevActivity, activity);
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
      });

      setActivities(newActivities);
    } catch (error) {
      console.error("Error processing dropped venue:", error);
    }
  };

  // Update the existing handleDrop to use both functions
  const handleDrop = (
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
    newActivities.forEach((activity, index) => {
      if (index === 0) {
        activity.time = "19:00";
      } else {
        const prevActivity = newActivities[index - 1];
        const prevTime = new Date(`2024-01-01 ${prevActivity.time}`);
        const travelTime = calculateTravelTime(prevActivity, activity);
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
    });

    setActivities(newActivities);
  };

  // Add the missing removeActivity function
  const removeActivity = (id: number) => {
    setActivities(activities.filter((activity) => activity.id !== id));
  };

  // Add the VibeSelector component inside the ItineraryBuilder
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

        {/* Restaurant Recommendations */}
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
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">
                      {restaurant.cuisine}
                    </p>
                    <p className="text-sm text-gray-500">
                      {restaurant.address}
                    </p>
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

        {/* Bar Recommendations */}
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
                    src={bar.imageUrl}
                    alt={bar.name}
                    width={100}
                    height={100}
                    className="rounded object-cover"
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map and Itinerary Timeline */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Date Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView activities={activities} />
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="relative flex items-start p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, activity)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, activity)}
                  >
                    {/* Timeline connector */}
                    {index < activities.length - 1 && (
                      <div className="absolute left-8 top-full w-0.5 h-8 bg-pink-200 flex items-center justify-center">
                        <span className="bg-white px-2 text-xs text-gray-500">
                          {Math.ceil(
                            travelTimes[
                              `${activity.id}-${activities[index + 1].id}`
                            ] / 60
                          )}{" "}
                          min
                        </span>
                      </div>
                    )}

                    {/* Drag Handle */}
                    <div className="mr-4 flex items-center text-gray-400">
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
                          src={activity.imageUrl}
                          alt={activity.name}
                          width={200}
                          height={100}
                          className="w-full h-24 object-cover rounded"
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

export { ItineraryBuilder as ItineraryBuilder };
