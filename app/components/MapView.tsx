import { LoadScript } from "@react-google-maps/api";
import dynamic from "next/dynamic";
import { useState } from "react";
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
  center: {
    lat: number;
    lng: number;
  };
  options: google.maps.MapOptions;
}

// Update the Map component with proper typing
const Map = dynamic(
  () =>
    import("@react-google-maps/api").then((mod) => {
      const { GoogleMap, Marker, Polyline } = mod;
      return function Map({
        activities,
        mapContainerStyle,
        center,
        options,
      }: MapProps) {
        return (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={center}
            options={options}
          >
            {activities.map((activity, index) => (
              <Marker
                key={activity.id}
                position={activity.coordinates}
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
            ))}

            <Polyline
              path={activities.map((a) => ({
                lat: a.coordinates.lat,
                lng: a.coordinates.lng,
              }))}
              options={{
                strokeColor: "#FF1493",
                strokeOpacity: 0.6,
                strokeWeight: 3,
                geodesic: true,
              }}
            />
          </GoogleMap>
        );
      };
    }),
  { ssr: false }
);

const MapView = ({ activities }: { activities: Restaurant[] }) => {
  const [isLoaded, setIsLoaded] = useState(false);

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

  const center = activities[0]?.coordinates || {
    lat: 40.7128,
    lng: -74.006,
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
          center={center}
          options={mapOptions}
        />
      </LoadScript>
    </>
  );
};

export default MapView;
