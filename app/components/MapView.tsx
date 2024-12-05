import { getCoordinates } from "@/app/utils/coordinatesCache";
import { LoadScript } from "@react-google-maps/api";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Restaurant } from "../data/venues";

// Add custom map style
const mapStyles = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6c6c6c" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 4 }],
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#f8f8f8" }, { lightness: 20 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#f8f8f8" }, { lightness: 17 }, { weight: 1.2 }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f8f8f8" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#f1f1f1" }],
  },
];

// Add interface for Map component props
interface MapProps {
  activities: Restaurant[];
  mapContainerStyle: {
    width: string;
    height: string;
    borderRadius: string;
  };
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions;
}

const Map = dynamic(
  () =>
    import("@react-google-maps/api").then((mod) => {
      const { GoogleMap, Marker, DirectionsRenderer } = mod;
      return function Map({
        activities,
        mapContainerStyle,
        center,
        options,
      }: MapProps) {
        const [directions, setDirections] =
          useState<google.maps.DirectionsResult | null>(null);
        const [coordinates, setCoordinates] = useState<
          Record<string, google.maps.LatLngLiteral>
        >({});

        // Fetch coordinates for all activities
        useEffect(() => {
          const fetchAllCoordinates = async () => {
            const coords: Record<string, google.maps.LatLngLiteral> = {};
            await Promise.all(
              activities.map(async (activity) => {
                coords[activity.placeId] = await getCoordinates(
                  activity.placeId
                );
              })
            );
            setCoordinates(coords);
          };

          fetchAllCoordinates();
        }, [activities]);

        // Update directions when coordinates are available
        useEffect(() => {
          if (
            activities.length >= 2 &&
            Object.keys(coordinates).length === activities.length
          ) {
            const service = new google.maps.DirectionsService();
            service.route(
              {
                origin: coordinates[activities[0].placeId],
                destination:
                  coordinates[activities[activities.length - 1].placeId],
                waypoints: activities.slice(1, -1).map((activity) => ({
                  location: coordinates[activity.placeId],
                  stopover: true,
                })),
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (
                result: google.maps.DirectionsResult | null,
                status: google.maps.DirectionsStatus
              ) => {
                if (status === "OK" && result) {
                  setDirections(result);
                }
              }
            );
          } else {
            setDirections(null);
          }
        }, [activities, coordinates]);

        // Only render markers when we have coordinates
        return (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={coordinates[activities[0]?.placeId] || center}
            options={options}
          >
            {directions && (
              <DirectionsRenderer
                options={{
                  directions: directions,
                  suppressMarkers: true,
                }}
              />
            )}

            {activities.map((activity, index) =>
              coordinates[activity.placeId] ? (
                <Marker
                  key={activity.id}
                  position={coordinates[activity.placeId]}
                  icon={{
                    path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                    fillColor: "#FF1493",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF",
                    scale: 0.5,
                    labelOrigin: new google.maps.Point(0, 0),
                  }}
                  label={{
                    text: (index + 1).toString(),
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                />
              ) : null
            )}
          </GoogleMap>
        );
      };
    }),
  { ssr: false }
);

const MapView = ({ activities }: { activities: Restaurant[] }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [defaultCenter, setDefaultCenter] = useState<google.maps.LatLngLiteral>(
    {
      lat: 40.4406,
      lng: -79.9959,
    }
  );

  useEffect(() => {
    const fetchInitialCenter = async () => {
      if (activities[0]) {
        const coords = await getCoordinates(activities[0].placeId);
        setDefaultCenter(coords);
      }
    };
    fetchInitialCenter();
  }, [activities]);

  const mapContainerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.5rem",
  };

  const mapOptions = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    backgroundColor: "#f8f8f8",
  };

  return (
    <>
      {!isLoaded && (
        <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading map...</span>
        </div>
      )}
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
        onLoad={() => setIsLoaded(true)}
      >
        <Map
          activities={activities}
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          options={mapOptions}
        />
      </LoadScript>
    </>
  );
};

export default MapView;
