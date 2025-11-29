import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database/event.model';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/events
 * Creates a new event with image upload to Cloudinary
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const formData = await req.formData();

    // Extract and validate image file
    const file = formData.get('image') as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json(
        { message: 'Image is required' },
        { status: 400 }
      );
    }

    // Parse form data into event object
    const eventData: Record<string, unknown> = {};

    for (const [key, value] of formData.entries()) {
      if (key === 'image') continue;

      // Handle JSON array fields (tags, agenda)
      if (key === 'tags' || key === 'agenda') {
        try {
          eventData[key] = JSON.parse(value as string);
        } catch {
          eventData[key] = formData.getAll(key);
        }
      } else {
        eventData[key] = value;
      }
    }

    // Upload image to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'DevEvent' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as { secure_url: string });
          }
        )
        .end(buffer);
    });

    eventData.image = uploadResult.secure_url;

    // Remove slug to let pre-save hook generate it
    delete (eventData as { slug?: string }).slug;

    const createdEvent = await Event.create(eventData);

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating event:', e);
    }
    return NextResponse.json(
      {
        message: 'Event creation failed',
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events
 * Fetches paginated list of events
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const [events, total] = await Promise.all([
      Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Event.countDocuments(),
    ]);

    return NextResponse.json(
      {
        message: 'Events fetched successfully',
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching events:', e);
    }
    return NextResponse.json(
      {
        message: 'Event fetching failed',
        error: e instanceof Error ? e.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

