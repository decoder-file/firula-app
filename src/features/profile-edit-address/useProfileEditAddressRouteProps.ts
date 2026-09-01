import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { isApiError } from "@/api/errors";
import { queryKeys } from "@/hooks/queryKeys";
import { useIsCustomerScoped } from "@/hooks/useAuth";
import { profileService } from "@/services/profile.service";
import type { ProfileEditAddressScreenProps } from "@/features/profile-edit-address/types";

export const useProfileEditAddressRouteProps = (): ProfileEditAddressScreenProps => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isCustomerScoped = useIsCustomerScoped();

  const { data: profile, isPending: isLoading } = useQuery({
    queryKey: queryKeys.profile.customer(),
    queryFn: profileService.getCompleteProfile,
    enabled: isCustomerScoped,
  });

  const updateAddressMutation = useMutation({ mutationFn: profileService.updateAddress });

  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    if (!profile) {
      return;
    }

    setAddress(profile.address.address ?? "");
    setAddressNumber(profile.address.addressNumber ?? "");
    setAddressComplement(profile.address.addressComplement ?? "");
    setNeighborhood(profile.address.neighborhood ?? "");
    setCity(profile.address.city ?? "");
    setState(profile.address.state ?? "");
    setPostalCode(profile.address.postalCode ?? "");
  }, [profile]);

  const handleSaveAddress = async () => {
    try {
      await updateAddressMutation.mutateAsync({
        address: address.trim(),
        addressNumber: addressNumber.trim(),
        addressComplement: addressComplement.trim() || undefined,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.customer() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      Alert.alert("Endereço atualizado", "As informações de endereço foram salvas com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar endereço.";
      Alert.alert("Erro ao salvar", message);
    }
  };

  return {
    isLoading,
    address,
    addressNumber,
    addressComplement,
    neighborhood,
    city,
    state,
    postalCode,
    isSavingAddress: updateAddressMutation.isPending,
    onBack: () => router.back(),
    onAddressChange: setAddress,
    onAddressNumberChange: setAddressNumber,
    onAddressComplementChange: setAddressComplement,
    onNeighborhoodChange: setNeighborhood,
    onCityChange: setCity,
    onStateChange: setState,
    onPostalCodeChange: setPostalCode,
    onSaveAddress: handleSaveAddress,
  };
};
