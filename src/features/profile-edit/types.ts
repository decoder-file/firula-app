export interface ProfileEditErrors {
  name?: string;
  username?: string;
}

export interface ProfileEditScreenProps {
  isLoading: boolean;
  name: string;
  email: string;
  maskedCpf: string;
  maskedPhone: string;
  avatarPreview: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  username: string;
  bio: string;
  instagramHandle: string;
  xHandle: string;
  isPublicProfileEnabled: boolean;
  showCityOnPublicProfile: boolean;
  showEventsOnPublicProfile: boolean;
  errors: ProfileEditErrors;
  isPickingImage: boolean;
  isSavingAvatar: boolean;
  canSaveAvatar: boolean;
  isSavingPersonal: boolean;
  isSavingAddress: boolean;
  isSavingPublicSettings: boolean;
  isDeletingAccount: boolean;
  onBack: () => void;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onAddressNumberChange: (value: string) => void;
  onAddressComplementChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onInstagramHandleChange: (value: string) => void;
  onXHandleChange: (value: string) => void;
  onPublicProfileEnabledChange: (value: boolean) => void;
  onShowCityOnPublicProfileChange: (value: boolean) => void;
  onShowEventsOnPublicProfileChange: (value: boolean) => void;
  onChangePhoto: () => void;
  onSaveAvatar: () => void;
  onSavePersonal: () => void;
  onSaveAddress: () => void;
  onSavePublicSettings: () => void;
  onDeleteAccount: () => void;
}
