import type { APIRoute } from 'astro';
import { site } from '../lib/catalog.ts';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: site.name,
      short_name: site.name,
      description: site.tagline,
      start_url: '/',
      display: 'browser',
      background_color: '#0d0c0b',
      theme_color: '#0d0c0b',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
