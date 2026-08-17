export interface ProfileEditPublicScreenProps {
  isLoading: boolean;
  username: string;
  bio: string;
  instagramHandle: string;
  xHandle: string;
  isPublicProfileEnabled: boolean;
  showCityOnPublicProfile: boolean;
  showEventsOnPublicProfile: boolean;
  usernameError?: string;
  isSavingPublicSettings: boolean;
  onBack: () => void;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onInstagramHandleChange: (value: string) => void;
  onXHandleChange: (value: string) => void;
  onPublicProfileEnabledChange: (value: boolean) => void;
  onShowCityOnPublicProfileChange: (value: boolean) => void;
  onShowEventsOnPublicProfileChange: (value: boolean) => void;
  onSavePublicSettings: () => void;
}
