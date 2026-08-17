export interface ProfileEditPersonalScreenProps {
  isLoading: boolean;
  name: string;
  email: string;
  maskedCpf: string;
  maskedPhone: string;
  nameError?: string;
  isSavingPersonal: boolean;
  onBack: () => void;
  onNameChange: (value: string) => void;
  onSavePersonal: () => void;
}
