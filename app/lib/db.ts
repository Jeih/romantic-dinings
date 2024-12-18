import { PlaceType } from '@prisma/client';
import { prisma } from './prisma';

export async function getPlacesByType (type: PlaceType) {
  return prisma.place.findMany({
    where: {
      type: type
    },
    orderBy: {
      name: 'asc'
    }
  });
}

export async function getPlaceById (id: string) {
  return prisma.place.findUnique({
    where: {
      id: id
    }
  });
}

export async function getPlaceByGoogleId (placeId: string) {
  return prisma.place.findUnique({
    where: {
      place_id: placeId
    }
  });
}