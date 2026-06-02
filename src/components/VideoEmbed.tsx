"use client";

import { useMemo } from "react";

interface Props {
  url: string | null;
  className?: string;
}

function getVideoEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Direct video file (mp4, webm)
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return url; // will use <video> tag
  }

  return null;
}

export default function VideoEmbed({ url, className = "" }: Props) {
  const embedUrl = useMemo(() => getVideoEmbedUrl(url), [url]);

  if (!url || !embedUrl) return null;

  const isDirectVideo = embedUrl === url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

  if (isDirectVideo) {
    return (
      <div className={`rounded-2xl overflow-hidden bg-black ${className}`}>
        <video controls className="w-full aspect-video" src={url}>
          Tu navegador no soporta videos HTML5.
        </video>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl overflow-hidden bg-black ${className}`}>
      <iframe
        src={embedUrl}
        title="Video explicativo"
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
