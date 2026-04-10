import { Lock, ScanFace, Shield, X, Zap } from "lucide-react-native";
import { Modal, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { colors } from "@/theme/colors";

interface FacialIdModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: () => void;
  mandatory?: boolean;
}

export const FacialIdModal = ({ open, onClose, onRegister, mandatory = false }: FacialIdModalProps) => {
  return (
    <Modal animationType="slide" transparent visible={open} onRequestClose={mandatory ? undefined : onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: colors.overlay }}>
        <View className="rounded-t-[28px] bg-card px-6 pb-8 pt-4">
          <View className="mb-4 items-center">
            <View className="h-1 w-10 rounded-full bg-muted" />
          </View>

          {!mandatory ? (
            <AnimatedPressable className="absolute right-4 top-4 p-2" onPress={onClose}>
              <X color={colors.foreground} size={20} strokeWidth={1.5} />
            </AnimatedPressable>
          ) : null}

          <View className="items-center">
            <ScanFace color={colors.primary} size={48} strokeWidth={1.5} />
            <Text className="mt-4 font-bold text-lg text-foreground">Facial ID Firula</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              {mandatory
                ? "Este evento exige cadastro facial para a compra do ingresso."
                : "Este evento utiliza reconhecimento facial para entrada."}
            </Text>
          </View>

          <View className="mt-6 gap-4">
            <BenefitRow icon={<Shield color={colors.primary} size={18} strokeWidth={1.5} />} title="Segurança avançada" text="Seus dados biométricos são criptografados e protegidos." />
            <BenefitRow icon={<Zap color={colors.primary} size={18} strokeWidth={1.5} />} title="Entrada rápida" text="Acesso ao evento em segundos, sem filas." />
            <BenefitRow icon={<Lock color={colors.primary} size={18} strokeWidth={1.5} />} title="Ingresso intransferível" text="Garante que somente você utilize seu ingresso." />
          </View>

          <View className="mt-8 gap-3">
            <AnimatedPressable className="rounded-2xl bg-primary py-4" onPress={onRegister}>
              <Text className="text-center font-bold text-sm text-primary-foreground">Registrar Facial ID</Text>
            </AnimatedPressable>
            {!mandatory ? (
              <AnimatedPressable className="rounded-2xl border border-border py-3.5" onPress={onClose}>
                <Text className="text-center font-medium text-sm text-foreground">Cadastrar depois</Text>
              </AnimatedPressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const BenefitRow = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <View className="flex-row gap-3">
    <View className="mt-0.5">{icon}</View>
    <View className="flex-1">
      <Text className="font-semibold text-sm text-foreground">{title}</Text>
      <Text className="text-xs text-muted-foreground">{text}</Text>
    </View>
  </View>
);