'use client';

import Image from 'next/image';

/**
 * Explore button component
 * Scrolls to events section on click
 */
const ExploreBtn = () => {
  const handleClick = () => {
    const eventsSection = document.getElementById('events');
    eventsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={handleClick}
    >
      Explore Events
      <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
    </button>
  );
};

export default ExploreBtn;