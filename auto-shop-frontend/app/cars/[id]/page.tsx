import Link from 'next/link';
import Gallery from './Gallery';
import CallbackForm from '../../CallbackForm';

async function getCar(id: string) {
  const res = await fetch(`https://auto-project-production-ecda.up.railway.app/api/cars/${id}?populate=*`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Машина не найдена');
  const data = await res.json();
  return data.data;
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
        <div className="bg-[#111] border border-[#c9a227]/40 p-10 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Машина не найдена</h1>
          <Link href="/" className="bg-[#c9a227] text-black px-6 py-3 rounded-lg inline-block font-bold">← Вернуться на главную</Link>
        </div>
      </main>
    );
  }

  const { make, model, year, price, mileage, description, image,
    color, engine_volume, engine_power, drivetrain, transmission,
    condition, body_type, country } = car;

  let rawImages = [];
  if (image && Array.isArray(image)) rawImages = image;
  else if (image && image.url) rawImages = [image];

  const images = rawImages.map((img: any) => `https://auto-project-production-ecda.up.railway.app${img.url}`);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: 'var(--font-oswald)' }}>

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

      <div className="bg-black border-b border-[#c9a227]/40 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:text-[#c9a227] transition font-semibold tracking-wider text-sm">← НАЗАД К КАТАЛОГУ</Link>
          <div className="hidden md:flex gap-6 text-sm tracking-wider">
            <Link href="/" className="hover:text-[#c9a227] transition">Главная</Link>
            <Link href="/#catalog" className="hover:text-[#c9a227] transition">Авто в РФ</Link>
            <a href="/#contacts" className="hover:text-[#c9a227] transition">Контакты</a>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-10 flex justify-center">
        <div className="bg-[#111] rounded-2xl shadow-2xl overflow-hidden max-w-6xl w-full border border-[#c9a227]/30">

          <Gallery images={images} alt={`${make} ${model}`} />

          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{make} {model}</h1>
                {country && <span className="bg-[#c9a227] text-black text-xs px-3 py-1 rounded font-bold tracking-wider">{country}</span>}
              </div>
              <p className="text-gray-400 text-lg mb-8">{year} год • Пробег: {mileage} км</p>

              <div className="bg-black/60 p-6 rounded-xl mb-8 border border-[#c9a227]/30">
                <h2 className="text-xl font-bold mb-4 border-b border-[#c9a227]/30 pb-2 text-[#c9a227] tracking-wider">ХАРАКТЕРИСТИКИ</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div><p className="text-gray-500 text-sm">Год выпуска</p><p className="font-semibold text-white">{year}</p></div>
                  <div><p className="text-gray-500 text-sm">Пробег</p><p className="font-semibold text-white">{mileage} км</p></div>
                  <div><p className="text-gray-500 text-sm">Марка</p><p className="font-semibold text-white">{make}</p></div>
                  <div><p className="text-gray-500 text-sm">Модель</p><p className="font-semibold text-white">{model}</p></div>
                  {body_type && <div><p className="text-gray-500 text-sm">Тип кузова</p><p className="font-semibold text-white">{body_type}</p></div>}
                  {color && <div><p className="text-gray-500 text-sm">Цвет</p><p className="font-semibold text-white">{color}</p></div>}
                  {engine_volume && <div><p className="text-gray-500 text-sm">Объём двигателя</p><p className="font-semibold text-white">{engine_volume} л</p></div>}
                  {engine_power && <div><p className="text-gray-500 text-sm">Мощность</p><p className="font-semibold text-white">{engine_power} л.с.</p></div>}
                  {drivetrain && <div><p className="text-gray-500 text-sm">Привод</p><p className="font-semibold text-white">{drivetrain}</p></div>}
                  {transmission && <div><p className="text-gray-500 text-sm">КПП</p><p className="font-semibold text-white">{transmission}</p></div>}
                  {condition && <div><p className="text-gray-500 text-sm">Состояние</p><p className="font-semibold text-white">{condition}</p></div>}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b border-[#c9a227]/30 pb-2 text-[#c9a227] tracking-wider">ОПИСАНИЕ ОТ ПРОДАВЦА</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#1a1408] to-black p-6 rounded-2xl sticky top-24 shadow-xl border border-[#c9a227]/40">
                <p className="text-3xl font-extrabold mb-6 text-[#c9a227]">{new Intl.NumberFormat('ru-RU').format(price)} ₽</p>

                <a href="#zayavka" className="block w-full text-center bg-[#c9a227] text-black text-lg font-bold py-4 rounded-xl hover:bg-[#e0b83a] transition mb-6 tracking-wider">
                  📞 ОСТАВИТЬ ЗАЯВКУ
                </a>

                <p className="text-sm text-gray-500 mb-3 tracking-widest">СВЯЗАТЬСЯ С НАМИ:</p>

                <div className="mb-4 bg-black/50 p-3 rounded border border-[#c9a227]/30">
                  <p className="text-[10px] text-[#c9a227] mb-1 tracking-wider">НОВОСИБИРСК · КРАСНОЯРСК · ОМСК</p>
                  <p className="text-white font-bold mb-2 text-sm">📱 +7 967 597 88 88</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href="https://wa.me/79675978888" target="_blank" className="text-center border border-green-600 text-green-500 hover:bg-green-600 hover:text-white text-xs py-2 rounded font-semibold transition">WhatsApp</a>
                    <a href="https://t.me/+79675978888" target="_blank" className="text-center border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white text-xs py-2 rounded font-semibold transition">Telegram</a>
                    <a href="https://max.ru/u/79675978888" target="_blank" className="text-center border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-xs py-2 rounded font-semibold transition">MAX</a>
                  </div>
                </div>

                <div className="mb-4 bg-black/50 p-3 rounded border border-[#c9a227]/30">
                  <p className="text-[10px] text-[#c9a227] mb-1 tracking-wider">КЕМЕРОВО · АЛТАЙ · ХАКАСИЯ</p>
                  <p className="text-white font-bold mb-2 text-sm">📱 8 996 333 86 06</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href="https://wa.me/79963338606" target="_blank" className="text-center border border-green-600 text-green-500 hover:bg-green-600 hover:text-white text-xs py-2 rounded font-semibold transition">WhatsApp</a>
                    <a href="https://t.me/+79963338606" target="_blank" className="text-center border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white text-xs py-2 rounded font-semibold transition">Telegram</a>
                    <a href="https://max.ru/u/79963338606" target="_blank" className="text-center border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-xs py-2 rounded font-semibold transition">MAX</a>
                  </div>
                </div>

                <div className="mb-6 bg-black/50 p-3 rounded border border-[#c9a227]/30">
                  <p className="text-[10px] text-[#c9a227] mb-1 tracking-wider">КЕМЕРОВО · АЛТАЙ · ХАКАСИЯ</p>
                  <p className="text-white font-bold mb-2 text-sm">📱 8 909 514 77 78</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href="https://wa.me/79095147778" target="_blank" className="text-center border border-green-600 text-green-500 hover:bg-green-600 hover:text-white text-xs py-2 rounded font-semibold transition">WhatsApp</a>
                    <a href="https://t.me/+79095147778" target="_blank" className="text-center border border-sky-500 text-sky-400 hover:bg-sky-500 hover:text-white text-xs py-2 rounded font-semibold transition">Telegram</a>
                    <a href="https://max.ru/u/79095147778" target="_blank" className="text-center border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-xs py-2 rounded font-semibold transition">MAX</a>
                  </div>
                </div>

                <div className="border-t border-[#c9a227]/30 pt-4">
                  <p className="text-sm text-gray-500 mb-1">Продавец:</p>
                  <p className="font-bold text-[#c9a227] text-lg mb-2 tracking-wider">👑 AUTOLUX42</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Поможем с выбором, оформлением и доставкой автомобиля из Китая, Кореи и Японии. Работаем с любыми бюджетами.</p>
                </div>
              </div>
            </div>

          </div>

          <div id="zayavka" className="bg-black/90 border-t border-[#c9a227]/40 py-10 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-[#c9a227] tracking-[0.3em] text-xs mb-2">ОБРАТНАЯ СВЯЗЬ</p>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 gold-glow">Оставить заявку</h3>
              <p className="text-gray-400 mb-6 text-sm">Введите имя и телефон — мы перезвоним в течение 15 минут</p>
              <CallbackForm car={`${make} ${model} (${year})`} />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}