import Link from 'next/link';

interface SearchParams {
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
}

async function getCars() {
  const res = await fetch('http://localhost:1337/api/cars?populate=*', { cache: 'no-store' });
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
    <main className="luxury-bg text-white" style={{ fontFamily: 'var(--font-oswald)' }}>

      {/* МИГАЮЩИЙ БАННЕР */}
      <a href="#promo" className="gold-pulse block text-center py-3 px-4 text-[#0a1f44] font-bold text-sm md:text-base tracking-wide cursor-pointer">
        🔥 АКЦИЯ! СКИДКИ ОТ 20 000 ДО 60 000 ₽ — ДО 31.12.2026 🔥
      </a>

      {/* ШАПКА */}
      <header className="bg-[#061530]/90 backdrop-blur border-b border-[#c9a227]/30 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">👑</span>
            <span className="text-2xl font-bold tracking-widest text-[#c9a227] gold-glow">AUTOLUX42</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/" className="hover:text-[#c9a227] transition">Главная</Link>
            <a href="#catalog" className="hover:text-[#c9a227] transition">Список авто</a>
            <a href="#promo" className="hover:text-[#c9a227] transition">Акции</a>
            <a href="#about" className="hover:text-[#c9a227] transition">О нас</a>
            <a href="#contacts" className="hover:text-[#c9a227] transition">Контакты</a>
          </nav>
        </div>
      </header>

      {/* ГЕРОЙ-БЛОК В СТИЛЕ ПОСТЕРА */}
      <section className="relative py-20 px-6 overflow-hidden fade-in-up">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">

          <div className="text-left">
            <p className="text-[#c9a227] tracking-[0.3em] text-xs mb-3">ЛУЧШИЕ АВТОМОБИЛИ С МИРОВЫХ РЫНКОВ</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 leading-tight">
              АВТОМОБИЛИ<br/>
              <span className="text-[#c9a227] gold-glow">ПОД ЗАКАЗ</span>
            </h2>
            <p className="text-blue-200 tracking-widest text-sm mb-8">ЯПОНИЯ / КОРЕЯ / КИТАЙ</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">🛡️</span>
                <div>
                  <p className="font-semibold text-white">Проверенные авто</p>
                  <p className="text-xs text-blue-200">Без скрытых дефектов</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">🚚</span>
                <div>
                  <p className="font-semibold text-white">Быстрая доставка</p>
                  <p className="text-xs text-blue-200">По всей России</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#c9a227] text-xl">📋</span>
                <div>
                  <p className="font-semibold text-white">Полное сопровождение</p>
                  <p className="text-xs text-blue-200">От подбора до постановки на учёт</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center lg:col-span-1">
            <div className="text-6xl mb-3">👑</div>
            <h1 className="text-4xl md:text-5xl font-black tracking-widest text-[#c9a227] gold-glow mb-2">
              AUTOLUX42
            </h1>
            <p className="text-white tracking-[0.4em] text-xs mb-8">АВТО ПОД ЗАКАЗ</p>

            <a href="#contacts" className="inline-block bg-[#c9a227] text-[#0a1f44] px-8 py-4 rounded font-bold tracking-wide hover:bg-[#e0b83a] transition shadow-lg">
              📞 СВЯЖИТЕСЬ С НАМИ
            </a>
          </div>

          <div className="text-right lg:text-right">
            <p className="text-[#c9a227] tracking-widest text-xs mb-4">ВЫГОДНЫЕ УСЛОВИЯ ДЛЯ КАЖДОГО КЛИЕНТА</p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="border border-[#c9a227]/30 p-3 rounded bg-[#061530]/50">
                <p className="font-bold text-white">TOYOTA</p>
                <p className="text-xs text-blue-200">Надёжность</p>
              </div>
              <div className="border border-[#c9a227]/30 p-3 rounded bg-[#061530]/50">
                <p className="font-bold text-white">HAVAL</p>
                <p className="text-xs text-blue-200">Технологии</p>
              </div>
              <div className="border border-[#c9a227]/30 p-3 rounded bg-[#061530]/50">
                <p className="font-bold text-white">MERCEDES</p>
                <p className="text-xs text-blue-200">Премиум</p>
              </div>
              <div className="border border-[#c9a227]/30 p-3 rounded bg-[#061530]/50">
                <p className="font-bold text-white">HONDA</p>
                <p className="text-xs text-blue-200">Динамика</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ФИЛЬТРЫ */}
      <section className="bg-[#061530]/80 backdrop-blur border-y border-[#c9a227]/20 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <form method="GET" action="/" className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-[#c9a227] mb-1">Страна производства</label>
              <select name="country" defaultValue={country} className="w-full border border-[#c9a227]/30 rounded px-3 py-2 text-sm bg-[#0a1f44] text-white">
                <option value="">Все страны</option>
                <option value="Китай">Китай</option>
                <option value="Корея">Корея</option>
                <option value="Япония">Япония</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c9a227] mb-1">Цена от, ₽</label>
              <input type="number" name="minPrice" defaultValue={params.minPrice || ''} placeholder="0" className="w-full border border-[#c9a227]/30 rounded px-3 py-2 text-sm bg-[#0a1f44] text-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c9a227] mb-1">Цена до, ₽</label>
              <input type="number" name="maxPrice" defaultValue={params.maxPrice || ''} placeholder="10000000" className="w-full border border-[#c9a227]/30 rounded px-3 py-2 text-sm bg-[#0a1f44] text-white placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#c9a227] mb-1">Сортировка</label>
              <select name="sort" defaultValue={sort} className="w-full border border-[#c9a227]/30 rounded px-3 py-2 text-sm bg-[#0a1f44] text-white">
                <option value="new">Сначала новые</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="year-desc">Год: сначала новые</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#c9a227] hover:bg-[#e0b83a] text-[#0a1f44] px-4 py-2 rounded text-sm font-bold transition">Применить</button>
              <Link href="/" className="flex-1 text-center bg-transparent border border-[#c9a227]/50 text-[#c9a227] hover:bg-[#c9a227] hover:text-[#0a1f44] px-4 py-2 rounded text-sm font-bold transition">Сброс</Link>
            </div>
          </form>
        </div>
      </section>

      {/* КАТАЛОГ */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-[#c9a227] border-l-4 border-[#c9a227] pl-4 gold-glow">Автомобили в наличии</h3>
          <span className="text-sm text-blue-200">Найдено: {cars.length}</span>
        </div>

        {cars.length === 0 ? (
          <div className="text-center py-20 text-blue-200">
            <p className="text-lg">По вашему запросу ничего не найдено</p>
            <Link href="/" className="text-[#c9a227] underline mt-2 inline-block">Сбросить фильтры</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {cars.map((car: any) => {
              const { make, model, year, price, mileage, image, body_type, country: carCountry } = car;
              let imageUrl = 'https://via.placeholder.com/400x300?text=Нет+фото';
              if (image && Array.isArray(image) && image.length > 0) imageUrl = `http://localhost:1337${image[0].url}`;
              else if (image && image.url) imageUrl = `http://localhost:1337${image.url}`;

              return (
                <Link href={`/cars/${car.documentId}`} key={car.id} className="group block">
                  <div className="bg-[#0a1f44] border border-[#c9a227]/30 rounded-lg overflow-hidden hover:border-[#c9a227] hover:shadow-[0_0_30px_rgba(201,162,39,0.3)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative overflow-hidden h-40">
                      <img src={imageUrl} alt={`${make} ${model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 bg-[#0a1f44] text-white text-xs px-2 py-1 rounded border border-[#c9a227]/50">{year}</div>
                      {carCountry && <div className="absolute top-2 right-2 bg-[#c9a227] text-[#0a1f44] text-xs px-2 py-1 rounded font-bold">{carCountry}</div>}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-base text-white mb-1 truncate">{make} {model}</h4>
                      <p className="text-blue-200 text-xs mb-3">{body_type || 'Авто'} • {mileage} км</p>
                      <div className="border-t border-[#c9a227]/20 pt-3 flex justify-between items-center">
                        <span className="font-bold text-[#c9a227]">{new Intl.NumberFormat('ru-RU').format(price)} ₽</span>
                        <span className="text-xs text-[#c9a227] font-semibold group-hover:underline">Подробнее →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* АКЦИИ */}
      <section id="promo" className="bg-gradient-to-r from-[#c9a227] to-[#e0b83a] py-14 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#0a1f44] tracking-widest text-sm font-semibold mb-3">🔥 ОГРАНИЧЕННОЕ ПРЕДЛОЖЕНИЕ</p>
          <h3 className="text-4xl md:text-5xl font-bold text-[#0a1f44] mb-4">Скидки от 20 000 до 60 000 ₽</h3>
          <p className="text-[#0a1f44] text-lg mb-2 font-semibold">на заказ любого автомобиля из Китая, Кореи и Японии</p>
          <p className="text-[#0a1f44]/80 mb-8">Акция действует до <strong>31.12.2026</strong>.</p>
          <a href="https://wa.me/79963338606?text=Здравствуйте!%20Хочу%20воспользоваться%20акцией." target="_blank" className="inline-block bg-[#0a1f44] text-white px-8 py-4 rounded font-semibold hover:bg-[#15316b] transition shadow-lg">
            💬 Оставить заявку в WhatsApp
          </a>
        </div>
      </section>

      {/* О НАС */}
      <section id="about" className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-[#c9a227] mb-4 gold-glow">О компании AUTOLUX42</h3>
            <div className="w-16 h-1 bg-[#c9a227] mx-auto"></div>
          </div>
          <p className="text-blue-100 leading-relaxed mb-6 text-center max-w-4xl mx-auto">
            AUTOLUX42 — специализированная компания по подбору, проверке и доставке автомобилей из Китая, Кореи и Японии. Мы работаем на рынке более 15 лет и зарекомендовали себя как надёжный партнёр для тысяч клиентов по всей России.
          </p>
          <div className="bg-[#061530]/80 border border-[#c9a227]/30 rounded-lg p-6 mb-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><p className="text-3xl font-bold text-[#c9a227] mb-1">15+</p><p className="text-sm text-blue-100">лет на рынке</p></div>
            <div><p className="text-3xl font-bold text-[#c9a227] mb-1">100%</p><p className="text-sm text-blue-100">закрытых сделок</p></div>
            <div><p className="text-3xl font-bold text-[#c9a227] mb-1">3000+</p><p className="text-sm text-blue-100">доставленных авто</p></div>
            <div><p className="text-3xl font-bold text-[#c9a227] mb-1">РФ</p><p className="text-sm text-blue-100">доставка в любой регион</p></div>
          </div>
        </div>
      </section>

      {/* КОНТАКТЫ */}
      <section id="contacts" className="bg-[#061530]/90 border-t border-[#c9a227]/30 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 text-[#c9a227] gold-glow">Свяжитесь с нами</h3>
            <div className="w-16 h-1 bg-[#c9a227] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-[#0a1f44] p-6 rounded-lg border border-[#c9a227]/30">
              <p className="text-[#c9a227] text-sm tracking-widest mb-2">ТЕЛЕФОН 1</p>
              <a href="tel:+79963338606" className="text-2xl font-bold block mb-4 text-white hover:text-[#c9a227] transition">📞 8 996 333 86 06</a>
              <div className="grid grid-cols-3 gap-2">
                <a href="https://wa.me/79963338606" target="_blank" className="text-center bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded font-semibold">WhatsApp</a>
                <a href="https://t.me/+79963338606" target="_blank" className="text-center bg-sky-500 hover:bg-sky-600 text-white text-xs py-2 rounded font-semibold">Telegram</a>
                <a href="https://max.ru/u/79963338606" target="_blank" className="text-center bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded font-semibold">MAX</a>
              </div>
            </div>

            <div className="bg-[#0a1f44] p-6 rounded-lg border border-[#c9a227]/30">
              <p className="text-[#c9a227] text-sm tracking-widest mb-2">ТЕЛЕФОН 2</p>
              <a href="tel:+79095147778" className="text-2xl font-bold block mb-4 text-white hover:text-[#c9a227] transition">📞 8 909 514 77 78</a>
              <div className="grid grid-cols-3 gap-2">
                <a href="https://wa.me/79095147778" target="_blank" className="text-center bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded font-semibold">WhatsApp</a>
                <a href="https://t.me/+79095147778" target="_blank" className="text-center bg-sky-500 hover:bg-sky-600 text-white text-xs py-2 rounded font-semibold">Telegram</a>
                <a href="https://max.ru/u/79095147778" target="_blank" className="text-center bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded font-semibold">MAX</a>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-[#c9a227] text-sm tracking-widest mb-4">НАШИ КАНАЛЫ</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://vk.ru/podborauto_42" target="_blank" className="bg-[#c9a227] text-[#0a1f44] px-8 py-3 rounded font-bold hover:bg-[#e0b83a] transition">ВКонтакте</a>
              <a href="https://t.me/avtolux42" target="_blank" className="bg-[#c9a227] text-[#0a1f44] px-8 py-3 rounded font-bold hover:bg-[#e0b83a] transition">Telegram-канал</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#061530] text-blue-200 text-center py-6 text-sm border-t border-[#c9a227]/30">
        <p className="font-bold text-[#c9a227] mb-1">👑 AUTOLUX42</p>
        <p className="text-xs">© 2026 Все права защищены</p>
      </footer>

    </main>
  );
}