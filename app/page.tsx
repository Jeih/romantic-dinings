import { ItineraryBuilder } from "@/app/components/ItineraryBuilder";
import { deserializeFromShareCode } from "@/app/utils/itineraryShare";

export default async function Home ({
  searchParams
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const resolvedParams = await searchParams;
  let placeIds: string[] = [];

  if (resolvedParams.code) {
    placeIds = await deserializeFromShareCode(resolvedParams.code);
  }

  return (
    <div className="min-h-screen p-8">
      <ItineraryBuilder initialPlaceIds={placeIds} />
    </div>
  );
}
