'use server';

import connectDB from '../mongodb';
import { Event, IEvent } from '@/database/event.model';
import { Booking } from '@/database/booking.model';

/**
 * Fetches events with similar tags to the given event
 * @param slug - The slug of the current event
 * @returns Array of similar events (excluding the current one)
 */
export const getSimilarEventsBySlug = async (slug: string): Promise<IEvent[]> => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();
    
    if (!event) {
      return [];
    }

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .limit(6)
      .lean();

    return similarEvents as IEvent[];
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching similar events:', e);
    }
    return [];
  }
};

/**
 * Gets the count of bookings for an event by slug
 * @param slug - The event slug
 * @returns Number of bookings
 */
export const getBookingsCountBySlug = async (slug: string): Promise<number> => {
  try {
    await connectDB();
    return await Booking.countDocuments({ slug });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching bookings count:', e);
    }
    return 0;
  }
};