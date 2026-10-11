import Anthropic from '@anthropic-ai/sdk';
import type { AssistantEvent, AssistantPreferences, ChatMessage } from '@/lib/assistant/types';
import { ASSISTANT_MODEL, SUPPORTS_FALLBACKS } from './client';
import { SYSTEM_STABLE, buildPreferencesNote } from './prompt';
import { ASSISTANT_TOOLS, runTool, type ToolContext } from './tools';

type Message = Anthropic.Beta.Messages.BetaMessageParam;
type ToolResult = Anthropic.Beta.Messages.BetaToolResultBlockParam;

const MAX_STEPS = 5;
// Thinking tokens count against max_tokens, so leave room beyond a short reply.
const MAX_TOKENS = 4000;

export const MSG_UNAVAILABLE = 'Ассистент сейчас недоступен. Позвоните нам или оставьте заявку — поможем лично.';
const MSG_REFUSED = 'С этим вопросом я помочь не могу. Давайте вернёмся к ремонту — о чём рассказать?';
const MSG_BUSY = 'Сейчас много обращений. Подождите минуту и повторите — или позвоните нам.';

export interface RunOptions {
  client: Anthropic;
  messages: ChatMessage[];
  prefs: AssistantPreferences;
  emit: (event: AssistantEvent) => void;
  signal: AbortSignal;
}

export async function runAssistant({ client, messages, prefs, emit, signal }: RunOptions): Promise<void> {
  // The system prompt must stay byte-identical across the loop below: replayed
  // thinking blocks are bound to the prefix that produced them, so changes
  // from save_preferences reach the model through tool results, not here.
  const note = buildPreferencesNote(prefs);
  const system: Anthropic.Beta.Messages.BetaTextBlockParam[] = [
    { type: 'text', text: SYSTEM_STABLE, cache_control: { type: 'ephemeral' } },
    ...(note ? [{ type: 'text' as const, text: note }] : []),
  ];

  const conversation: Message[] = messages.map((m) => ({ role: m.role, content: m.content }));
  const ctx: ToolContext = { prefs: { ...prefs }, emit };
  let wroteText = false;

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const stream = client.beta.messages.stream(
        {
          model: ASSISTANT_MODEL,
          max_tokens: MAX_TOKENS,
          system,
          tools: ASSISTANT_TOOLS,
          messages: conversation,
          output_config: { effort: 'low' },
          ...(SUPPORTS_FALLBACKS && { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }),
        },
        { signal },
      );

      let stepHasText = false;
      stream.on('text', (delta) => {
        if (!stepHasText && wroteText) emit({ t: 'text', v: '\n\n' });
        stepHasText = true;
        wroteText = true;
        emit({ t: 'text', v: delta });
      });

      const message = await stream.finalMessage();

      if (message.stop_reason === 'refusal') {
        emit({ t: 'error', v: MSG_REFUSED });
        return;
      }

      const toolUses = message.content.filter(
        (block): block is Anthropic.Beta.Messages.BetaToolUseBlock => block.type === 'tool_use',
      );
      if (message.stop_reason !== 'tool_use' || toolUses.length === 0) {
        emit({ t: 'done' });
        return;
      }

      conversation.push({ role: 'assistant', content: message.content });

      const results: ToolResult[] = toolUses.map((use) => {
        const outcome = runTool(use.name, use.input, ctx);
        return {
          type: 'tool_result',
          tool_use_id: use.id,
          content: outcome.content,
          ...(outcome.isError && { is_error: true }),
        };
      });
      conversation.push({ role: 'user', content: results });
    }

    emit({ t: 'error', v: MSG_UNAVAILABLE });
  } catch (err) {
    if (signal.aborted) return;
    if (err instanceof Anthropic.RateLimitError) {
      console.error('[assistant] Anthropic rate limit');
      emit({ t: 'error', v: MSG_BUSY });
    } else if (err instanceof Anthropic.APIError) {
      console.error('[assistant] Anthropic API error', err.status, err.message);
      emit({ t: 'error', v: MSG_UNAVAILABLE });
    } else {
      console.error('[assistant] unexpected error', err);
      emit({ t: 'error', v: MSG_UNAVAILABLE });
    }
  }
}
