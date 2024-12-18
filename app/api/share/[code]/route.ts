import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET (
  request: Request,
  { params }: { params: Promise<{ code: string }> }
): Promise<Response> {
  try {
    const code = (await params).code;
    const share = await prisma.itineraryShare.findUnique({
      where: { code }
    });

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Clean up if expired
    if (share.expiresAt < new Date()) {
      await prisma.itineraryShare.delete({ where: { code } });
      return NextResponse.json({ error: 'Share expired' }, { status: 404 });
    }

    return NextResponse.json({ placeIds: share.placeIds.split(',') });
  } catch (error) {
    console.error('Share retrieval failed:', error);
    return NextResponse.json({ error: 'Failed to retrieve share' }, { status: 500 });
  }
}