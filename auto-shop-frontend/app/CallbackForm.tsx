'use client';
import { useState } from 'react';

export default function CallbackForm({ car }: { car?: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ text: 'Отправляем...', type: 'info' });

    try {
      const res = await fetch('/api/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, car }),
      });

      if (res.ok) {
        setStatus({ text: '✅ Заявка отправлена! Мы скоро свяжемся с вами.', type: 'success' });
        setName('');
        setPhone('');
      } else {
        setStatus({ text: '❌ Ошибка. Попробуйте ещё раз.', type: 'error' });
      }
    } catch {
      setStatus({ text: '❌ Ошибка сети.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
          required
          className="w-full bg-[#111] border border-[#c9a227]/40 rounded px-4 py-3 text-white text-sm sm:text-base placeholder-gray-600 focus:border-[#c9a227] outline-none"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ваш телефон"
          required
          className="w-full bg-[#111] border border-[#c9a227]/40 rounded px-4 py-3 text-white text-sm sm:text-base placeholder-gray-600 focus:border-[#c9a227] outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c9a227] text-black font-bold py-3 sm:py-4 rounded text-sm sm:text-base tracking-wider hover:bg-[#e0b83a] transition disabled:opacity-50"
        >
          {loading ? 'ОТПРАВЛЯЕМ...' : '📞 ЗАКАЗАТЬ ЗВОНОК'}
        </button>
      </form>
      {status && (
        <p className={`mt-4 text-sm ${
          status.type === 'success' ? 'text-green-400 font-semibold' :
          status.type === 'error' ? 'text-red-400' : 'text-gray-400'
        }`}>
          {status.text}
        </p>
      )}
    </div>
  );
}