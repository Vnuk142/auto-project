import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, car } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log('=== ЗАЯВКА ===');
    console.log('Имя:', name);
    console.log('Телефон:', phone);
    console.log('Токен:', botToken ? 'ЕСТЬ' : 'НЕТ');
    console.log('Chat ID:', chatId ? 'ЕСТЬ' : 'НЕТ');

    if (!botToken || !chatId) {
      return NextResponse.json({ error: 'No Telegram config' }, { status: 500 });
    }

    const text = `🔔 НОВАЯ ЗАЯВКА!\n👤 ${name}\n📞 ${phone}` + (car ? `\n🚗 ${car}` : '');

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    const data = await res.json();
    console.log('Ответ TG:', JSON.stringify(data));

    if (!res.ok) {
      return NextResponse.json({ error: 'TG error', details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('ОШИБКА:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}