import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Force dynamic rendering (fetches fresh data on each request)
export const dynamic = 'force-dynamic';

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
    const response = await fetch(`${BASE_URL}/api/events`);

    if (response.ok) {
      const data = await response.json();
      events = data.events || [];
    }
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