'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { SearchResultDTO } from '@thenagrik/shared';
import Link from 'next/link';

import { Suspense } from 'react';
import { CapyLoader } from '@/components/ui/CapyLoader';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';

  const { data: results, isLoading, error } = useSWR<SearchResultDTO[]>(
    q.length > 1 ? `/api/v1/search?q=${q}&type=${type}` : null,
    (url: string) => api.get<SearchResultDTO[]>(url)
  );

  const getUrlForSearchResult = (result: SearchResultDTO) => {
    switch (result.type) {
      case 'article': return `/learn/article/${result.slug}`;
      case 'blog_post': return `/blog/${result.slug}`;
      case 'project': return `/projects/${result.slug}`;
      case 'school_session': return `/schools/${result.slug}`;
      case 'faq': return `/about#faq-${result.id}`;
      default: return '#';
    }
  };

  return (
    <div className="bg-nagrik-sand min-h-screen pt-24 pb-16">
      <div className="container-narrow">
        <h1 className="text-4xl md:text-5xl font-black text-nagrik-black tracking-tight mb-8">
          Search Results for "{q}"
        </h1>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <Link href={`/search?q=${q}`} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${!type ? 'bg-nagrik-black text-nagrik-sand' : 'bg-white/50 text-nagrik-black hover:bg-white'}`}>All</Link>
          <Link href={`/search?q=${q}&type=article`} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${type === 'article' ? 'bg-nagrik-black text-nagrik-sand' : 'bg-white/50 text-nagrik-black hover:bg-white'}`}>Learn</Link>
          <Link href={`/search?q=${q}&type=blog_post`} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${type === 'blog_post' ? 'bg-nagrik-black text-nagrik-sand' : 'bg-white/50 text-nagrik-black hover:bg-white'}`}>Blog</Link>
          <Link href={`/search?q=${q}&type=project`} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${type === 'project' ? 'bg-nagrik-black text-nagrik-sand' : 'bg-white/50 text-nagrik-black hover:bg-white'}`}>Projects</Link>
          <Link href={`/search?q=${q}&type=school_session`} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${type === 'school_session' ? 'bg-nagrik-black text-nagrik-sand' : 'bg-white/50 text-nagrik-black hover:bg-white'}`}>Schools</Link>
        </div>

        {q.length < 2 ? (
          <p className="text-nagrik-dark-gray text-lg">Please enter at least 2 characters to search.</p>
        ) : isLoading ? (
          <CapyLoader />
        ) : error ? (
          <p className="text-nagrik-primary font-bold">Failed to load search results. Please try again.</p>
        ) : !results || results.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-subtle border border-black/5">
            <h3 className="text-2xl font-bold text-nagrik-black mb-4">No results found</h3>
            <p className="text-nagrik-dark-gray">Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((result) => (
              <Link 
                key={`${result.type}-${result.id}`} 
                href={getUrlForSearchResult(result)}
                className="group bg-white rounded-2xl p-6 md:p-8 shadow-subtle border border-black/5 hover:border-nagrik-primary/30 transition-all hover:shadow-hover hover:-translate-y-1 block"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-nagrik-sand text-nagrik-black text-xs font-bold uppercase tracking-wider rounded-full">
                        {result.section}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-nagrik-black mb-3 group-hover:text-nagrik-primary transition-colors line-clamp-2">
                      {result.title}
                    </h2>
                    {result.excerpt && (
                      <p className="text-nagrik-dark-gray line-clamp-2">{result.excerpt}</p>
                    )}
                  </div>
                  <div className="hidden md:flex shrink-0 self-center">
                    <div className="w-10 h-10 rounded-full bg-nagrik-sand flex items-center justify-center text-nagrik-black group-hover:bg-nagrik-primary group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<CapyLoader fullScreen />}>
      <SearchContent />
    </Suspense>
  );
}
