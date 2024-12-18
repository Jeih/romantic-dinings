import { prisma } from "@/app/lib/prisma";
import { Place, Prisma } from "@prisma/client";
import { customAlphabet } from 'nanoid';
import { NextResponse } from "next/server";

const generateShareCode = customAlphabet('23456789abcdefghkmnpqrstuvwxyz', 6);

export async function POST (request: Request) {
  try {
    const places = await request.json() as Place[];

    // Create a deterministic hash of the ordered place_ids
    const placeIdsString = places.map(p => p.place_id).join(',');

    // Check if this exact itinerary already exists
    const existing = await prisma.itineraryShare.findFirst({
      where: {
        placeIds: placeIdsString,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existing) {
      return NextResponse.json({ code: existing.code });
    }

    // If not found, create a new share code
    while (true) {
      const shareCode = generateShareCode();

      try {
        await prisma.itineraryShare.create({
          data: {
            code: shareCode,
            placeIds: placeIdsString,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          }
        });

        return NextResponse.json({ code: shareCode });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Share creation failed:', error);
    return NextResponse.json({ error: 'Failed to create share code' }, { status: 500 });
  }
}