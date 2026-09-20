import Link from 'next/link';

const news = [
  { id: 1, title: 'Toyota представила обновлённый Land Cruiser 300', date: '18.09.2026', category: 'Новинки', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', excerpt: 'Японский производитель анонсировал рестайлинг флагманского внедорожника.' },
  { id: 2, title: 'Китайские электромобили захватывают рынок РФ', date: '17.09.2026', category: 'Электромобили', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80', excerpt: 'Доля электрокаров из Китая выросла на 47%.' },
  { id: 3, title: 'Цены на автомобили в 2027 году: прогноз', date: '16.09.2026', category: 'Аналитика', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80', excerpt: 'Аналитики дали прогноз по ценам.' },
  { id: 4, title: 'Как выбрать б/у автомобиль из Кореи', date: '15.09.2026', category: 'Советы', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80', excerpt: 'Разбираем ключевые моменты проверки.' },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: 'var(--font-oswald)' }}>
      <div className="bg-black border-b border-[#c9a227]/40 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="hover:text-[#c9a227] font-semibold text-sm">← НА ГЛАВНУЮ</Link>
          <Link href="/" className="text-[#c9a227] font-bold tracking-widest text-lg">👑 AUTOLUX42</Link>
        </div>
      </div>
      <section className="text-center py-12 px-4">
        <p className="text-[#c9a227] tracking-[0.5em] text-xs mb-3">АВТОМОБИЛЬНЫЕ</p>
        <h1 className="text-4xl sm:text-5xl font-bold gold-glow mb-4">НОВОСТИ</h1>
        <div className="w-20 h-px bg-[#c9a227] mx-auto"></div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="relative overflow-hidden rounded-2xl border border-[#c9a227]/40">
          <img src={news[0].image} alt={news[0].title} className="w-full h-64 sm:h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#c9a227] text-black text-xs px-3 py-1 rounded font-bold">{news[0].category}</span>
              <span className="text-gray-400 text-xs">{news[0].date}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-3">{news[0].title}</h2>
            <p className="text-gray-300 text-sm sm:text-base">{news[0].excerpt}</p>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(1).map((item) => (
            <div key={item.id} className="bg-black/70 border border-[#c9a227]/40 rounded-xl overflow-hidden">
              <div className="relative overflow-hidden h-48">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-black/80 text-[#c9a227] text-xs px-3 py-1 rounded border border-[#c9a227]/50">{item.category}</div>
              </div>
              <div className="p-5">
                <p className="text-gray-500 text-xs mb-2">{item.date}</p>
                <h3 className="font-bold text-base mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="bg-black text-gray-500 text-center py-6 text-xs border-t border-[#c9a227]/40">
        <p className="font-bold text-[#c9a227] mb-2 text-base">👑 AUTOLUX42</p>
        <p className="text-[10px]">© 2026</p>
      </footer>
    </main>
  );
}