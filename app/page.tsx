import React from 'react'
import ExploreBtn from '@/components/ExploreBtn'
import EventCard from '@/components/EventCard'
import { cacheLife } from 'next/cache';

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
  'use cache';
  cacheLife('hours');
  let events: EventData[] = [];

  try {
    const response = await fetch(`${BASE_URL}/api/events`);

    if (!response.ok) {
      console.error('Failed to fetch events:', response.status);
    } else {
      const data = await response.json();
      events = data.events || [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
      <p className="text-center mt-5">Hackathons, Workshops, and More - All in One Place</p>

      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        {events.length > 0 ? (
          <ul className="events">
            {events.map((event: EventData) => (
              <li key={event.slug}>
                <EventCard {...event} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center mt-5">Unable to load events. Please try again later.</p>
        )}
      </div>
    </section>
  );
}

export default Page