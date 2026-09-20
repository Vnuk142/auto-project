import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, car } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || '';

    if (!botToken || !chatIdsRaw) {
      return NextResponse.json({ error: 'Не настроен Telegram' }, { status: 500 });
    }

    const chatIds = chatIdsRaw.split(',').map((id) => id.trim()).filter(Boolean);

    let text = `🔔 НОВАЯ ЗАЯВКА С САЙТА AUTOLUX42!\n\n`;
    text += `👤 Имя: ${name}\n`;
    text += `📞 Телефон: ${phone}\n`;
    if (car) text += `🚗 Автомобиль: ${car}\n`;
    text += `\n⏰ ${new Date().toLocaleString('ru-RU')}`;

    const results = [];
    for (const chatId of chatIds) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text }),
        });
        const data = await res.json();
        results.push({ chatId, ok: data.ok });
      } catch (err) {
        results.push({ chatId, ok: false });
      }
    }

    const anyOk = results.some((r) => r.ok);
    if (!anyOk) {
      return NextResponse.json({ error: 'Ни одно сообщение не отправлено', details: results }, { status: 500 });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}