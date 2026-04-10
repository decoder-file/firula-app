import type { ImageSourcePropType } from "react-native";

import { slugify } from "@/utils/format";

const eventBeachTennis = require("../../assets/events/event-beach-tennis.jpg");
const eventFutevolei = require("../../assets/events/event-futevolei.jpg");
const eventRunning = require("../../assets/events/event-running.jpg");
const eventYoga = require("../../assets/events/event-yoga.jpg");

export type EventCategory =
  | "futebol"
  | "futevolei"
  | "beach-tennis"
  | "corrida"
  | "surf"
  | "yoga"
  | "todos";

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  total: number;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface EventOrganizer {
  name: string;
  avatar: string;
  verified: boolean;
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  date: string;
  time: string;
  location: string;
  address: string;
  city: string;
  category: EventCategory;
  eventType: string;
  price: number;
  ticketTypes: TicketType[];
  organizer: EventOrganizer;
  attendees: number;
  maxAttendees: number;
  schedule: EventScheduleItem[];
  rules: string[];
  faqs: { question: string; answer: string }[];
  tags: string[];
  isFeatured: boolean;
  isHot: boolean;
  latitude: number;
  longitude: number;
  requiresFacialId?: boolean;
}

export interface UserTicket {
  id: string;
  eventId: string;
  ticketType: string;
  purchaseDate: string;
  status: "active" | "used" | "expired" | "cancelled";
  qrCode: string;
  facialIdRegistered?: boolean;
}

export interface WalletTransaction {
  id: string;
  type: "purchase" | "refund" | "cashback" | "credit";
  amount: number;
  description: string;
  date: string;
  eventId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  city: string;
  eventsAttended: number;
  memberSince: string;
}

export const categories: { id: EventCategory; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "futebol", label: "Futebol" },
  { id: "futevolei", label: "Futevôlei" },
  { id: "beach-tennis", label: "Beach Tennis" },
  { id: "corrida", label: "Corrida" },
  { id: "surf", label: "Surf" },
  { id: "yoga", label: "Yoga" },
];

export const events: EventData[] = [
  {
    id: "1",
    title: "Campeonato de Beach Tennis - Copa Verão",
    description:
      "O maior campeonato de beach tennis do litoral paulista! Venha competir ou assistir partidas emocionantes com os melhores atletas da região. Ambiente familiar com praça de alimentação, música ao vivo e muita diversão.",
    image: eventBeachTennis,
    date: "2026-04-15",
    time: "08:00",
    location: "Praia de Santos",
    address: "Av. Ana Costa, s/n - Gonzaga",
    city: "Santos, SP",
    category: "beach-tennis",
    eventType: "Beach Tennis",
    price: 45,
    ticketTypes: [
      { id: "t1", name: "Espectador", price: 45, description: "Acesso à área de espectadores", available: 200, total: 500 },
      { id: "t2", name: "Atleta Amador", price: 120, description: "Inscrição para competir na categoria amadora", available: 30, total: 64 },
      { id: "t3", name: "VIP", price: 180, description: "Acesso VIP com open bar e área exclusiva", available: 15, total: 50 },
    ],
    organizer: { name: "Arena Beach Sports", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABS", verified: true },
    attendees: 342,
    maxAttendees: 614,
    schedule: [
      { time: "08:00", title: "Abertura dos portões" },
      { time: "09:00", title: "Fase de grupos", description: "Início das partidas eliminatórias" },
      { time: "12:00", title: "Intervalo e almoço" },
      { time: "14:00", title: "Semifinais" },
      { time: "16:00", title: "Final e premiação" },
    ],
    rules: ["Proibido cooler e bebidas externas", "Obrigatório uso de protetor solar", "Menores de 12 anos acompanhados"],
    faqs: [
      { question: "Posso levar cadeira de praia?", answer: "Sim! Recomendamos trazer sua própria cadeira." },
      { question: "Tem estacionamento?", answer: "Estacionamento conveniado a 200m do evento." },
    ],
    tags: ["beach tennis", "esporte", "praia", "competição"],
    isFeatured: true,
    isHot: true,
    latitude: -23.9618,
    longitude: -46.3322,
  },
  {
    id: "2",
    title: "Torneio de Futevôlei - Desafio das Estrelas",
    description:
      "Futevôlei de alto nível na areia de Copacabana! Atletas profissionais e amadores se reúnem para o maior desafio do Rio. Premiação de R$10.000 para os campeões.",
    image: eventFutevolei,
    date: "2026-04-22",
    time: "07:30",
    location: "Praia de Copacabana",
    address: "Av. Atlântica - Posto 6",
    city: "Rio de Janeiro, RJ",
    category: "futevolei",
    eventType: "Futevôlei",
    price: 35,
    ticketTypes: [
      { id: "t1", name: "Espectador", price: 35, description: "Acesso geral", available: 400, total: 800 },
      { id: "t2", name: "Atleta", price: 200, description: "Inscrição para dupla", available: 12, total: 32 },
      { id: "t3", name: "Camarote", price: 250, description: "Camarote com vista privilegiada e drinks", available: 8, total: 20 },
    ],
    organizer: { name: "Futevôlei Brasil", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FB", verified: true },
    attendees: 580,
    maxAttendees: 852,
    schedule: [
      { time: "07:30", title: "Aquecimento" },
      { time: "08:30", title: "Primeira rodada" },
      { time: "13:00", title: "Show de habilidades" },
      { time: "15:00", title: "Finais" },
    ],
    rules: ["Proibido drones", "Área de fumantes demarcada"],
    faqs: [{ question: "Posso filmar?", answer: "Sim, uso pessoal é permitido." }],
    tags: ["futevôlei", "praia", "rio", "competição"],
    isFeatured: true,
    isHot: false,
    latitude: -22.9711,
    longitude: -43.1822,
  },
  {
    id: "3",
    title: "Retiro de Yoga e Meditação - Reconecte-se",
    description:
      "Um dia inteiro dedicado ao seu bem-estar. Práticas de yoga ao amanhecer, meditação guiada, alimentação saudável e conexão com a natureza.",
    image: eventYoga,
    date: "2026-04-28",
    time: "06:00",
    location: "Sítio Namastê",
    address: "Estrada da Serra, km 12",
    city: "Petrópolis, RJ",
    category: "yoga",
    eventType: "Yoga",
    price: 220,
    ticketTypes: [
      { id: "t1", name: "Day Use", price: 220, description: "Acesso completo + alimentação", available: 25, total: 40 },
      { id: "t2", name: "Premium", price: 380, description: "Day use + massagem + kit exclusivo", available: 8, total: 15 },
    ],
    organizer: { name: "Vida Plena", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=VP", verified: false },
    attendees: 22,
    maxAttendees: 55,
    schedule: [
      { time: "06:00", title: "Yoga ao amanhecer" },
      { time: "08:00", title: "Café da manhã orgânico" },
      { time: "10:00", title: "Meditação guiada" },
      { time: "12:00", title: "Almoço ayurvédico" },
      { time: "14:00", title: "Workshop de respiração" },
    ],
    rules: ["Silêncio nas áreas de prática", "Traga seu próprio mat"],
    faqs: [{ question: "Preciso ter experiência?", answer: "Não! Todas as práticas são adaptáveis." }],
    tags: ["yoga", "meditação", "bem-estar", "natureza"],
    isFeatured: false,
    isHot: false,
    latitude: -22.5112,
    longitude: -43.1779,
  },
  {
    id: "4",
    title: "Maratona São Paulo 2026",
    description:
      "A mais tradicional corrida de rua do Brasil. Percorra as ruas de São Paulo em um circuito de 42km, 21km ou 10km. Medalha e kit para todos os participantes.",
    image: eventRunning,
    date: "2026-05-25",
    time: "06:30",
    location: "Parque Ibirapuera",
    address: "Av. Pedro Álvares Cabral",
    city: "São Paulo, SP",
    category: "corrida",
    eventType: "Corrida",
    price: 180,
    ticketTypes: [
      { id: "t1", name: "10km", price: 180, description: "Percurso de 10km + kit", available: 2000, total: 5000 },
      { id: "t2", name: "21km (Meia)", price: 250, description: "Meia maratona + kit premium", available: 800, total: 3000 },
      { id: "t3", name: "42km (Completa)", price: 350, description: "Maratona completa + kit premium", available: 300, total: 2000 },
    ],
    organizer: { name: "SP Marathon", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SPM", verified: true },
    attendees: 6800,
    maxAttendees: 10000,
    schedule: [
      { time: "05:00", title: "Abertura do village" },
      { time: "06:00", title: "Largada 42km" },
      { time: "06:30", title: "Largada 21km" },
      { time: "07:00", title: "Largada 10km" },
      { time: "12:00", title: "Premiação" },
    ],
    rules: ["Obrigatório atestado médico", "Kit retirado presencialmente"],
    faqs: [{ question: "Posso trocar de categoria?", answer: "Sim, até 15 dias antes do evento." }],
    tags: ["corrida", "maratona", "são paulo"],
    isFeatured: true,
    isHot: true,
    latitude: -23.5874,
    longitude: -46.6576,
  },
  {
    id: "5",
    title: "Clássico Corinthians x Palmeiras - Campeonato Paulista",
    description:
      "O maior clássico do futebol paulista! Corinthians e Palmeiras se enfrentam na Neo Química Arena pela fase final do Campeonato Paulista 2026. Atmosfera eletrizante garantida com mais de 40 mil torcedores. Este evento exige cadastro Facial ID Firula para garantir a segurança de todos os presentes.",
    image: eventFutevolei,
    date: "2026-05-15",
    time: "16:00",
    location: "Neo Química Arena",
    address: "Av. Miguel Ignácio Curi, 111 - Artur Alvim",
    city: "São Paulo, SP",
    category: "futebol",
    eventType: "Futebol",
    price: 80,
    ticketTypes: [
      { id: "t1", name: "Arquibancada", price: 80, description: "Setor de arquibancada geral", available: 15000, total: 25000 },
      { id: "t2", name: "Cadeira Superior", price: 150, description: "Cadeira numerada setor superior", available: 5000, total: 10000 },
      { id: "t3", name: "Cadeira Inferior", price: 250, description: "Cadeira numerada próximo ao campo", available: 2000, total: 5000 },
      { id: "t4", name: "Camarote", price: 600, description: "Camarote com serviço open bar e buffet", available: 100, total: 500 },
    ],
    organizer: { name: "FPF - Federação Paulista", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FPF", verified: true },
    attendees: 38000,
    maxAttendees: 49000,
    schedule: [
      { time: "13:00", title: "Abertura dos portões" },
      { time: "14:00", title: "Aquecimento dos times" },
      { time: "15:30", title: "Pré-jogo e hino" },
      { time: "16:00", title: "Início do primeiro tempo" },
      { time: "16:50", title: "Intervalo" },
      { time: "17:05", title: "Segundo tempo" },
    ],
    rules: [
      "Obrigatório cadastro Facial ID Firula",
      "Proibido objetos pontiagudos, garrafas e latas",
      "Proibido fogos de artifício e sinalizadores",
      "Menores de 12 anos somente com responsável",
      "Obrigatório apresentar documento com foto",
    ],
    faqs: [
      {
        question: "O que é o Facial ID Firula?",
        answer: "É um cadastro de reconhecimento facial para garantir a segurança no evento. O processo é rápido e seus dados são protegidos.",
      },
      { question: "Posso transferir o ingresso?", answer: "Não, o ingresso é pessoal e intransferível vinculado ao Facial ID." },
      { question: "Quando preciso chegar?", answer: "Recomendamos chegar com pelo menos 2h de antecedência." },
    ],
    tags: ["futebol", "clássico", "estádio", "paulistão"],
    isFeatured: true,
    isHot: true,
    latitude: -23.5453,
    longitude: -46.4744,
    requiresFacialId: true,
  },
];

export const userTickets: UserTicket[] = [
  { id: "ut1", eventId: "1", ticketType: "VIP", purchaseDate: "2026-03-20", status: "active", qrCode: "FIRULA-EVT1-VIP-A3F2B1" },
  { id: "ut2", eventId: "4", ticketType: "21km (Meia)", purchaseDate: "2026-03-15", status: "active", qrCode: "FIRULA-EVT4-MEIA-K9D4E2" },
  {
    id: "ut3",
    eventId: "5",
    ticketType: "Cadeira Inferior",
    purchaseDate: "2026-03-22",
    status: "active",
    qrCode: "FIRULA-EVT5-CADINF-X7R3M9",
    facialIdRegistered: true,
  },
];

export const walletTransactions: WalletTransaction[] = [
  { id: "w1", type: "credit", amount: 100, description: "Bônus de boas-vindas", date: "2026-03-01" },
  { id: "w2", type: "purchase", amount: -180, description: "VIP - Copa Verão Beach Tennis", date: "2026-03-20", eventId: "1" },
  { id: "w3", type: "cashback", amount: 18, description: "Cashback 10% - Copa Verão", date: "2026-03-20" },
  { id: "w4", type: "purchase", amount: -250, description: "21km - Maratona SP 2026", date: "2026-03-15", eventId: "4" },
  { id: "w5", type: "cashback", amount: 25, description: "Cashback 10% - Maratona SP", date: "2026-03-15" },
  { id: "w6", type: "refund", amount: 150, description: "Reembolso - Evento cancelado", date: "2026-03-10" },
];

export const userProfile: UserProfile = {
  id: "u1",
  name: "Lucas Oliveira",
  email: "lucas@email.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
  phone: "(11) 99999-0000",
  city: "São Paulo, SP",
  eventsAttended: 12,
  memberSince: "2025-08-15",
};

export const getWalletBalance = (transactions = walletTransactions) => transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

export const getEventById = (id: string) => events.find((event) => event.id === id);

export const getOrganizerSlug = (name: string) => slugify(name);

export const getEventByOrganizerSlug = (slug: string) => events.find((event) => getOrganizerSlug(event.organizer.name) === slug);