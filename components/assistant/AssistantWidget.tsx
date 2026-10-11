'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAssistantChat, type UiMessage } from '@/hooks/useAssistantChat';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useVisualViewport } from '@/hooks/useVisualViewport';
import { siteConfig } from '@/data/content';
import { MAX_MESSAGE_CHARS } from '@/lib/assistant/types';
import { HandoffCard } from './HandoffCard';
import { OfferCard } from './OfferCard';

const GREETING =
  'Здравствуйте! Меня зовут Лев, я личный управляющий ТиЯКСа.Ремонт. Подскажу по видам ремонта, срокам и стоимости и помогу с персональным расчётом. С чего начнём?';

const QUICK_REPLIES = ['Сколько стоит ремонт?', 'Чем отличаются виды ремонта?', 'Посчитать мою квартиру'];

const LIST_ITEM = /^\s*([-•*]|\d+[.)])\s+/;

function inline(text: string, keyPrefix: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );
}

/** Minimal markdown: paragraphs, "- " lists and **bold** — rendered as React nodes, never as HTML. */
function RichText({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      {text.split(/\n{2,}/).map((block, bi) => {
        const lines = block.split('\n');
        if (lines.every((l) => LIST_ITEM.test(l))) {
          return (
            <ul key={bi} className="m-0 list-disc space-y-1 pl-5">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(LIST_ITEM, ''), `${bi}-${li}-`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="m-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}-`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function ScrollLock() {
  useLockBodyScroll();
  return null;
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-3.6-.8L3 20l1.1-4.9A8.4 8.4 0 1 1 21 11.5Z" />
    </svg>
  );
}

function CloseIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ManagerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function Bubble({ message, children }: { message: UiMessage; children?: React.ReactNode }) {
  const isUser = message.role === 'user';
  return (
    <div className={isUser ? 'assistant-in flex justify-end' : 'assistant-in flex flex-col items-start'}>
      {message.content && (
        <div
          className={
            isUser
              ? 'max-w-[85%] rounded-2xl rounded-br-md bg-forest px-3.5 py-2.5 text-[15px] leading-relaxed text-white'
              : 'max-w-[92%] rounded-2xl rounded-bl-md border border-[#e4e9e4] bg-white px-3.5 py-2.5 text-[15px] leading-relaxed text-ink shadow-sm'
          }
        >
          {isUser ? <p className="m-0 whitespace-pre-wrap">{message.content}</p> : <RichText text={message.content} />}
        </div>
      )}
      {children}
    </div>
  );
}

export function AssistantWidget() {
  const reduceMotion = useReducedMotion();
  const chat = useAssistantChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const viewport = useVisualViewport(isMobile && open);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    if (!isMobile) inputRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, isMobile]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [chat.messages, chat.busy, chat.error, open, reduceMotion]);

  const submit = (text: string) => {
    if (!text.trim() || chat.busy) return;
    void chat.send(text);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const last = chat.messages[chat.messages.length - 1];
  const typing = chat.busy && last?.role === 'assistant' && !last.content && !last.offer && !last.handoff;
  const history = chat.messages.filter((m) => m.content).map(({ role, content }) => ({ role, content }));

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            id="assistant-panel"
            role="dialog"
            aria-label="Чат со Львом, ТиЯКСа.Ремонт"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={viewport ? { top: viewport.top, height: viewport.height } : undefined}
            className="fixed inset-x-0 top-0 z-[160] flex h-[100dvh] flex-col overflow-hidden bg-white sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-7.5rem)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-[#e4e9e4] sm:shadow-[0_16px_60px_rgba(27,79,27,.22)]"
          >
            <div className="flex items-center gap-2 border-b border-[#ecefec] bg-white px-3.5 py-3 sm:gap-2.5 sm:px-4">
              <Image src="/logo-mini.png" alt="" width={39} height={36} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-[15px] font-extrabold leading-tight text-forest sm:text-[16px]">Лев</p>
                <p className="m-0 mt-0.5 flex items-center gap-1.5 truncate text-[12px] leading-tight text-muted">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22c55e]" aria-hidden />
                  Онлайн · личный управляющий
                </p>
              </div>
              <button
                type="button"
                onClick={chat.requestHandoff}
                disabled={chat.busy}
                aria-label="Позвонить или написать в Telegram"
                title="Позвонить или написать в Telegram"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-grove-mint text-forest transition-colors hover:bg-[#dcebdc] disabled:cursor-default disabled:opacity-50"
              >
                <ManagerIcon />
              </button>
              {chat.messages.length > 0 && (
                <button
                  type="button"
                  onClick={chat.reset}
                  aria-label="Очистить диалог"
                  title="Очистить диалог"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-muted transition-colors hover:bg-[#f1f4f1] hover:text-forest"
                >
                  <ResetIcon />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть чат"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-[#f1f4f1] text-ink transition-colors hover:bg-[#e4e9e4]"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-site px-4 py-4"
            >
              <Bubble message={{ id: 'greeting', role: 'assistant', content: GREETING }} />

              {chat.messages.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => submit(reply)}
                      className="cursor-pointer rounded-full border border-[#dbe5db] bg-white px-3.5 py-2 text-[14px] font-medium text-forest transition-colors hover:border-grove hover:bg-grove-mint"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {chat.messages.length === 0 && (
                <p className="m-0 text-[13px] text-muted">
                  Удобнее голосом или в Telegram?{' '}
                  <button
                    type="button"
                    onClick={chat.requestHandoff}
                    className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-bold text-forest underline"
                  >
                    Связаться напрямую
                  </button>
                </p>
              )}

              {chat.messages.map((m) => (
                <Bubble key={m.id} message={m}>
                  {m.offer && <OfferCard offer={m.offer} sent={!!m.offerSent} onSent={() => chat.markOfferSent(m.id)} />}
                  {m.handoff && (
                    <HandoffCard
                      draft={m.handoff}
                      history={history}
                      prefs={chat.prefs}
                      sent={!!m.handoffSent}
                      onSent={() => chat.markHandoffSent(m.id)}
                    />
                  )}
                </Bubble>
              ))}

              {typing && (
                <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-[#e4e9e4] bg-white px-4 py-3" aria-label="Лев печатает">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-[#b8c4b8] motion-safe:animate-pulse"
                      style={{ animationDelay: `${i * 160}ms` }}
                    />
                  ))}
                </div>
              )}

              {chat.error && (
                <div className="rounded-xl border border-[#f1d4d0] bg-[#fdf3f2] px-3.5 py-3 text-[14px] leading-snug text-[#8a3a30]" role="alert">
                  <p className="m-0">{chat.error}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={chat.retry}
                      className="cursor-pointer border-none bg-transparent p-0 text-[14px] font-bold text-[#8a3a30] underline"
                    >
                      Повторить
                    </button>
                    <a href={siteConfig.phoneHref} className="text-[14px] font-bold text-[#8a3a30] underline">
                      Позвонить
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#ecefec] bg-white px-3 pb-3 pt-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(input);
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={onInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                  rows={1}
                  maxLength={MAX_MESSAGE_CHARS}
                  placeholder="Напишите вопрос…"
                  aria-label="Сообщение Льву"
                  className="max-h-[120px] min-h-[46px] flex-1 resize-none rounded-xl border border-[#e4e9e4] bg-[#f7f9f7] px-4 py-3 text-base leading-snug text-ink outline-none transition-colors placeholder:text-[#b0b8b0] focus:border-grove"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chat.busy}
                  aria-label="Отправить"
                  className="flex h-[46px] w-[46px] shrink-0 cursor-pointer items-center justify-center rounded-xl border-none bg-gold text-ink transition-all duration-200 hover:bg-gold-dark disabled:cursor-default disabled:opacity-45"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              </form>
              <p className="m-0 mt-2 text-center text-[11px] leading-snug text-[#9aa39a]">
                Цены ориентировочные, не оферта ·{' '}
                <a href={siteConfig.phoneHref} className="text-[#9aa39a] underline">
                  {siteConfig.phone}
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMobile && open && <ScrollLock />}

      {!(isMobile && open) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Закрыть чат со Львом' : 'Открыть чат со Львом'}
          aria-expanded={open}
          aria-controls="assistant-panel"
          className="fixed bottom-5 right-5 z-[150] flex h-14 cursor-pointer items-center gap-2.5 rounded-full border-none bg-gold px-4 text-forest ring-2 ring-white/90 shadow-[0_8px_30px_rgba(17,24,17,.30)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold-dark sm:px-5"
        >
          {open ? <CloseIcon /> : <ChatIcon />}
          <span className="hidden text-[15px] font-bold sm:inline">{open ? 'Закрыть' : 'Задать вопрос'}</span>
        </button>
      )}
    </>
  );
}
