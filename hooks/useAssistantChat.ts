'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  type AssistantEvent,
  type AssistantPreferences,
  type HandoffDraft,
  type OfferDraft,
} from '@/lib/assistant/types';

export interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  offer?: OfferDraft;
  offerSent?: boolean;
  handoff?: HandoffDraft;
  handoffSent?: boolean;
}

const MANUAL_HANDOFF_TEXT = 'Конечно, давайте продолжим напрямую — выберите, как вам удобнее связаться. Историю нашей переписки сохраню, повторять ничего не придётся.';

const STORAGE_KEY = 'tiyaksa_assistant_v1';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_STORED = 30;

const ERR_RATE = 'Слишком много сообщений за короткое время. Подождите немного или позвоните нам.';
const ERR_DOWN = 'Лев пока недоступен. Позвоните нам или оставьте заявку — поможем лично.';
const ERR_GENERIC = 'Не получилось получить ответ. Проверьте соединение и попробуйте ещё раз.';

const newId = () => Math.random().toString(36).slice(2, 10);

interface Stored {
  messages: UiMessage[];
  prefs: AssistantPreferences;
  updatedAt: number;
}

function loadStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Stored;
    if (!Array.isArray(data.messages) || Date.now() - data.updatedAt > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function useAssistantChat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [prefs, setPrefs] = useState<AssistantPreferences>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesRef = useRef(messages);
  const prefsRef = useRef(prefs);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  messagesRef.current = messages;
  prefsRef.current = prefs;

  useEffect(() => {
    const stored = loadStored();
    if (!stored) return;
    setMessages(stored.messages.filter((m) => m.content || m.offer || m.handoff));
    setPrefs(stored.prefs ?? {});
  }, []);

  useEffect(() => {
    if (busy) return;
    try {
      if (messages.length === 0 && Object.keys(prefs).length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const record: Stored = { messages: messages.slice(-MAX_STORED), prefs, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      /* storage unavailable — the chat just won't survive a reload */
    }
  }, [messages, prefs, busy]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!text || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);

    const userMsg: UiMessage = { id: newId(), role: 'user', content: text };
    const botId = newId();
    const history = [...messagesRef.current.filter((m) => m.content), userMsg]
      .slice(-MAX_HISTORY_MESSAGES)
      .map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, userMsg, { id: botId, role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortRef.current = controller;

    const apply = (event: AssistantEvent) => {
      switch (event.t) {
        case 'text':
          setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, content: m.content + event.v } : m)));
          break;
        case 'prefs':
          setPrefs(event.v);
          break;
        case 'offer':
          setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, offer: event.v } : m)));
          break;
        case 'handoff':
          setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, handoff: event.v } : m)));
          break;
        case 'error':
          setError(event.v);
          break;
      }
    };

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, preferences: prefsRef.current }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setError(res.status === 429 ? ERR_RATE : res.status === 503 ? ERR_DOWN : ERR_GENERIC);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newline: number;
        while ((newline = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (line) apply(JSON.parse(line) as AssistantEvent);
        }
      }
    } catch {
      if (!controller.signal.aborted) setError(ERR_GENERIC);
    } finally {
      // After reset() a newer send may already own the busy flag.
      if (abortRef.current === controller) {
        busyRef.current = false;
        setBusy(false);
      }
      setMessages((prev) => prev.filter((m) => m.id !== botId || m.content || m.offer || m.handoff));
    }
  }, []);

  const retry = useCallback(() => {
    const list = messagesRef.current;
    const lastUser = [...list].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages(list.slice(0, list.lastIndexOf(lastUser)));
    setError(null);
    void send(lastUser.content);
  }, [send]);

  const markOfferSent = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, offerSent: true } : m)));
  }, []);

  const markHandoffSent = useCallback((id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, handoffSent: true } : m)));
  }, []);

  // The header button works without the model: it drops the contact card into
  // the chat itself. Skipped if an unused card is already the latest thing there.
  const requestHandoff = useCallback(() => {
    if (busyRef.current) return;
    const open = messagesRef.current.some((m) => m.handoff && !m.handoffSent);
    if (open) return;
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'assistant', content: MANUAL_HANDOFF_TEXT, handoff: { reason: 'asked_human', summary: '' } },
    ]);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    busyRef.current = false;
    setBusy(false);
    setMessages([]);
    setPrefs({});
    setError(null);
  }, []);

  return { messages, prefs, busy, error, send, retry, reset, markOfferSent, markHandoffSent, requestHandoff };
}
