# Firula Design System — código React Native

Implementação em **React Native + Expo + TypeScript** dos tokens e componentes
especificados no styleguide visual (`Firula Design System.dc.html`).

Refina a base que já existe no app: verde `#1FBD63`, Plus Jakarta Sans, NativeWind.

## Como instalar no app

1. Copie a pasta `design-system/` para `mobile/src/design-system/`.
2. Envolva o app com o provider (em `app/_layout.tsx`, dentro do `AppProviders`):

   ```tsx
   import { ThemeProvider } from '@/design-system/foundation';

   <ThemeProvider initialMode="system">
     <App />
   </ThemeProvider>
   ```

3. Use os tokens e componentes:

   ```tsx
   import { useTheme } from '@/design-system/foundation';
   import { Button, IconButton, Chip, Badge, Text } from '@/design-system/atoms';
   import { Heart } from 'lucide-react-native';

   const { colors, spacing } = useTheme();

   <View style={{ backgroundColor: colors.background, padding: spacing.s4 }}>
     <Text token="titleLg">Próximos eventos</Text>
     <Button label="Comprar ingresso" onPress={buy} />
     <IconButton icon={Heart} accessibilityLabel="Favoritar" onPress={fav} />
   </View>
   ```

## O que está incluído (fase 1 do roadmap)

**foundation/** — camada de tokens, sem lógica visual. Fonte única de verdade.
- `colors.ts` — escala da marca + paletas semânticas **light e dark** + contrastes anotados
- `typography.ts` — escala em sp + pesos (Plus Jakarta Sans)
- `spacing.ts` — escala 4pt + constantes de layout (tablet, toque mín. 48dp)
- `radius.ts` · `elevation.ts` (3 níveis) · `motion.ts` · `icons.ts`
- `ThemeProvider.tsx` — `useTheme()`, `useToggleScheme()`, segue o esquema do sistema
- `useReducedMotion.ts` — acessibilidade de movimento

**atoms/** — componentes tipados, com `useTheme()` para cores e a11y completa:
- `PressScale` — press-scale 60fps, respeita reduce-motion
- `Text` — wrapper que força escala + cor do tema
- `Surface` · `Divider` — base de cards e separadores
- `Button` — 5 variantes, 2 tamanhos, loading, ícone
- `IconButton` — área 48dp, label obrigatória, badge
- `TextField` — label acima, erro com ícone+texto, toggle de senha, foco
- `SearchBar` — pill 48dp, botão limpar
- `Checkbox` · `RadioGroup` · `Switch` — linha inteira tocável, estado não-cromático
- `Avatar` + `AvatarGroup` — iniciais com cor determinística por nome, status
- `Badge` — status/contagem, ponto não-cromático
- `Chip` — filtro tocável, seleção por check + peso

**molecules/**
- `ListItem` — altura fixa (56/64/72dp), React.memo, para listas virtualizadas
- `Skeleton` + `SkeletonList` — pulso de opacidade, espelha o layout real
- `EmptyState` — empty/noResults/error/offline, sempre com ação que avança
- `Dialog` — Modal com foco preso, máx. 2 ações, destrutiva à direita
- `BottomSheet` — handle + arrastar-para-fechar (gesture), base de Select/filtros
- `Select` — abre BottomSheet de opções (nunca dropdown flutuante)
- `Snackbar` — `SnackbarProvider` + `useSnackbar()`; Toast passivo ou com ação (Desfazer)

**organisms/**
- `EventCard` — featured/default/compact, altura fixa, React.memo, fallback sem imagem
- `TicketCard` — bilhete perfurado + slot de QR, status por cor+ícone+texto
- `TopBar` — root/detail/transparent, safe-area, máx. 2 ações
- `BottomNavigation` — 3–5 destinos, ícone preenchido = ativo, badge, safe-area
- `TabBar` — abas de conteúdo, indicador deslizante, roláveis quando >4
- `Drawer` — navegação secundária / troca de contexto (modo Organizador)

**templates/**
- `ScreenContainer` — padding lateral + safe-area + tablet (conteúdo máx. 640dp)

**atoms (Fase 4)** — `FAB` (56dp ou estendido, máx. 1/tela), `Slider` (valor sempre visível)

### Uso com FlashList (listas longas)

```tsx
import { FlashList } from '@shopify/flash-list';
import { EventCard } from '@/design-system/organisms';
import { SkeletonList, EmptyState } from '@/design-system/molecules';

<FlashList
  data={events}
  estimatedItemSize={96}
  keyExtractor={(e) => e.id}
  renderItem={({ item }) => <EventCard event={item} variant="compact" onPress={() => open(item)} />}
  ListEmptyComponent={loading
    ? <SkeletonList count={6} itemHeight={96} />
    : <EmptyState variant="empty" icon={Ticket} title="Nenhum evento" />}
/>
```

Cards e ListItem têm **altura fixa por variante** — combine com `estimatedItemSize`
(FlashList) ou `getItemLayout` (FlatList) para rolagem sem jank.

## Decisão de arquitetura: cores via `useTheme()`, não classes `dark:`

Seu `tailwind.config` usa cores **estáticas**. Para dark mode que troca em runtime de
forma confiável, os componentes leem cor via `useTheme()` (valores JS) e aplicam em
`style`. Estrutura (spacing, radius, fl*ex*) pode continuar em `className` NativeWind.
Se preferir manter tudo em NativeWind com `dark:`, dá para migrar as cores do config
para CSS vars — me avise que ajusto os componentes.

## Instalação de providers (uma vez)

Em `app/_layout.tsx`, aninhe os providers na ordem correta:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, SnackbarProvider } from '@/design-system';

<GestureHandlerRootView style={{ flex: 1 }}>
  <SafeAreaProvider>
    <ThemeProvider initialMode="system">
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </SafeAreaProvider>
</GestureHandlerRootView>
```

Dependências assumidas (comuns em Expo): `react-native-reanimated`,
`react-native-gesture-handler`, `react-native-safe-area-context`,
`lucide-react-native`. `Slider` usa `@react-native-community/slider` (opcional —
veja a nota no arquivo). `FlashList`: `@shopify/flash-list`.

## Checklist de acessibilidade (aplicado em todos os componentes)

- **Contraste** — todo par texto/fundo dos tokens semânticos passa AA (vários AAA);
  valores anotados em `colors.ts`. Texto sobre `primary` usa `onPrimary` (8.9:1).
- **Área de toque** — nunca < 48dp: Button `sm` mantém `minHeight:48`, IconButton
  é 48×48, linhas de Checkbox/Radio/Switch têm a linha inteira tocável.
- **Nunca só cor** — status carregam ícone/ponto + texto; seleção usa check + peso +
  posição (Switch/Radio), não apenas matiz.
- **Leitor de tela** — `accessibilityRole/State/Label` em cada control; overlays com
  `accessibilityViewIsModal`; Snackbar com `accessibilityLiveRegion` (assertive p/ erro).
- **Tipografia escalável** — `fontSize` em sp respeita a escala do sistema.
- **Reduce-motion** — `useReducedMotion` desliga press-scale, pulso do Skeleton e
  a animação do Switch quando o usuário pede menos movimento.
- **Tablet** — `ScreenContainer` centraliza o conteúdo a 640dp e amplia o padding.

## Sistema completo — nada pendente

As 4 fases do roadmap estão implementadas. Próximos passos sugeridos:
- Migrar telas existentes (`app/*.tsx`) para consumir o DS, começando por login/checkout.
- Escrever testes de a11y (jest + `@testing-library/react-native`) por componente.
- Validar contraste do dark em dispositivo real e ajustar tokens se necessário.
