import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function HlsVideo({ src, className = '', ...props }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;

    // Check if it's an m3u8 file
    if (src.includes('.m3u8')) {
      // Check if HLS is natively supported (Safari)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (Hls.isSupported()) {
        // Use hls.js for other browsers
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);

        return () => {
          hls.destroy();
        };
      }
    } else {
      // Regular video file
      video.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      {...props}
    />
  );
}
