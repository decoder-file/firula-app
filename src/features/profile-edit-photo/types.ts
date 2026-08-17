export interface ProfileEditPhotoScreenProps {
  isLoading: boolean;
  name: string;
  avatarPreview: string;
  isPickingImage: boolean;
  isSavingAvatar: boolean;
  canSaveAvatar: boolean;
  onBack: () => void;
  onChangePhoto: () => void;
  onSaveAvatar: () => void;
}
