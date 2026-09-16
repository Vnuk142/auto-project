import Link from 'next/link';

async function getCar(id: string) {
  const res = await fetch(`http://localhost:1337/api/cars/${id}?populate=*`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Машина не найдена');
  const data = await res.json();
  return data.data;
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCar(id);

  if (!car) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Машина не найдена</h1>
          <Link href="/" className="bg-[#0a1f44] text-white px-6 py-3 rounded-lg inline-block hover:bg-[#15316b] transition">← Вернуться на главную</Link>
        </div>
      </main>
    );
  }

  const { 
    make, model, year, price, mileage, description, image,
    color, engine_volume, engine_power, drivetrain, transmission,
    condition, body_type, country
  } = car;
  
  let images = [];
  if (image && Array.isArray(image)) images = image;
  else if (image && image.url) images = [image];

  return (
    <main className="min-h-screen bg-gray-100" style={{ fontFamily: 'var(--font-oswald)' }}>

      {/* ВЕРХНЯЯ ПАНЕЛЬ С КНОПКАМИ НАВИГАЦИИ */}
      <div className="bg-[#0a1f44] text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:text-[#c9a227] transition font-semibold">
            ← Назад к каталогу
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="hover:text-[#c9a227] transition">Главная</Link>
            <Link href="/#catalog" className="hover:text-[#c9a227] transition">Список авто</Link>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 flex justify-center">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl w-full">

          {/* Галерея фото */}
          <div className="flex gap-3 p-4 overflow-x-auto bg-gray-50 border-b">
            {images.length > 0 ? (
              images.map((img: any, index: number) => (
                <img key={index} src={`http://localhost:1337${img.url}`} alt={`${make} ${model}`} className="w-80 h-60 object-cover rounded-xl shadow-sm flex-shrink-0" />
              ))
            ) : (
              <div className="w-full h-60 bg-gray-200 flex items-center justify-center text-gray-500 rounded-xl">Нет фото</div>
            )}
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-[#0a1f44]">{make} {model}</h1>
                {country && <span className="bg-[#c9a227] text-[#0a1f44] text-xs px-3 py-1 rounded font-bold">{country}</span>}
              </div>
              <p className="text-gray-500 text-lg mb-8">{year} год • Пробег: {mileage} км</p>

              <div className="bg-gray-50 p-6 rounded-xl mb-8 border">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-[#0a1f44]">Характеристики</h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div><p className="text-gray-500 text-sm">Год выпуска</p><p className="font-semibold text-gray-900">{year}</p></div>
                  <div><p className="text-gray-500 text-sm">Пробег</p><p className="font-semibold text-gray-900">{mileage} км</p></div>
                  <div><p className="text-gray-500 text-sm">Марка</p><p className="font-semibold text-gray-900">{make}</p></div>
                  <div><p className="text-gray-500 text-sm">Модель</p><p className="font-semibold text-gray-900">{model}</p></div>
                  {body_type && <div><p className="text-gray-500 text-sm">Тип кузова</p><p className="font-semibold text-gray-900">{body_type}</p></div>}
                  {color && <div><p className="text-gray-500 text-sm">Цвет</p><p className="font-semibold text-gray-900">{color}</p></div>}
                  {engine_volume && <div><p className="text-gray-500 text-sm">Объём двигателя</p><p className="font-semibold text-gray-900">{engine_volume} л</p></div>}
                  {engine_power && <div><p className="text-gray-500 text-sm">Мощность</p><p className="font-semibold text-gray-900">{engine_power} л.с.</p></div>}
                  {drivetrain && <div><p className="text-gray-500 text-sm">Привод</p><p className="font-semibold text-gray-900">{drivetrain}</p></div>}
                  {transmission && <div><p className="text-gray-500 text-sm">КПП</p><p className="font-semibold text-gray-900">{transmission}</p></div>}
                  {condition && <div><p className="text-gray-500 text-sm">Состояние</p><p className="font-semibold text-gray-900">{condition}</p></div>}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4 border-b pb-2 text-[#0a1f44]">Описание от продавца</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#0a1f44] text-white p-6 rounded-2xl sticky top-24 shadow-xl">
                <p className="text-3xl font-extrabold mb-6 text-[#c9a227]">{new Intl.NumberFormat('ru-RU').format(price)} ₽</p>
                <p className="text-sm text-gray-300 mb-3">Связаться с нами:</p>

                <div className="mb-4">
                  <p className="text-white font-bold mb-2">📱 8 996 333 86 06</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href="https://wa.me/79963338606" target="_blank" className="text-center bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded font-semibold">WhatsApp</a>
                    <a href="https://t.me/+79963338606" target="_blank" className="text-center bg-sky-500 hover:bg-sky-600 text-white text-xs py-2 rounded font-semibold">Telegram</a>
                    <a href="https://max.ru/u/79963338606" target="_blank" className="text-center bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded font-semibold">MAX</a>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-white font-bold mb-2">📱 8 909 514 77 78</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a href="https://wa.me/79095147778" target="_blank" className="text-center bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded font-semibold">WhatsApp</a>
                    <a href="https://t.me/+79095147778" target="_blank" className="text-center bg-sky-500 hover:bg-sky-600 text-white text-xs py-2 rounded font-semibold">Telegram</a>
                    <a href="https://max.ru/u/79095147778" target="_blank" className="text-center bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded font-semibold">MAX</a>
                  </div>
                </div>

                <a href="tel:+79963338606" className="block w-full text-center bg-[#c9a227] text-[#0a1f44] text-lg font-bold py-3 rounded-xl hover:bg-[#e0b83a] transition mb-6">
                  📞 Позвонить
                </a>

                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-gray-400 mb-1">Продавец:</p>
                  <p className="font-bold text-white text-lg mb-3">👑 AUTOLUX42</p>
                  <p className="text-xs text-gray-400 leading-relaxed">Поможем с выбором, оформлением и доставкой автомобиля из Китая, Кореи и Японии.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}