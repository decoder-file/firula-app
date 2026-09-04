import React from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function PhotoLightbox({
  photoUrl,
  onClose,
}: {
  photoUrl: string | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const visible = !!photoUrl;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar foto ampliada"
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="contain" />
        ) : null}
      </Pressable>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
        style={[styles.closeButton, { top: insets.top + 12 }]}
      >
        <X size={20} color="#FFFFFF" strokeWidth={2} />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
});
