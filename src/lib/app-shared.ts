import {Globe,Send,Workflow,Layers,MessageSquare,Code2} from "lucide-react";
export type User = { id: string; name: string; email: string; role: string };
export type Project = {
  title: string;
  category: string;
  description: string;
  url?: string;
  image?: string;
  slug?: string;
  task?: string;
  result?: string;
  technologies?: string;
  confirmed?: boolean;
};
export type Content = {
  projects: Project[];
  prices: Record<string, string>;
  contacts: Record<string, string>;
};
export type Lead = {
  id: string;
  name: string;
  contact: string;
  service: string;
  description: string;
  status: string;
  price: number;
  due: string;
  created: string;
  user_id?: string | null;
};
export const services = [
  {
    name: "Сайты и интернет-магазины",
    short: "Сайты",
    text: "От первого впечатления до первого заказа. Быстрые сайты, которые раскрывают ваш бренд и помогают продавать.",
    icon: Globe,
    tags: ["Лендинги", "Корпоративные сайты", "E-commerce"],
  },
  {
    name: "Telegram-боты",
    short: "Telegram-боты",
    text: "Запись, продажи и поддержка — прямо в мессенджере. Освобождаем команду от повторяющихся задач.",
    icon: Send,
    tags: ["Продажи", "Поддержка", "Интеграции"],
  },
  {
    name: "CRM и автоматизация",
    short: "CRM-системы",
    text: "Клиенты, сделки и процессы в одной системе. Разрабатываем инструменты под логику вашего бизнеса.",
    icon: Workflow,
    tags: ["CRM", "API", "Бизнес-процессы"],
  },
  {
    name: "Веб-приложения",
    short: "Веб-приложения",
    text: "Ваша идея в работающем продукте. Личные кабинеты, сервисы и платформы с возможностью развития.",
    icon: Layers,
    tags: ["SaaS", "Платформы", "Кабинеты"],
  },
  {
    name: "Социальные сети",
    short: "Соцсети",
    text: "Помогаем бренду говорить своим голосом. Контент, оформление и регулярное ведение социальных сетей.",
    icon: MessageSquare,
    tags: ["Контент", "Дизайн", "SMM"],
  },
  {
    name: "Разработка под задачу",
    short: "Другое",
    text: "Не нашли подходящую категорию? Обсудим вашу задачу и подберём решение, которое имеет смысл.",
    icon: Code2,
    tags: ["Индивидуальные решения", "Поддержка"],
  },
];
export const statuses = [
  "Заявка получена",
  "Обсуждение",
  "Подготовка предложения",
  "Согласование договора",
  "В работе",
  "На проверке",
  "Завершён",
  "На сопровождении",
];
export const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
export async function api(path: string, body?: unknown, method?: string) {
  const r = await fetch("/api/" + path, {
    method: method || (body ? "POST" : "GET"),
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Не удалось выполнить запрос");
  return j;
}
