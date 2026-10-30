'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { api, errorMessage } from '@/lib/api';

type Message = { id: number; role: 'assistant' | 'user'; text: string; href?: string; label?: string };

const quickPrompts = ['Find a maths tutor', 'How does booking work?', 'I want to become a tutor'];
export function TutorAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', text: 'Hi! I’m your Tutor AI assistant. What would you like help with today?' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = async (value: string) => {
    const clean = value.trim();
    if (!clean || typing) return;
    setInput('');
    const history = messages.slice(-8).map((item) => `${item.role}: ${item.text}`).join('\n');
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: clean }]);
    setTyping(true);
    try {
      const response = await api.post<{ answer: string }>('/ai/chat', { message: clean, history });
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: response.data.answer }]);
    } catch (error) {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: errorMessage(error) }]);
    } finally {
      setTyping(false);
    }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); send(input); };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && <section aria-label="Tutor AI chat" className="mb-3 flex h-[min(600px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
          <div><p className="text-sm font-extrabold">Tutor AI</p><p className="text-xs text-slate-300">Your learning search companion</p></div>
          <button type="button" aria-label="Close Tutor AI" onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-xl text-slate-300 hover:bg-[#0077b6] hover:text-white">×</button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-live="polite">
          {messages.map((message) => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${message.role === 'user' ? 'rounded-br-md bg-[#0077b6] text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'}`}><p>{message.text}</p>{message.href && <Link href={message.href} onClick={() => setOpen(false)} className="mt-2 inline-flex font-bold text-[#0077b6] underline underline-offset-2 hover:text-slate-950">{message.label} →</Link>}</div></div>)}
          {typing && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Thinking…</div></div>}
          <div ref={endRef} />
        </div>
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)} className="shrink-0 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0077b6] hover:bg-[#0077b6] hover:text-white">{prompt}</button>)}</div>
          <form onSubmit={submit} className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about tutors…" aria-label="Ask Tutor AI" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0077b6] focus:ring-2 focus:ring-blue-100" /><button type="submit" disabled={!input.trim() || typing} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-[#0077b6] disabled:cursor-not-allowed disabled:opacity-50">Send</button></form>
        </div>
      </section>}
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Close Tutor AI' : 'Open Tutor AI'} className="flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#0077b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0077b6]"><span aria-hidden className="text-lg">✦</span>{open ? 'Close chat' : 'Tutor AI'}</button>
    </div>
  );
}
