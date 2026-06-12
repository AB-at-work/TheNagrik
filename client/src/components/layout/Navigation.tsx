'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { clsx } from '@/lib/utils';
import styles from './Navigation.module.css';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/learn', label: 'Learn' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/schools', label: 'Schools' },
  { href: '/contact', label: 'Contact' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Prevent scroll when mobile menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="The Nagrik Home">
            The Nagrik.
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.desktopNav} aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    styles.navLink,
                    isActive && styles.active
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.actions}>
            <Link href="/join" tabIndex={-1}>
              <Button variant="primary" size="md">Join Us</Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className={styles.mobileNavOverlay}>
          <nav className={styles.mobileNav}>
            {NAV_LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    styles.mobileNavLink,
                    isActive && styles.active
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className={styles.mobileActions}>
              <Link href="/join" style={{ width: '100%', textDecoration: 'none' }}>
                <Button variant="primary" size="lg" style={{ width: '100%' }}>
                  Join Us
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
