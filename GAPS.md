# Firula Mobile — Gaps de Implementação

> Gerado em 2026-07-01. Atualizar conforme funcionalidades forem sendo entregues.

---

## 1. Telas existentes × status de integração

| Tela | Rota | Status | Detalhes |
|------|------|--------|----------|
| Home | `/` | ✅ Integrado | `useFeaturedEvents`, `useTrendingEvents`, `useUpcomingEvents` chamam a API real |
| Explore | `/(tabs)/explore` | 🟡 Mock | Lista de eventos hardcoded; filtro por categoria não chama API |
| Meus Ingressos | `/(tabs)/tickets` | ✅ Integrado | `useMyTickets` → `GET /public/customer/tickets` |
| Perfil | `/(tabs)/profile` | 🟡 Parcial | Auth ok (`useAuthUser`); estatísticas de eventos ainda são mock |
| Login | `/login` | ✅ Integrado | Fluxo completo: `requestLoginCode`, `verifyLoginCode`, `login`, `register` |
| Editar Perfil | `/profile-edit` | 🟡 Parcial | Alterações ficam no estado local; **não sincroniza com backend** (`PATCH /users/me` existe mas não é chamado) |
| Detalhe do Evento | `/event/[slug]` | ✅ Integrado | `useEventBySlug` → `GET /admin/events/slug/{slug}` |
| Detalhe do Ingresso | `/ticket/[id]` | ✅ Integrado | Dados vindos de `useMyTickets`; QR code funcional |
| Organizador | `/organizer/[id]` | 🟡 Mock | Dados hardcoded; endpoint `GET /admin/organizers/{id}` não está integrado |
| Checkout | `/checkout` | 🟡 Mock | Lógica de carrinho local funciona; **pagamento não integrado** (`usePurchaseTicket` existe mas não é chamado) |
| Sucesso da Compra | `/purchase-success` | 🟡 Mock | Mensagem hardcoded; depende da conclusão do checkout |
| Favoritos | `/favorites` | ⚠️ Vazio | Tela placeholder; sem API integrada |
| Notificações | `/notifications` | ⚠️ Vazio | Tela placeholder; sem API integrada |
| Facial ID | `/facial-id` | ⚠️ Vazio | Modal existe para o checkout; tela de gestão não construída |
| Configurações | `/settings` | ⚠️ Vazio | Tela placeholder |
| Ajuda | `/help` | ⚠️ Vazio | Tela placeholder |
| Privacidade | `/privacy` | ⚠️ Vazio | Tela placeholder (conteúdo institucional) |
| Termos | `/terms` | ⚠️ Vazio | Tela placeholder (conteúdo jurídico) |

---

## 2. Chamadas de API que faltam implementar

### 2.1 Tela de Explore
- **Falta:** chamar `useUpcomingEvents()` (ou endpoint dedicado de busca) em vez de lista hardcoded
- **Falta:** busca por texto e filtro por categoria conectados à API
- Endpoint sugerido: `GET /platform/events?category=X&q=Y`

### 2.2 Editar Perfil (`/profile-edit`)
- **Falta:** salvar alterações → `PATCH /users/me` (serviço `users.service.ts` já tem `updateProfile()`, só precisa ser chamado)
- **Falta:** upload de avatar (endpoint de upload de imagem não identificado)
- **Falta:** exclusão de conta → endpoint a definir

### 2.3 Checkout (`/checkout`)
- **Falta:** finalizar compra → `POST /tickets/purchase` (hook `usePurchaseTicket` já existe em `useTickets.ts`, não está sendo chamado na tela)
- **Falta:** aplicar cupom via API (hoje valida só o código `FIRULA10` hardcoded)
- **Falta:** consultar saldo real da carteira Firula

### 2.4 Organizador (`/organizer/[id]`)
- **Falta:** `GET /admin/organizers/{id}` (dados do organizador são mock)
- **Falta:** listar eventos do organizador

### 2.5 Perfil — Estatísticas
- **Falta:** eventos assistidos, distância percorrida, etc. → endpoints a definir

### 2.6 Favoritos (`/favorites`)
- **Falta:** `GET /favorites` — listar eventos favoritados
- **Falta:** `POST /favorites/{eventId}` — adicionar favorito
- **Falta:** `DELETE /favorites/{eventId}` — remover favorito
- Endpoint pode ainda não existir no backend

### 2.7 Notificações (`/notifications`)
- **Falta:** `GET /notifications` — listar notificações
- **Falta:** `PATCH /notifications/{id}/read` — marcar como lida
- Endpoint pode ainda não existir no backend

### 2.8 Facial ID (`/facial-id`)
- **Falta:** tela de gestão do biométrico (cadastro, remoção)
- Endpoint de registro biométrico não identificado

---

## 3. Telas que faltam ser construídas

Todas as rotas abaixo já existem como arquivo mas são apenas telas placeholder (sem conteúdo funcional):

| Rota | O que construir |
|------|----------------|
| `/favorites` | Lista de eventos favoritados com ação de desfavoritar |
| `/notifications` | Feed de notificações com estado lido/não-lido |
| `/facial-id` | Gestão do cadastro biométrico do usuário |
| `/settings` | Preferências: notificações push, tema, idioma, etc. |
| `/help` | FAQ / canal de suporte |
| `/privacy` | Conteúdo estático da política de privacidade |
| `/terms` | Conteúdo estático dos termos de uso |

---

## 4. Serviços e hooks existentes (referência)

| Arquivo | Endpoints cobertos |
|---------|--------------------|
| `src/services/auth.service.ts` | `POST /public/auth/customer/request-code`, `verify-code`, `register`; `POST /auth/login`, `logout`; `GET /auth/me` |
| `src/services/events.service.ts` | `GET /platform/events/featured`, `/platform/events/trending`, `/admin/events`, `/admin/events/slug/{slug}`, `/events/{id}` |
| `src/services/tickets.service.ts` | `GET /public/customer/tickets`; `POST /tickets/purchase` (não chamado) |
| `src/services/users.service.ts` | `GET /users/me`; `PATCH /users/me` (não chamado) |

---

## 5. Configuração de ambiente

```
EXPO_PUBLIC_API_URL=http://localhost:3334   # padrão local
```

- Auth: Bearer token + header `X-API-Key` injetados automaticamente pelo cliente Axios
- Tokens: persistidos via `AsyncStorage`
- Estado global: Zustand (`src/stores/authStore.ts`)
- Cache de dados: React Query (`src/hooks/queryKeys.ts`)
