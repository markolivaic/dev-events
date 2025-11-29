'use server';

import connectDB from '../mongodb';
import { Booking } from '@/database/booking.model';

interface CreateBookingParams {
  eventId: string;
  slug: string;
  email: string;
}

interface CreateBookingResult {
  success: boolean;
  error?: string;
}

/**
 * Creates a new booking for an event
 * @param params - eventId, slug, and email for the booking
 * @returns Success status and optional error message
 */
export const createBooking = async ({
  eventId,
  slug,
  email,
}: CreateBookingParams): Promise<CreateBookingResult> => {
  try {
    await connectDB();
    await Booking.create({ eventId, slug, email });
    return { success: true };
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating booking:', e);
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Failed to create booking',
    };
  }
};