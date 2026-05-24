"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getEvents() {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const events = await prisma.event.findMany({
      orderBy: { date: 'asc' },
      where: {
        date: {
          gte: new Date(), // Hanya event yang belum lewat
        }
      },
      include: {
        _count: {
          select: { rsvps: true }
        },
        rsvps: userId ? {
          where: { userId }
        } : false
      }
    });

    const formattedEvents = events.map(event => ({
      ...event,
      isGoing: event.rsvps?.length > 0
    }));

    return { events: formattedEvents };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { events: [] };
  }
}

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const dateStr = formData.get("date") as string; // Format: YYYY-MM-DDTHH:mm

  if (!title || !location || !dateStr) {
    throw new Error("Missing required fields");
  }

  try {
    await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(dateStr)
      }
    });
    
    revalidatePath("/event");
    revalidatePath("/");
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
}

export async function toggleRSVP(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  try {
    const existing = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });

    if (existing) {
      await prisma.eventRSVP.delete({
        where: { id: existing.id }
      });
    } else {
      await prisma.eventRSVP.create({
        data: {
          eventId,
          userId,
          status: "Going"
        }
      });
    }

    revalidatePath("/event");
    revalidatePath("/");
  } catch (error) {
    console.error("Error toggling RSVP:", error);
    throw new Error("Failed to toggle RSVP");
  }
}
