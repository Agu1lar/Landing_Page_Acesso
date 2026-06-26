export type VideoEmbedProvider = 'youtube' | 'vimeo' | 'file';

export type ParsedVideoEmbed = {
  provider: VideoEmbedProvider;
  /** iframe src for YouTube/Vimeo; direct URL for uploaded files */
  embedSrc: string;
};

/**
 * Parses a YouTube, Vimeo or direct video file URL for blog embeds.
 */
export function parseVideoEmbedUrl(url: string): ParsedVideoEmbed | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  if (/\.(mp4|webm)(\?|$)/iu.test(trimmed) || trimmed.includes('blob.vercel-storage.com')) {
    return { provider: 'file', embedSrc: trimmed };
  }

  const youtubeMatch =
    trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/iu) ??
    trimmed.match(/youtube\.com\/shorts\/([\w-]{11})/iu);

  if (youtubeMatch?.[1]) {
    return {
      provider: 'youtube',
      embedSrc: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/iu);
  if (vimeoMatch?.[1]) {
    return {
      provider: 'vimeo',
      embedSrc: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return null;
}
