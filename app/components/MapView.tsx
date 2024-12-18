import { env } from '@/app/config/env';
import { getCoordinates } from "@/app/utils/coordinatesCache";
import { Place } from '@prisma/client';
import { LoadScript } from "@react-google-maps/api";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

interface MapProps {
  places: Place[];
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
      return function Map ({
        places,
        mapContainerStyle,
        center,
        options,
      }: MapProps) {
        const [directions, setDirections] =
          useState<google.maps.DirectionsResult | null>(null);
        const [coordinates, setCoordinates] = useState<
          Record<string, google.maps.LatLngLiteral>
        >({});

        // Fetch coordinates for all places
        useEffect(() => {
          const fetchAllCoordinates = async () => {
            const coords: Record<string, google.maps.LatLngLiteral> = {};
            await Promise.all(
              places.map(async (place) => {
                coords[place.place_id] = await getCoordinates(
                  place.place_id
                );
              })
            );
            setCoordinates(coords);
          };

          fetchAllCoordinates();
        }, [places]);

        // Update directions when coordinates are available
        useEffect(() => {
          if (
            places.length >= 2 &&
            Object.keys(coordinates).length === places.length
          ) {
            const service = new google.maps.DirectionsService();
            service.route(
              {
                origin: coordinates[places[0].place_id],
                destination:
                  coordinates[places[places.length - 1].place_id],
                waypoints: places.slice(1, -1).map((place) => ({
                  location: coordinates[place.place_id],
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
        }, [places, coordinates]);

        // Only render markers when we have coordinates
        return (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={13}
            center={coordinates[places[0]?.place_id] || center}
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

            {places.map((place, index) =>
              coordinates[place.place_id] ? (
                <Marker
                  key={place.id}
                  position={coordinates[place.place_id]}
                  icon={{
                    path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                    fillColor: place.type === 'restaurant' ? "#FF1493" : "#4169E1",
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

const MapView = ({ places }: { places: Place[] }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [defaultCenter, setDefaultCenter] = useState<google.maps.LatLngLiteral>(
    {
      lat: 40.4406,
      lng: -79.9959,
    }
  );

  useEffect(() => {
    const fetchInitialCenter = async () => {
      if (places[0]) {
        const coords = await getCoordinates(places[0].place_id);
        setDefaultCenter(coords);
      }
    };
    fetchInitialCenter();
  }, [places]);

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
        googleMapsApiKey={env.client.googleMapsApiKey}
        onLoad={() => setIsLoaded(true)}
      >
        <Map
          places={places}
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          options={mapOptions}
        />
      </LoadScript>
    </>
  );
};

export default MapView;
