import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database/event.model';

interface EventData {
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string;
  time: string;
}

/**
 * Home page component
 * Displays featured events
 */
export default async function Page() {
  let events: EventData[] = [];

  try {
    await connectDB();
    // Fetch latest 9 events directly from DB
    events = await Event.find()
      .sort({ createdAt: -1 })
      .limit(9)
      .select('title slug image location date time')
      .lean();
      
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching events:', error);
    }
  }

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Workshops, and More - All in One Place
      </p>

      <ExploreBtn />

      <div id="events" className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        {events.length > 0 ? (
          <ul className="events">
            {events.map((event) => (
              <li key={event.slug}>
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center mt-5">
            No events available at the moment. Check back later!
          </p>
        )}
      </div>
    </section>
  );
}