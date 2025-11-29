import Link from 'next/link';
import Image from 'next/image';

/**
 * Navigation bar component
 * Renders logo and navigation links
 */
const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <span>Devevent</span>
        </Link>
        <ul className='list-none'>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/events">Events</Link></li>
          <li><Link href="/events/create">Create Event</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;