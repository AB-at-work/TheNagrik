import Link from 'next/link';
import { FileText, Newspaper, FolderKanban, GraduationCap, Users, HelpCircle, Tags, BookOpen } from 'lucide-react';
import styles from './ContentDashboard.module.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Management - Admin',
};

const CONTENT_TYPES = [
  {
    title: 'Learn Articles',
    description: 'Manage educational guides, readings, and resources for the Learn Hub topics.',
    href: '/admin/articles',
    icon: BookOpen
  },
  {
    title: 'Blog Posts',
    description: 'Manage news, updates, and opinion pieces for the blog.',
    href: '/admin/blog',
    icon: Newspaper
  },
  {
    title: 'Projects',
    description: 'Manage ongoing and completed civic tech projects.',
    href: '/admin/projects',
    icon: FolderKanban
  },
  {
    title: 'School Outreach',
    description: 'Log and manage school outreach sessions and impact metrics.',
    href: '/admin/schools',
    icon: GraduationCap
  }
];

export default function ContentDashboard() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Content Management</h1>
        <p className={styles.subtitle}>Select a content type to manage.</p>
      </header>

      <div className={styles.grid}>
        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Link key={type.href} href={type.href} className={styles.card}>
              <div className={styles.iconWrapper}>
                <Icon size={24} />
              </div>
              <h2 className={styles.cardTitle}>{type.title}</h2>
              <p className={styles.cardDesc}>{type.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
