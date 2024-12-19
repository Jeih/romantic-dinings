import { useDebounce } from "@/app/hooks/useDebounce";
import { Place } from "@prisma/client";
import { Search } from "lucide-react";
import { useState } from "react";

interface PlaceSearchProps {
  onPlaceSelect: (place: Place) => void;
}

export const PlaceSearch = ({ onPlaceSelect }: PlaceSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const handleSearch = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a place..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {isLoading && (
        <div className="text-center text-gray-500">Searching...</div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((place) => (
            <div
              key={place.id}
              onClick={() => onPlaceSelect(place)}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-gray-500">
                {place.address}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};