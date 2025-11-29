import { Suspense } from 'react';
import EventDetails from '@/components/EventDetails';

/**
 * Event details page
 * Displays full event information with booking form
 */
export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = params.then(params => params.slug);
   return (
    <main>
        <Suspense fallback={<div>Loading...</div>}>
            <EventDetails params={slug} />
        </Suspense>
    </main>
   )
  
}