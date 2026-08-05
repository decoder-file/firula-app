import { useState } from "react";
import { Alert, Linking, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import type { AttendedEvent, FollowPerson, FollowTab, PlayerProfileScreenProps } from "@/features/player-profile/types";

const EVENT_BEACH_TENNIS = require("../../../assets/events/event-beach-tennis.jpg");
const EVENT_FUTEVOLEI = require("../../../assets/events/event-futevolei.jpg");
const EVENT_RUNNING = require("../../../assets/events/event-running.jpg");
const EVENT_YOGA = require("../../../assets/events/event-yoga.jpg");

// TODO: dados mockados — trocar por GET /public/profiles/:username quando a
// tela for ligada à API (o backend já expõe esse endpoint e os mesmos campos
// isPublicProfileEnabled/showCityOnPublicProfile usados em profile-edit).
const MOCK_EVENTS: AttendedEvent[] = [
  { id: "ev-1", title: "Festival Firula 2026 — Verão", date: "14 fev", city: "Florianópolis", tag: "Concluído", image: EVENT_YOGA },
  { id: "ev-2", title: "Copa de Futevôlei de Verão", date: "22 fev", city: "Jurerê", tag: "Concluído", image: EVENT_FUTEVOLEI },
  { id: "ev-3", title: "Night Run Floripa 10K", date: "8 mar", city: "Beira-Mar", tag: "Concluído", image: EVENT_RUNNING },
  { id: "ev-4", title: "Beach Tennis Open", date: "20 mar", city: "Jurerê", tag: "Concluído", image: EVENT_BEACH_TENNIS },
  { id: "ev-5", title: "Torneio Society Verão", date: "2 abr", city: "Campeche", tag: "Concluído", image: EVENT_FUTEVOLEI },
];

const MOCK_FOLLOWERS: FollowPerson[] = [
  { id: "bruno", initials: "BA", name: "Bruno Alves", meta: "Rank Prata I · Beach Tennis", isFollowing: true },
  { id: "carla", initials: "CN", name: "Carla Nunes", meta: "Rank Ouro I · Futevôlei", isFollowing: false },
  { id: "pedro", initials: "PM", name: "Pedro Moraes", meta: "Rank Prata III · Futebol", isFollowing: true },
  { id: "ana", initials: "AL", name: "Ana Lima", meta: "Rank Ouro II · Beach Tennis", isFollowing: false },
  { id: "marcos", initials: "MS", name: "Marcos Silva", meta: "Rank Prata II · Futevôlei", isFollowing: true },
  { id: "julia", initials: "JR", name: "Julia Ramos", meta: "Rank Platina · Futebol", isFollowing: false },
];

const MOCK_FOLLOWING: FollowPerson[] = MOCK_FOLLOWERS.slice().reverse();

export function usePlayerProfileRouteProps(): PlayerProfileScreenProps {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();

  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [followers, setFollowers] = useState<FollowPerson[]>(MOCK_FOLLOWERS);
  const [following, setFollowing] = useState<FollowPerson[]>(MOCK_FOLLOWING);

  const instagramHandle = `@${username || "bruno.alves"}`;
  const instagramUrl = `https://instagram.com/${username || "bruno.alves"}`;

  const toggleFollowPerson = (tab: FollowTab, personId: string) => {
    const setList = tab === "followers" ? setFollowers : setFollowing;
    setList((list) =>
      list.map((person) => (person.id === personId ? { ...person, isFollowing: !person.isFollowing } : person)),
    );
  };

  return {
    name: "Bruno Alves",
    handle: instagramHandle,
    city: "Florianópolis, SC",
    initials: "BA",
    instagramHandle,
    instagramUrl,
    followersCount: 289,
    followingCount: 412,
    eventsCount: MOCK_EVENTS.length,
    events: MOCK_EVENTS,
    followers,
    following,

    isFollowing,
    isBlocked,

    onBack: () => router.back(),
    onOpenInstagram: async () => {
      const canOpen = await Linking.canOpenURL(instagramUrl);
      if (canOpen) await Linking.openURL(instagramUrl);
    },
    onToggleFollow: () => setIsFollowing((value) => !value),
    onUnfollow: () => setIsFollowing(false),
    onChallenge: () => Alert.alert("Em breve", "Os desafios 1x1 ainda não estão disponíveis."),
    onShareProfile: async () => {
      await Share.share({ message: `Confira o perfil de Bruno Alves na Firula\n${instagramUrl}` });
    },
    onToggleBlock: () => setIsBlocked((value) => !value),
    onReport: () => {},
    onToggleFollowPerson: toggleFollowPerson,
  };
}
