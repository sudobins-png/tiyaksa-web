import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(2, 'Введите имя (минимум 2 символа)'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  message: z.string().max(1500).optional(),
  website: z.string().optional(), // honeypot — should stay empty
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Введите имя (минимум 2 символа)'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  message: z.string().optional(),
});

export type LeadValues = z.infer<typeof leadSchema>;
export type ContactValues = z.infer<typeof contactSchema>;
