'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button 
        onClick={() => setOpen(!open)} 
        className="md:hidden p-1 text-[#c9a227] relative z-50" 
        aria-label="Меню"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[100] md:hidden" onClick={() => setOpen(false)}></div>
          <nav className="fixed top-20 right-4 w-64 bg-black border-2 border-[#c9a227] rounded-lg shadow-2xl py-3 z-[101] md:hidden">
            <Link href="/" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Главная</Link>
            <a href="#catalog" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Авто в РФ</a>
            <a href="#services" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Услуги</a>
            <Link href="/promo" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Акции</Link>
            <Link href="/news" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Новости</Link>
            <a href="#about" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">О нас</a>
            <Link href="/reviews" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Отзывы</Link>
            <a href="#contacts" onClick={() => setOpen(false)} className="block px-5 py-3 text-sm text-white hover:bg-[#1a1408] hover:text-[#c9a227]">Контакты</a>
          </nav>
        </>
      )}
    </>
  );
}