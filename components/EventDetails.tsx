import React from 'react'
import { notFound } from 'next/navigation';
import { getSimilarEventsBySlug, getBookingsCountBySlug } from '@/lib/actions/event.actions';
import { cacheLife } from 'next/cache';
import Image from 'next/image';
import BookEvent from './BookEvent';
import EventCard from './EventCard';


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

interface EventDetailItemProps {
  icon: string;
  alt: string;
  label: string;
}

interface EventData {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  overview: string;
  date: string;
  time: string;
  location: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

const EventDetailItem = ({ icon, alt, label }: EventDetailItemProps) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul className="list-none">
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <span className="pill" key={tag}>
        {tag}
      </span>
    ))}
  </div>
);


const EventDetails = async ({params}: {params: Promise<string>}) => {

    'use cache';
    cacheLife('hours');
    const slug = await params;

    let event: EventData | null = null;

    try {
      const response = await fetch(`${BASE_URL}/api/events/${slug}`);
  
      if (!response.ok) {
        if (response.status === 404) {
          return notFound();
        }
        throw new Error(`API returned ${response.status}`);
      }
  
      const data = await response.json();
      event = data.event;
  
      if (!event || !event.description) {
        return notFound();
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching event:', error);
      }
      return notFound();
    }
  
    const {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      audience,
      agenda,
      organizer,
      tags,
    } = event;
  
    const bookingsCount = await getBookingsCountBySlug(slug);
  
    const similarEvents = await getSimilarEventsBySlug(slug);
  
    return (
      <section id="event">
        <div className="header">
          <h1>Event Description</h1>
          <p>{description}</p>
        </div>
  
        <div className="details">
          <div className="content">
            <Image
              src={image}
              alt="Event Banner"
              width={410}
              height={300}
              className="banner"
            />
  
            <section className="flex-col-gap-2">
              <h2>Overview</h2>
              <p>{overview}</p>
            </section>
  
            <section className="flex-col-gap-2">
              <h2>Event Details</h2>
              <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
              <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
              <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
              <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
              <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
            </section>
  
            <EventAgenda agendaItems={agenda} />
  
            <section className="flex-col-gap-2">
              <h2>About the Organizer</h2>
              <p>{organizer}</p>
            </section>
  
            <EventTags tags={tags} />
          </div>
  
          <aside className="booking">
            <div className="signup-card">
              <h2>Book Your Spot</h2>
              {bookingsCount > 0 ? (
                <p className="text-sm">
                  Join {bookingsCount} people who have already booked their spot!
                </p>
              ) : (
                <p className="text-sm">Be the first to book your spot!</p>
              )}
              {event._id && <BookEvent eventId={event._id} slug={slug} />}
            </div>
          </aside>
        </div>
  
        {similarEvents.length > 0 && (
          <div className="flex w-full flex-col gap-4 pt-20">
            <h2>Similar Events</h2>
            <div className="events">
              {similarEvents.map((similarEvent) => (
                <EventCard key={similarEvent.slug} {...similarEvent} />
              ))}
            </div>
          </div>
        )}
      </section>
    );
}

export default EventDetails