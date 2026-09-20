import Link from 'next/link';
import CallbackForm from './CallbackForm';

interface SearchParams { country?: string; minPrice?: string; maxPrice?: string; sort?: string; }

async function getCars() {
  const res = await fetch('https://auto-project-production-ecda.up.railway.app/api/cars?populate=*', { cache: 'no-store' });
  if (!res.ok) throw new Error('Ошибка загрузки');
  return res.json();
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const country = params.country || '';
  const minPrice = params.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : 0;
  const sort = params.sort || 'new';

  const carsData = await getCars();
  let cars = carsData.data;
  if (country) cars = cars.filter((c: any) => c.country?.toLowerCase() === country.toLowerCase());
  if (minPrice) cars = cars.filter((c: any) => c.price >= minPrice);
  if (maxPrice) cars = cars.filter((c: any) => c.price <= maxPrice);
  if (sort === 'price-asc') cars = [...cars].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') cars = [...cars].sort((a, b) => b.price - a.price);
  else if (sort === 'year-desc') cars = [...cars].sort((a, b) => b.year - a.year);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden relative" style={{ fontFamily: 'var(--font-oswald)' }}>
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2e] via-[#1a0f2e] via-40% to-[#2d1a0e]"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[45%] bg-gradient-to-t from-[#c9a227]/40 via-[#e07820]/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[35%] bg-gradient-to-t from-black via-[#111] to-transparent" style={{ clipPath: 'polygon(45% 0, 55% 0, 100% 100%, 0% 100%)' }}></div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <Link href="/promo" className="gold-pulse block text-center py-2 px-2 text-[#0a1f44] font-bold text-[10px] sm:text-xs md:text-sm tracking-wider cursor-pointer relative z-10">
        🔥 СКИДКИ 20 000–60 000 ₽ — ЖМИ СЮДА 🔥
      </Link>

      <div className="relative z-10 bg-black/90 backdrop-blur border-b border-[#c9a227]/40">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[#c9a227] font-bold tracking-wider gold-glow text-[11px] sm:text-base">ПОДПИСЫВАЙСЯ</span>
            <a href="https://vk.ru/autolux42nk" target="_blank" className="hover:scale-110 transition">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none" className="sm:w-9 sm:h-9">
                <rect width="48" height="48" rx="10" fill="#0077FF"/>
                <path d="M25.7 34C15.5 34 9.7 27 9.4 15.4H14.6C14.8 24 18.8 27.6 21.9 28.4V15.4H26.7V22.8C29.7 22.5 32.9 19.2 33.9 15.4H38.7C38 20.1 34.6 23.4 32 24.7C34.6 25.8 38.4 28.7 39.8 34H34.5C33.4 30.4 30.4 27.8 26.7 27.4V34H25.7Z" fill="white"/>
              </svg>
            </a>
            <a href="https://t.me/avtolux42" target="_blank" className="hover:scale-110 transition">
              <svg width="28" height="28" viewBox="0 0 48 48" fill="none" className="sm:w-9 sm:h-9">
                <rect width="48" height="48" rx="10" fill="#29B6F6"/>
                <path d="M34.5 14.5L11.5 23.5C10.2 24 10.2 24.8 11.3 25.1L17.2 27L19.5 33.8C19.8 34.6 20.2 34.7 20.8 34.1L23.8 31.2L29.7 35.6C30.7 36.1 31.4 35.9 31.7 34.7L36.3 16.2C36.6 14.8 35.8 14.1 34.5 14.5Z" fill="white"/>
              </svg>
            </a>
          </div>
          <a href="tel:+79675978888" className="bg-[#c9a227] text-black px-3 py-1 rounded font-bold text-xs">📞 Позвонить</a>
        </div>
      </div>

      <header className="relative z-10 bg-black/85 backdrop-blur border-b border-[#c9a227]/40 sticky top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-1 sm:gap-2">
              <span className="text-xl sm:text-3xl">👑</span>
              <span className="text-sm sm:text-2xl font-bold tracking-[0.1em] sm:tracking-[0.3em] text-[#c9a227] gold-glow">AUTOLUX42</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium tracking-wider">
              <Link href="/" className="hover:text-[#c9a227]">Главная</Link>
              <a href="#catalog" className="hover:text-[#c9a227]">Авто в РФ</a>
              <a href="#services" className="hover:text-[#c9a227]">Услуги</a>
              <Link href="/promo" className="hover:text-[#c9a227]">Акции</Link>
              <Link href="/news" className="hover:text-[#c9a227]">Новости</Link>
              <a href="#about" className="hover:text-[#c9a227]">О нас</a>
              <Link href="/reviews" className="hover:text-[#c9a227]">Отзывы</Link>
              <a href="#contacts" className="hover:text-[#c9a227]">Контакты</a>
            </nav>
            <details className="md:hidden relative">
              <summary className="list-none cursor-pointer p-1 text-[#c9a227]">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </summary>
              <nav className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a]/98 backdrop-blur border border-[#c9a227]/40 rounded-lg shadow-2xl py-3 z-50">
                <Link href="/" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Главная</Link>
                <a href="#catalog" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Авто в РФ</a>
                <a href="#services" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Услуги</a>
                <Link href="/promo" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Акции</Link>
                <Link href="/news" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Новости</Link>
                <a href="#about" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">О нас</a>
                <Link href="/reviews" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Отзывы</Link>
                <a href="#contacts" className="block px-5 py-3 text-sm hover:bg-[#1a1408] hover:text-[#c9a227]">Контакты</a>
              </nav>
            </details>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-10 sm:py-28 px-4 sm:px-6 border-b border-[#c9a227]/20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12 items-center">
          <div className="text-center lg:text-left">
            <p className="text-[#c9a227] tracking-[0.2em] text-[10px] sm:text-xs mb-3">ЛУЧШИЕ АВТОМОБИЛИ С МИРОВЫХ РЫНКОВ</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 leading-tight">АВТОМОБИЛИ<br/><span className="text-[#c9a227] gold-glow">ПОД ЗАКАЗ</span></h2>
            <p className="text-gray-300 tracking-widest text-xs sm:text-sm mb-4 sm:mb-8">КОРЕЯ · КИТАЙ · ЯПОНИЯ</p>
          </div>
          <div className="text-center lg:col-span-1 order-first lg:order-none">
            <div className="text-5xl sm:text-7xl mb-2 sm:mb-4">👑</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-widest text-[#c9a227] gold-glow mb-2">AUTOLUX42</h1>
            <p className="text-white tracking-[0.3em] text-[10px] sm:text-xs mb-3 sm:mb-6">АВТО ПОД ЗАКАЗ</p>
            <p className="text-[#c9a227] italic text-sm sm:text-lg font-semibold mb-4 sm:mb-8 max-w-xs mx-auto">«Ваши проблемы — для нас не проблема.<br/> Просто доверьтесь нам!»</p>
            <a href="#callback" className="inline-block bg-[#c9a227] text-black px-6 sm:px-8 py-3 sm:py-4 rounded font-bold text-sm sm:text-base tracking-wide hover:bg-[#e0b83a]">📞 ОСТАВИТЬ ЗАЯВКУ</a>
          </div>
          <div className="text-center lg:text-right hidden lg:block">
            <p className="text-[#c9a227] tracking-widest text-xs mb-4">ВЫГОДНЫЕ УСЛОВИЯ</p>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto lg:ml-auto">
              <div className="bg-black/50 border border-[#c9a227]/40 p-3 rounded"><p className="font-bold text-white text-sm">KIA</p><p className="text-xs text-gray-400">Корея</p></div>
              <div className="bg-black/50 border border-[#c9a227]/40 p-3 rounded"><p className="font-bold text-white text-sm">HYUNDAI</p><p className="text-xs text-gray-400">Корея</p></div>
              <div className="bg-black/50 border border-[#c9a227]/40 p-3 rounded"><p className="font-bold text-white text-sm">TOYOTA</p><p className="text-xs text-gray-400">Япония</p></div>
              <div className="bg-black/50 border border-[#c9a227]/40 p-3 rounded"><p className="font-bold text-white text-sm">JETOUR</p><p className="text-xs text-gray-400">Китай</p></div>
            </div>
            <Link href="/reviews" className="block mt-4 bg-black border border-[#c9a227]/60 rounded-lg p-4 max-w-xs mx-auto lg:ml-auto">
              <div className="text-3xl mb-1">⭐</div>
              <p className="text-[#c9a227] font-bold text-sm mb-1">ОТЗЫВЫ КЛИЕНТОВ</p>
              <p className="text-[#c9a227] text-xs font-semibold">Смотреть →</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-black/80 backdrop-blur border-b border-[#c9a227]/30 py-3 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <form method="GET" action="/" className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 items-end">
            <div className="col-span-2 md:col-span-1"><label className="block text-[10px] sm:text-xs font-semibold text-[#c9a227] mb-1">СТРАНА</label><select name="country" defaultValue={country} className="w-full border border-[#c9a227]/40 rounded px-2 py-2 text-xs sm:text-sm bg-black text-white"><option value="">Все страны</option><option value="Китай">Китай</option><option value="Корея">Корея</option><option value="Япония">Япония</option></select></div>
            <div><label className="block text-[10px] sm:text-xs font-semibold text-[#c9a227] mb-1">ЦЕНА ОТ</label><input type="number" name="minPrice" defaultValue={params.minPrice || ''} placeholder="0" className="w-full border border-[#c9a227]/40 rounded px-2 py-2 text-xs sm:text-sm bg-black text-white" /></div>
            <div><label className="block text-[10px] sm:text-xs font-semibold text-[#c9a227] mb-1">ЦЕНА ДО</label><input type="number" name="maxPrice" defaultValue={params.maxPrice || ''} placeholder="10000000" className="w-full border border-[#c9a227]/40 rounded px-2 py-2 text-xs sm:text-sm bg-black text-white" /></div>
            <div className="col-span-2 md:col-span-1"><label className="block text-[10px] sm:text-xs font-semibold text-[#c9a227] mb-1">СОРТИРОВКА</label><select name="sort" defaultValue={sort} className="w-full border border-[#c9a227]/40 rounded px-2 py-2 text-xs sm:text-sm bg-black text-white"><option value="new">Сначала новые</option><option value="price-asc">Цена ↑</option><option value="price-desc">Цена ↓</option><option value="year-desc">Год ↑</option></select></div>
            <div className="col-span-2 md:col-span-1 flex gap-2"><button type="submit" className="flex-1 bg-[#c9a227] text-black px-3 py-2 rounded text-xs sm:text-sm font-bold">Применить</button><Link href="/" className="flex-1 text-center border border-[#c9a227]/50 text-[#c9a227] px-3 py-2 rounded text-xs sm:text-sm font-bold">Сброс</Link></div>
          </form>
        </div>
      </section>

      <section id="catalog" className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-20">
        <div className="text-center mb-6 sm:mb-14">
          <p className="text-[#c9a227] tracking-[0.3em] text-[10px] sm:text-xs mb-2">КАТАЛОГ</p>
          <h3 className="text-xl sm:text-4xl font-bold gold-glow">Авто готовые к отправке в РФ</h3>
          <div className="w-16 h-px bg-[#c9a227] mx-auto mt-3"></div>
        </div>
        {cars.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><p>По вашему запросу ничего не найдено</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {cars.map((car: any) => {
              const { make, model, year, price, mileage, image, body_type, country: carCountry } = car;
              let imageUrl = 'https://via.placeholder.com/400x300?text=Нет+фото';
              if (image && Array.isArray(image) && image.length > 0) imageUrl = `https://auto-project-production-ecda.up.railway.app${image[0].url}`;
              else if (image && image.url) imageUrl = `https://auto-project-production-ecda.up.railway.app${image.url}`;
              return (
                <Link href={`/cars/${car.documentId}`} key={car.id} className="group block">
                  <div className="bg-black/70 border border-[#c9a227]/40 rounded-lg overflow-hidden hover:border-[#c9a227] transition">
                    <div className="relative overflow-hidden h-40 sm:h-48">
                      <img src={imageUrl} alt={`${make} ${model}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/80 text-[#c9a227] text-[10px] sm:text-xs px-2 py-1 rounded border border-[#c9a227]/50">{year}</div>
                      {carCountry && <div className="absolute top-2 right-2 bg-[#c9a227] text-black text-[10px] sm:text-xs px-2 py-1 rounded font-bold">{carCountry}</div>}
                    </div>
                    <div className="p-3 sm:p-5">
                      <h4 className="font-bold text-sm sm:text-lg text-white mb-1">{make} {model}</h4>
                      <p className="text-gray-400 text-[10px] sm:text-xs mb-3">{body_type || 'Авто'} • {mileage} км</p>
                      <div className="border-t border-[#c9a227]/30 pt-3 flex justify-between items-center">
                        <span className="font-bold text-[#c9a227] text-sm sm:text-lg">{new Intl.NumberFormat('ru-RU').format(price)} ₽</span>
                        <span className="text-[10px] sm:text-xs text-[#c9a227] font-semibold">Подробнее →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-12 sm:py-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[#c9a227] tracking-[0.3em] text-[10px] sm:text-xs mb-2">БУДЬ В КУРСЕ</p>
            <h3 className="text-2xl sm:text-4xl font-bold gold-glow">Автомобильные новости</h3>
          </div>
          <Link href="/news" className="text-[#c9a227] text-xs sm:text-sm font-semibold border border-[#c9a227]/50 px-4 py-2 rounded whitespace-nowrap">Все →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/news" className="group block"><div className="bg-black/70 border border-[#c9a227]/40 rounded-xl overflow-hidden"><div className="relative overflow-hidden h-40"><img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80" alt="Новость" className="w-full h-full object-cover" /><div className="absolute top-2 left-2 bg-[#c9a227] text-black text-[10px] px-2 py-1 rounded font-bold">НОВИНКИ</div></div><div className="p-4"><p className="text-gray-500 text-[10px] mb-2">18.09.2026</p><h4 className="font-bold text-sm text-white mb-2">Toyota представила обновлённый Land Cruiser 300</h4><p className="text-[#c9a227] text-xs font-semibold">Читать →</p></div></div></Link>
          <Link href="/news" className="group block"><div className="bg-black/70 border border-[#c9a227]/40 rounded-xl overflow-hidden"><div className="relative overflow-hidden h-40"><img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80" alt="Новость" className="w-full h-full object-cover" /><div className="absolute top-2 left-2 bg-[#c9a227] text-black text-[10px] px-2 py-1 rounded font-bold">ЭЛЕКТРО</div></div><div className="p-4"><p className="text-gray-500 text-[10px] mb-2">17.09.2026</p><h4 className="font-bold text-sm text-white mb-2">Китайские электромобили захватывают рынок РФ</h4><p className="text-[#c9a227] text-xs font-semibold">Читать →</p></div></div></Link>
          <Link href="/news" className="group block"><div className="bg-black/70 border border-[#c9a227]/40 rounded-xl overflow-hidden"><div className="relative overflow-hidden h-40"><img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80" alt="Новость" className="w-full h-full object-cover" /><div className="absolute top-2 left-2 bg-[#c9a227] text-black text-[10px] px-2 py-1 rounded font-bold">АНАЛИТИКА</div></div><div className="p-4"><p className="text-gray-500 text-[10px] mb-2">16.09.2026</p><h4 className="font-bold text-sm text-white mb-2">Цены на автомобили в 2027 году: прогноз</h4><p className="text-[#c9a227] text-xs font-semibold">Читать →</p></div></div></Link>
        </div>
      </section>

      <section id="services" className="relative z-10 bg-black/80 backdrop-blur py-10 sm:py-20 px-3 sm:px-6 border-y border-[#c9a227]/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-14"><p className="text-[#c9a227] tracking-[0.3em] text-[10px] sm:text-xs mb-2">ЧТО МЫ ПРЕДЛАГАЕМ</p><h3 className="text-xl sm:text-4xl font-bold gold-glow">Дополнительные услуги</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[
              { icon: '💰', title: 'Деньги под ПТС', text: 'Срочный займ под залог ПТС.' },
              { icon: '🚗', title: 'Выкуп авто', text: 'Срочный выкуп любых марок.' },
              { icon: '📋', title: 'Помощь с оформлением', text: 'Полное сопровождение сделки.' },
              { icon: '🔧', title: 'Доп. оборудование', text: 'Установка в Китае.' },
              { icon: '✨', title: 'Детейлинг в Китае', text: 'Полировка, керамика.' },
              { icon: '🚚', title: 'Доставка по РФ', text: 'В любой регион России.' },
            ].map((s, i) => (
              <div key={i} className="bg-black border border-[#c9a227]/40 p-4 sm:p-8 rounded-lg">
                <div className="text-3xl sm:text-5xl mb-2 sm:mb-4">{s.icon}</div>
                <h4 className="text-base sm:text-xl font-bold text-[#c9a227] mb-2">{s.title}</h4>
                <p className="text-gray-400 text-xs sm:text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 py-10 sm:py-20 px-4 sm:px-6 bg-black/70 backdrop-blur">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8"><p className="text-[#c9a227] tracking-[0.3em] text-[10px] sm:text-xs mb-2">О КОМПАНИИ</p><h3 className="text-2xl sm:text-4xl font-bold gold-glow">AUTOLUX42</h3></div>
          <p className="text-gray-300 leading-relaxed mb-6 text-center text-sm sm:text-base">AUTOLUX42 — специализированная компания по подбору, проверке и доставке автомобилей из Китая, Кореи и Японии. Более 15 лет на рынке.</p>
          <p className="text-[#c9a227] italic text-center text-base sm:text-xl font-semibold mb-8">«Ваши проблемы — для нас не проблема.<br/> Просто доверьтесь нам!»</p>
          <div className="border border-[#c9a227]/40 rounded-lg p-4 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-black/60">
            <div><p className="text-2xl sm:text-4xl font-bold text-[#c9a227]">15+</p><p className="text-[10px] sm:text-sm text-gray-400">лет на рынке</p></div>
            <div><p className="text-2xl sm:text-4xl font-bold text-[#c9a227]">100%</p><p className="text-[10px] sm:text-sm text-gray-400">закрытых сделок</p></div>
            <div><p className="text-2xl sm:text-4xl font-bold text-[#c9a227]">3000+</p><p className="text-[10px] sm:text-sm text-gray-400">доставленных авто</p></div>
            <div><p className="text-2xl sm:text-4xl font-bold text-[#c9a227]">РФ</p><p className="text-[10px] sm:text-sm text-gray-400">доставка везде</p></div>
          </div>
        </div>
      </section>

      <section id="callback" className="relative z-10 bg-black/90 backdrop-blur py-10 sm:py-20 px-4 sm:px-6 border-t border-[#c9a227]/40">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#c9a227] tracking-[0.3em] text-[10px] sm:text-xs mb-2">ОБРАТНАЯ СВЯЗЬ</p>
          <h3 className="text-xl sm:text-3xl font-bold mb-3 gold-glow">Оставить заявку</h3>
          <p className="text-gray-400 mb-6 text-sm">Введите имя и телефон — мы перезвоним</p>
          <CallbackForm />
        </div>
      </section>

      <section id="contacts" className="relative z-10 bg-black/95 backdrop-blur py-10 sm:py-20 px-4 sm:px-6 border-t border-[#c9a227]/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8"><p className="text-[#c9a227] tracking-[0.3em] text-[10px] sm:text-xs mb-2">КОНТАКТЫ</p><h3 className="text-2xl sm:text-4xl font-bold gold-glow">СВЯЗЬ С НАМИ</h3></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-black/80 border border-[#c9a227]/50 p-4 sm:p-6 rounded-lg">
              <p className="text-[#c9a227] text-[10px] mb-2">НОВОСИБИРСК · КРАСНОЯРСК · ОМСК</p>
              <a href="tel:+79675978888" className="text-lg sm:text-2xl font-bold block mb-3 text-white">+7 967 597 88 88</a>
              <div className="grid grid-cols-3 gap-2">
                <a href="https://wa.me/79675978888" target="_blank" className="text-center border border-green-600 text-green-500 text-[10px] py-2 rounded font-semibold">WhatsApp</a>
                <a href="https://t.me/+79675978888" target="_blank" className="text-center border border-sky-500 text-sky-400 text-[10px] py-2 rounded font-semibold">Telegram</a>
                <a href="https://max.ru/79675978888" target="_blank" className="text-center border border-purple-500 text-purple-400 text-[10px] py-2 rounded font-semibold">MAX</a>
              </div>
            </div>
            <div className="bg-black/80 border border-[#c9a227]/50 p-4 sm:p-6 rounded-lg">
              <p className="text-[#c9a227] text-[10px] mb-2">КЕМЕРОВО · АЛТАЙ · ХАКАСИЯ</p>
              <a href="tel:+79963338606" className="text-lg sm:text-2xl font-bold block mb-3 text-white">8 996 333 86 06</a>
              <div className="grid grid-cols-3 gap-2">
                <a href="https://wa.me/79963338606" target="_blank" className="text-center border border-green-600 text-green-500 text-[10px] py-2 rounded font-semibold">WhatsApp</a>
                <a href="https://t.me/+79963338606" target="_blank" className="text-center border border-sky-500 text-sky-400 text-[10px] py-2 rounded font-semibold">Telegram</a>
                <a href="https://max.ru/79963338606" target="_blank" className="text-center border border-purple-500 text-purple-400 text-[10px] py-2 rounded font-semibold">MAX</a>
              </div>
            </div>
            <div className="bg-black/80 border border-[#c9a227]/50 p-4 sm:p-6 rounded-lg">
              <p className="text-[#c9a227] text-[10px] mb-2">КЕМЕРОВО · АЛТАЙ · ХАКАСИЯ</p>
              <a href="tel:+79095147778" className="text-lg sm:text-2xl font-bold block mb-3 text-white">8 909 514 77 78</a>
              <div className="grid grid-cols-3 gap-2">
                <a href="https://wa.me/79095147778" target="_blank" className="text-center border border-green-600 text-green-500 text-[10px] py-2 rounded font-semibold">WhatsApp</a>
                <a href="https://t.me/+79095147778" target="_blank" className="text-center border border-sky-500 text-sky-400 text-[10px] py-2 rounded font-semibold">Telegram</a>
                <a href="https://max.ru/79095147778" target="_blank" className="text-center border border-purple-500 text-purple-400 text-[10px] py-2 rounded font-semibold">MAX</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 bg-black text-gray-500 text-center py-6 text-xs border-t border-[#c9a227]/40">
        <p className="font-bold text-[#c9a227] mb-2 text-base gold-glow">👑 AUTOLUX42</p>
        <p className="text-[10px]">© 2026 Все права защищены</p>
      </footer>
    </main>
  );
}