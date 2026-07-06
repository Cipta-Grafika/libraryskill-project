import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/skills', '/raw/', '/llms.txt'],
        disallow: ['/admin/', '/review/', '/auth/', '/api/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'CCBot', 'anthropic-ai', 'Claude-Web', 'Google-Extended'],
        allow: ['/', '/raw/', '/llms.txt'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
