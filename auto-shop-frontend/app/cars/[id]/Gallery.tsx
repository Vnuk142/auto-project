'use client';
import { useState, useEffect, useRef } from 'react';

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const openAt = (i: number) => { setIndex(i); setOpen(true); };
  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, images.length]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchMove = (e: React.TouchEvent) => { touchEndX.current = e.touches[0].clientX; };
  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next(); else prev();
    }
  };

  return (
    <>
      <div className="flex gap-3 p-4 overflow-x-auto bg-black/50 border-b border-[#c9a227]/30">
        {images.length > 0 ? (
          images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={alt}
              onClick={() => openAt(i)}
              className="w-80 h-60 object-cover rounded-xl border border-[#c9a227]/40 cursor-zoom-in hover:border-[#c9a227] hover:scale-[1.02] transition flex-shrink-0"
            />
          ))
        ) : (
          <div className="w-full h-60 bg-gray-800 flex items-center justify-center text-gray-500 rounded-xl">Нет фото</div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 select-none"
          onClick={() => setOpen(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            className="absolute top-4 right-4 md:top-6 md:right-6 text-white text-4xl hover:text-[#c9a227] transition z-10"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
          >✕</button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 md:left-8 text-[#c9a227] text-5xl md:text-6xl hover:scale-125 transition z-10 bg-black/40 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >‹</button>
              <button
                className="absolute right-2 md:right-8 text-[#c9a227] text-5xl md:text-6xl hover:scale-125 transition z-10 bg-black/40 rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >›</button>
            </>
          )}

          <img
            src={images[index]}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-4 md:bottom-6 text-[#c9a227] text-sm md:text-base tracking-widest bg-black/60 px-4 py-2 rounded-full">
            {index + 1} / {images.length}
          </div>

          <div className="hidden md:block absolute top-6 left-6 text-gray-500 text-xs tracking-wider">
            ← → листать · ESC закрыть
          </div>
        </div>
      )}
    </>
  );
}