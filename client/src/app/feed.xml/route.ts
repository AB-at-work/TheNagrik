import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import type { BlogPostDTO, PaginatedResponse } from '@thenagrik/shared';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thenagrik.com';
    
    // Fetch latest blog posts for RSS
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog?limit=20&status=published`);
    
    let posts: BlogPostDTO[] = [];
    if (response.ok) {
      const result: { success: boolean; data: PaginatedResponse<BlogPostDTO> } = await response.json();
      posts = result.data?.data || [];
    }

    const feedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>The Nagrik Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Civic literacy and constitutional awareness updates</description>
    <language>en-in</language>
    ${posts.map(post => `
    <item>
      <title>${post.title}</title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/blog/${post.slug}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`;

    return new NextResponse(feedXml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
