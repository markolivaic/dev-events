import React from 'react'
import ExploreBtn from '@/components/ExploreBtn'
import EventCard from '@/components/EventCard'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type EventData = {
  title: string;
  slug: string;
  image: string;
  location: string;
  date: string;
  time: string;
  [key: string]: unknown;
};

const Page = async () => {
  const response = await fetch(`${BASE_URL}/api/events`);
  const { events } = await response.json();

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Can&apost Miss</h1>
      <p className="text-center mt-5">Hackathons, Workshops, and More - All in One Place</p>

        <ExploreBtn />

        <div className="mt-20 space-y-7">
          <h3>Featured Events</h3>
          <ul className="events">
            {events && events.length > 0 && events.map((event: EventData) => (
              <li key={event.slug}>
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        </div>

    </section>
  
  )
}

export default Page