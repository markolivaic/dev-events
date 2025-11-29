import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const formData = await req.formData();

        // Handle array fields separately (agenda, tags)
        const event: Record<string, unknown> = {};
        const arrayFields = ['agenda', 'tags'];

        try {
            for (const [key, value] of formData.entries()) {
                if (arrayFields.includes(key)) {
                    // Get all values for array fields
                    event[key] = formData.getAll(key);
                } else if (key !== 'image') {
                    // Skip image field, it's handled separately
                    event[key] = value;
                }
            }
        } catch (e) {
            return NextResponse.json(
                { message: "Invalid form data format"},
                { status: 400 }
            );
        }

        const file = formData.get("image") as File;
        if(!file) {
            return NextResponse.json({ message: "Image is required"}, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                resource_type: "image",
                folder: "DevEvent",
            }, (error, result) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }).end(buffer);
        });

        event.image = (uploadResult as {secure_url: string}).secure_url;

        // Ensure slug is not set so pre-save hook generates it
        delete (event as { slug?: string }).slug;

        const createdEvent = await Event.create(event);

        return NextResponse.json(
            { message: "Event created successfully", event: createdEvent },
            { status: 201 }
        );
    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: "Event creation failed", error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 }
        );
    }
}


export async function GET(req: NextRequest) {
    try {
        await connectDB();
        
        // Extract pagination parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return NextResponse.json(
                { message: "Invalid pagination parameters" },
                { status: 400 }
            );
        }

        // Fetch events with pagination and total count
        const [events, total] = await Promise.all([
            Event.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Event.countDocuments()
        ]);

        return NextResponse.json(
            { 
                message: "Events fetched successfully", 
                events,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            },
            { status: 200 }
        );
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching events:', e);
        }
        return NextResponse.json(
            { message: "Event fetching failed", error: e instanceof Error ? e.message : "Unknown error" },
            { status: 500 }
        );
    }
}

