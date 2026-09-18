import Link from 'next/link';

async function getReviews() {
  const res = await fetch('https://auto-project-production-ecda.up.railway.app/api/reviews?populate=*', { cache: 'no-store' });
  if (!res.ok) return { data: [] };
  return res.json();
}

export default async function ReviewsPage() {
  const reviewsData = await getReviews();
  const reviews = reviewsData.data || [];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: 'var(--font-oswald)' }}>

      {/* ВЕРХНЯЯ ПАНЕЛЬ */}
      <div className="bg-black border-b border-[#c9a227]/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col lg:flex-row lg:justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
            <span className="text-[#c9a227] font-bold tracking-wider gold-glow" style={{ fontSize: '20px' }}>ПОДПИСЫВАЙСЯ</span>
            <a href="https://vk.ru/autolux42nk" target="_blank" className="hover:scale-110 transition" title="ВКонтакте">
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="10" fill="#0077FF"/>
                <path d="M25.7 34C15.5 34 9.7 27 9.4 15.4H14.6C14.8 24 18.8 27.6 21.9 28.4V15.4H26.7V22.8C29.7 22.5 32.9 19.2 33.9 15.4H38.7C38 20.1 34.6 23.4 32 24.7C34.6 25.8 38.4 28.7 39.8 34H34.5C33.4 30.4 30.4 27.8 26.7 27.4V34H25.7Z" fill="white"/>
              </svg>
            </a>
            <a href="https://t.me/avtolux42" target="_blank" className="hover:scale-110 transition" title="Telegram">
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="10" fill="#29B6F6"/>
                <path d="M34.5 14.5L11.5 23.5C10.2 24 10.2 24.8 11.3 25.1L17.2 27L19.5 33.8C19.8 34.6 20.2 34.7 20.8 34.1L23.8 31.2L29.7 35.6C30.7 36.1 31.4 35.9 31.7 34.7L36.3 16.2C36.6 14.8 35.8 14.1 34.5 14.5Z" fill="white"/>
              </svg>
            </a>
            <span className="text-gray-400 text-xs tracking-wide hidden md:inline">— тут много интересного</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1 bg-[#111] border border-[#c9a227]/30 rounded px-2 py-1">
              <a href="tel:+79675978888" className="hover:text-[#c9a227] transition font-semibold text-xs whitespace-nowrap">+7 967 597 88 88</a>
              <a href="https://wa.me/79675978888" target="_blank" className="text-green-500 hover:text-green-400 font-bold text-xs px-1">W</a>
              <a href="https://t.me/+79675978888" target="_blank" className="text-sky-400 hover:text-sky-300 font-bold text-xs px-1">T</a>
              <a href="https://max.ru/u/79675978888" target="_blank" className="text-purple-400 hover:text-purple-300 font-bold text-xs px-1">M</a>
            </div>
            <div className="flex items-center gap-1 bg-[#111] border border-[#c9a227]/30 rounded px-2 py-1">
              <a href="tel:+79963338606" className="hover:text-[#c9a227] transition font-semibold text-xs whitespace-nowrap">8 996 333 86 06</a>
              <a href="https://wa.me/79963338606" target="_blank" className="text-green-500 hover:text-green-400 font-bold text-xs px-1">W</a>
              <a href="https://t.me/+79963338606" target="_blank" className="text-sky-400 hover:text-sky-300 font-bold text-xs px-1">T</a>
              <a href="https://max.ru/u/79963338606" target="_blank" className="text-purple-400 hover:text-purple-300 font-bold text-xs px-1">M</a>
            </div>
            <div className="flex items-center gap-1 bg-[#111] border border-[#c9a227]/30 rounded px-2 py-1">
              <a href="tel:+79095147778" className="hover:text-[#c9a227] transition font-semibold text-xs whitespace-nowrap">8 909 514 77 78</a>
              <a href="https://wa.me/79095147778" target="_blank" className="text-green-500 hover:text-green-400 font-bold text-xs px-1">W</a>
              <a href="https://t.me/+79095147778" target="_blank" className="text-sky-400 hover:text-sky-300 font-bold text-xs px-1">T</a>
              <a href="https://max.ru/u/79095147778" target="_blank" className="text-purple-400 hover:text-purple-300 font-bold text-xs px-1">M</a>
            </div>
          </div>
        </div>
      </div>

      {/* НАВИГАЦИЯ */}
      <div className="bg-black border-b border-[#c9a227]/40 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:text-[#c9a227] transition font-semibold tracking-wider text-sm">← НАЗАД НА ГЛАВНУЮ</Link>
          <div className="hidden md:flex gap-6 text-sm tracking-wider">
            <Link href="/" className="hover:text-[#c9a227] transition">Главная</Link>
            <Link href="/#catalog" className="hover:text-[#c9a227] transition">Авто готовые к отправке</Link>
            <Link href="/reviews" className="text-[#c9a227]">Отзывы</Link>
            <a href="/#contacts" className="hover:text-[#c9a227] transition">Контакты</a>
          </div>
        </div>
      </div>

      {/* ЗАГОЛОВОК */}
      <section className="text-center py-16 px-4">
        <p className="text-[#c9a227] tracking-[0.5em] text-xs mb-3">БЛАГОДАРНОСТИ</p>
        <h1 className="text-4xl sm:text-5xl font-bold gold-glow mb-4">Отзывы наших клиентов</h1>
        <div className="w-20 h-px bg-[#c9a227] mx-auto mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto">Реальные фото и слова благодарности от людей, которые уже получили свои автомобили через AUTOLUX42</p>
      </section>

      {/* СПИСОК ОТЗЫВОВ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg mb-2">Пока отзывов нет</p>
            <p className="text-sm">Скоро здесь появятся фото и слова наших клиентов</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {reviews.map((review: any) => {
              const { id, text, photo } = review;
              let photoUrl = '';
              if (photo && photo.url) photoUrl = `https://auto-project-production-ecda.up.railway.app${photo.url}`;

              return (
                <div key={id} className="bg-black/70 backdrop-blur-sm border border-[#c9a227]/40 rounded-lg overflow-hidden hover:border-[#c9a227] hover:shadow-[0_0_40px_rgba(201,162,39,0.4)] transition">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Отзыв" className="w-full h-72 object-cover" />
                  ) : (
                    <div className="w-full h-72 bg-[#111] flex items-center justify-center text-gray-600">Нет фото</div>
                  )}
                  <div className="p-5">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">{text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ПОДВАЛ */}
      <footer className="relative z-10 bg-black text-gray-500 text-center py-6 text-xs border-t border-[#c9a227]/40">
        <p className="font-bold text-[#c9a227] mb-2 text-base gold-glow tracking-[0.2em]">👑 AUTOLUX42</p>
        <p className="text-[10px]">© 2026 Все права защищены</p>
      </footer>
    </main>
  );
}