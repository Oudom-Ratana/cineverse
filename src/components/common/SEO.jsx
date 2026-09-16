import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Ciniverse | Cinema Ticketing & Interactive Streaming',
  description = 'Experience Ciniverse: Book cinema seats in real-time with friends, stream unlimited blockbusters and TV shows, order concessions, and enjoy multiplayer booking rooms.',
  image = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=630&q=80',
  url,
  type = 'website',
  publishedTime,
  authors,
}) {
  const siteUrl = 'https://Ciniverse.app';
  const fullUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url}`) : siteUrl;
  const fullTitle = title.includes('Ciniverse') ? title : `${title} — Ciniverse`;

  return (
    <Helmet>
      {/* Standard HTML metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="Ciniverse" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={fullTitle} />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
