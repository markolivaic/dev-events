import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format date string
  time: string; // Consistent time format (HH:MM AM/PM)
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event schema definition
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      minlength: [1, 'Overview cannot be empty'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      minlength: [1, 'Image cannot be empty'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      minlength: [1, 'Venue cannot be empty'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [1, 'Location cannot be empty'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      minlength: [1, 'Audience cannot be empty'],
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      minlength: [1, 'Organizer cannot be empty'],
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 * Falls back to timestamp-based identifier if slug becomes empty
 */
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Fallback to timestamp-based identifier if slug is empty
  // This handles edge cases where title contains only special characters
  if (!slug) {
    return `event-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  return slug;
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * Handles various input formats and converts to standard ISO date string
 * Parses YYYY-MM-DD as UTC to avoid timezone shifting
 */
function normalizeDate(dateInput: string): string {
  try {
    // Parse as UTC to avoid timezone shifting
    // Append T00:00:00Z to ensure UTC parsing for YYYY-MM-DD format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const dateString = isoDateRegex.test(dateInput.trim())
      ? `${dateInput.trim()}T00:00:00Z`
      : dateInput;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
  } catch {
    throw new Error(`Invalid date format: ${dateInput}`);
  }
}

/**
 * Normalize time to consistent format (HH:MM AM/PM)
 * Converts various time formats to standard 12-hour format
 */
function normalizeTime(timeInput: string): string {
  const trimmed = timeInput.trim();
  
  // If already in HH:MM AM/PM format, validate and return
  const amPmRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
  if (amPmRegex.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Try to parse as 24-hour format (HH:MM)
  const time24Regex = /^(\d{1,2}):(\d{2})$/;
  const match = trimmed.match(time24Regex);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    
    if (hours < 0 || hours > 23 || parseInt(minutes, 10) > 59) {
      throw new Error(`Invalid time format: ${timeInput}`);
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes} ${period}`;
  }
  
  throw new Error(`Invalid time format: ${timeInput}`);
}

/**
 * Pre-save hook: Generate slug, normalize date and time
 * Only regenerates slug if title has changed
 */
eventSchema.pre('save', function () {
  // Generate slug only if title changed or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }
  
  // Normalize date to ISO format
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }
  
  // Normalize time to consistent format
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }
});

// Create unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Event model
 */
export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

