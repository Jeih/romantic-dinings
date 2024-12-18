import { GoogleAddress } from "@/app/types/google";
import { Place, PlaceType } from "@prisma/client";
import { Clock, DollarSign, GripVertical, MapPin, Trash2 } from "lucide-react";
import Image from "next/image";

interface PlaceCardProps {
  place: Place;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, place: Place) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove: (id: string) => void;
}

export const PlaceCard = ({ place, onDragStart, onDragEnd, onRemove }: PlaceCardProps) => {
  const priceToSymbol = (level: number | null): string => {
    return level ? "$".repeat(level) : "$$";
  };

  const imageUrl = `/api/places/${place.place_id}/photo?maxwidth=400`;
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(place.name)}&background=random&size=400&bold=true&length=2`;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, place)}
      onDragEnd={onDragEnd}
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
              onClick={() => onRemove(place.id)}
              className="p-1 hover:bg-gray-100 rounded text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Image
              src={imageUrl}
              alt={place.name}
              width={150}
              height={150}
              className="rounded object-cover w-[150px] h-[150px]"
              priority={false}
              loading="lazy"
              unoptimized
              onError={(e) => {
                // Fallback to avatar if image fails to load
                (e.target as HTMLImageElement).src = fallbackUrl;
              }}
            />
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{place.type === PlaceType.restaurant ? '90 min' : '60 min'}</span>
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
  );
};