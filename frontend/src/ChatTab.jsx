import { Fragment, useEffect, useRef, useState } from 'react';
import { API_BASE } from './lib/common.js';

// Boş sohbette gösterilen hazır sorular — kullanıcıyı başlatmaya teşvik eder.
// Sitenin kapsamından (BIST 100 / kıymetli maden / ABD büyük şirket) örnekler.
const SUGGESTIONS = [
  'THYAO hissesini analiz eder misin?',
  'Altın için teknik görünüm nasıl?',
  'GARAN puanı neden düşük?',
  'AAPL için analist hedefi ne?',
];

// "**kalın**" işaretini <strong>'a çevirir, satır sonlarını korur. Model
// yanıtları Markdown benzeri başlıklar (**Temel Analiz** gibi) kullandığı için
// düz metin yerine bu hafif biçimlendirme kullanıcıya daha okunur gelir.
// Tam bir Markdown kütüphanesi eklemek yerine (bundle boyutu) elle, XSS'e
// kapalı (dangerouslySetInnerHTML YOK) bir ayrıştırma yeterli.
function Formatted({ text }) {
  const lines = (text || '').split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).filter((p) => p.length > 0);
        return (
          <Fragment key={i}>
            {parts.map((p, j) => (p.startsWith('**') && p.endsWith('**'))
              ? <strong key={j}>{p.slice(2, -2)}</strong>
              : <Fragment key={j}>{p}</Fragment>)}
            {i < lines.length - 1 && <br />}
          </Fragment>
        );
      })}
    </>
  );
}

export default function ChatTab() {
  const [messages, setMessages] = useState([]); // [{role:'user'|'assistant', content}]
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, busy]);

  // Sekmeden ayrılınca yarım kalan akışı iptal et (sekmeler arası gezinme
  // sırasında arka planda gereksiz token harcanmasın).
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput('');
    setError(null);
    const history = [...messages, { role: 'user', content }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        let msg = `İstek başarısız (HTTP ${res.status})`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch { /* yoksay */ }
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let acc = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: snapshot };
          return next;
        });
      }
      if (!acc.trim()) {
        setMessages((prev) => prev.slice(0, -1)); // boş yanıt geldiyse balonu kaldır
        setError('Asistan boş yanıt döndürdü, tekrar dener misin?');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => prev.slice(0, -1)); // yarım/boş asistan balonunu kaldır
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat">
      <div className="chat-note">
        Bu asistan, sitede takip edilen <strong>BIST 100</strong>, <strong>kıymetli maden</strong> ve
        <strong> ABD büyük şirketleri</strong> hakkında sitenin kendi güncel verisine dayanarak
        yanıt verir. Kıdemli bir analist üslubuyla temel + teknik analiz sunar; kesin al/sat/tut
        tavsiyesi vermez. ⚠️ <strong>Yatırım tavsiyesi değildir.</strong>
      </div>

      {messages.length === 0 ? (
        <div className="chat-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              <div className="chat-bubble">
                {m.content
                  ? <Formatted text={m.content} />
                  : (busy && i === messages.length - 1 ? <span className="chat-typing">yazıyor…</span> : null)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {error && <div className="vb-msg err" style={{ marginTop: 10 }}>{error}</div>}

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={1}
          placeholder="Örn. THYAO hissesini analiz eder misin?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={busy}
        />
        <button className="refresh-btn" onClick={() => send()} disabled={busy || !input.trim()}>
          {busy ? '…' : 'Gönder'}
        </button>
      </div>
    </div>
  );
}
