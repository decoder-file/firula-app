import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff, Mail } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { isApiError } from "@/api/errors";
import { Screen } from "@/components/Screen";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import {
  useConfirmPasswordReset,
  useRequestPasswordResetCode,
  useVerifyPasswordResetCode,
} from "@/hooks/useAuth";

type Step = "email" | "code" | "password";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_INDEX: Record<Step, number> = { email: 1, code: 2, password: 3 };

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState<Date | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codeExpiresMinutes, setCodeExpiresMinutes] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const codeInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  const requestCodeMutation = useRequestPasswordResetCode();
  const verifyCodeMutation = useVerifyPasswordResetCode();
  const confirmMutation = useConfirmPasswordReset();

  const isPending =
    requestCodeMutation.isPending ||
    verifyCodeMutation.isPending ||
    confirmMutation.isPending;

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const clearError = (field: string) =>
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

  const goBack = () => {
    if (step === "code") { setStep("email"); setCode(""); return; }
    if (step === "password") { setStep("code"); setNewPassword(""); setConfirmPassword(""); return; }
    router.back();
  };

  // ── Step 1: request code ──────────────────────────────────────────────────

  const handleRequestCode = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors({ email: "Informe seu email." });
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrors({ email: "Digite um email válido." });
      return;
    }

    setErrors({});
    try {
      const result = await requestCodeMutation.mutateAsync(trimmedEmail);
      setCodeExpiresMinutes(Math.ceil(result.expiresIn / 60));
      setResendCooldown(60);
      setStep("code");
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } catch (error) {
      setErrors({ email: isApiError(error) ? error.message : "Não foi possível enviar o código." });
    }
  };

  // ── Step 2: verify code ───────────────────────────────────────────────────

  const handleVerifyCode = async () => {
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setErrors({ code: "Digite os 6 dígitos do código recebido." });
      return;
    }

    setErrors({});
    try {
      const result = await verifyCodeMutation.mutateAsync({ email: email.trim(), code: trimmedCode });
      setResetToken(result.resetToken);
      setTokenExpiresAt(new Date(Date.now() + result.expiresIn * 1000));
      setStep("password");
      setTimeout(() => passwordInputRef.current?.focus(), 100);
    } catch (error) {
      setErrors({ code: isApiError(error) ? error.message : "Código inválido ou expirado." });
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    try {
      const result = await requestCodeMutation.mutateAsync(email.trim());
      setCodeExpiresMinutes(Math.ceil(result.expiresIn / 60));
      setResendCooldown(60);
      setCode("");
      setErrors({});
    } catch {
      // silent — backend always returns success for security
    }
  };

  // ── Step 3: confirm new password ──────────────────────────────────────────

  const handleConfirmPassword = async () => {
    const nextErrors: Record<string, string> = {};

    if (!newPassword) {
      nextErrors.password = "Informe a nova senha.";
    } else if (newPassword.length < 6) {
      nextErrors.password = "A senha deve ter no mínimo 6 caracteres.";
    }

    if (!confirmPassword) {
      nextErrors.confirm = "Confirme a nova senha.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirm = "As senhas não coincidem.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    try {
      await confirmMutation.mutateAsync({
        resetToken,
        password: newPassword,
        email: email.trim(),
      });
      router.replace("/(tabs)");
    } catch (error) {
      if (isApiError(error) && error.code === "INVALID_RESET_TOKEN") {
        setErrors({ password: "O código expirou. Solicite um novo." });
        setStep("email");
        setCode("");
        setResetToken("");
        return;
      }
      setErrors({ password: isApiError(error) ? error.message : "Não foi possível redefinir a senha." });
    }
  };

  const handleSubmit = () => {
    if (step === "email") handleRequestCode();
    else if (step === "code") handleVerifyCode();
    else handleConfirmPassword();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const stepLabels: Record<Step, { title: string; subtitle: string; button: string }> = {
    email: {
      title: "Esqueci minha senha",
      subtitle: "Informe seu email e enviaremos um código de 6 dígitos para você redefinir sua senha.",
      button: "Enviar código",
    },
    code: {
      title: "Verifique seu email",
      subtitle: `Enviamos um código de 6 dígitos para ${email.trim()}.${codeExpiresMinutes ? ` Ele expira em ${codeExpiresMinutes} min.` : ""}`,
      button: "Verificar código",
    },
    password: {
      title: "Crie uma nova senha",
      subtitle: "Escolha uma senha com no mínimo 6 caracteres.",
      button: "Definir nova senha",
    },
  };

  const current = stepLabels[step];

  return (
    <Screen edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View className="px-4 pb-6 pt-4">
            <IconButton
              accessibilityLabel="Voltar"
              className="mb-6"
              icon={<ChevronLeft color="#141821" size={20} strokeWidth={1.75} />}
              onPress={goBack}
            />

            {/* Step dots */}
            <View className="mb-5 flex-row gap-1.5">
              {([1, 2, 3] as const).map((n) => (
                <View
                  key={n}
                  className={`h-1.5 rounded-full transition-all ${n <= STEP_INDEX[step] ? "bg-primary w-6" : "bg-border w-1.5"}`}
                />
              ))}
            </View>

            <Text className="font-bold text-[28px] text-foreground">{current.title}</Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">{current.subtitle}</Text>
          </View>

          {/* Card */}
          <View className="gap-4 px-4">
            <View className="gap-3 rounded-[28px] bg-card p-5">

              {/* ── Step 1: email ── */}
              {step === "email" ? (
                <FormInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  error={errors.email}
                  keyboardType="email-address"
                  label="Email"
                  onChangeText={(v) => { setEmail(v); clearError("email"); }}
                  onSubmitEditing={handleSubmit}
                  placeholder="cliente@exemplo.com"
                  placeholderTextColor="#727985"
                  returnKeyType="go"
                  submitBehavior="submit"
                  textContentType="emailAddress"
                  value={email}
                />
              ) : null}

              {/* ── Step 2: code ── */}
              {step === "code" ? (
                <>
                  <View className="items-center gap-1 rounded-2xl bg-secondary/50 px-4 py-3">
                    <Mail color="#727985" size={16} strokeWidth={1.5} />
                    <Text className="text-xs text-muted-foreground">{email.trim()}</Text>
                  </View>

                  <FormInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.code}
                    keyboardType="number-pad"
                    label="Código de 6 dígitos"
                    maxLength={6}
                    onChangeText={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); clearError("code"); }}
                    onSubmitEditing={handleSubmit}
                    placeholder="000000"
                    placeholderTextColor="#727985"
                    ref={codeInputRef}
                    returnKeyType="go"
                    submitBehavior="submit"
                    textContentType="oneTimeCode"
                    value={code}
                  />

                  <View className="flex-row items-center justify-between">
                    <Pressable
                      accessibilityRole="button"
                      disabled={resendCooldown > 0 || requestCodeMutation.isPending}
                      onPress={handleResendCode}
                    >
                      <Text className={`text-xs font-medium ${resendCooldown > 0 ? "text-muted-foreground" : "text-primary"}`}>
                        {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : "Reenviar código"}
                      </Text>
                    </Pressable>

                    <Pressable accessibilityRole="button" onPress={() => { setStep("email"); setCode(""); setErrors({}); }}>
                      <Text className="text-xs font-medium text-muted-foreground">Alterar email</Text>
                    </Pressable>
                  </View>
                </>
              ) : null}

              {/* ── Step 3: new password ── */}
              {step === "password" ? (
                <>
                  <FormInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.password}
                    label="Nova senha"
                    onChangeText={(v) => { setNewPassword(v); clearError("password"); }}
                    onRightAdornmentPress={() => setShowPassword((s) => !s)}
                    onSubmitEditing={() => confirmInputRef.current?.focus()}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#727985"
                    ref={passwordInputRef}
                    returnKeyType="next"
                    rightAdornment={showPassword ? <EyeOff color="#727985" size={20} strokeWidth={1.75} /> : <Eye color="#727985" size={20} strokeWidth={1.75} />}
                    rightAdornmentAccessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    secureTextEntry={!showPassword}
                    submitBehavior="submit"
                    textContentType="newPassword"
                    value={newPassword}
                  />

                  <FormInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    error={errors.confirm}
                    label="Confirmar senha"
                    onChangeText={(v) => { setConfirmPassword(v); clearError("confirm"); }}
                    onRightAdornmentPress={() => setShowConfirm((s) => !s)}
                    onSubmitEditing={handleSubmit}
                    placeholder="Repita a senha"
                    placeholderTextColor="#727985"
                    ref={confirmInputRef}
                    returnKeyType="go"
                    rightAdornment={showConfirm ? <EyeOff color="#727985" size={20} strokeWidth={1.75} /> : <Eye color="#727985" size={20} strokeWidth={1.75} />}
                    rightAdornmentAccessibilityLabel={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                    secureTextEntry={!showConfirm}
                    submitBehavior="submit"
                    textContentType="newPassword"
                    value={confirmPassword}
                  />
                </>
              ) : null}

              <FormButton
                className="mt-2"
                disabled={isPending}
                isLoading={isPending}
                label={current.button}
                loadingLabel="Aguarde..."
                onPress={handleSubmit}
              />
            </View>

            {step === "email" ? (
              <Pressable accessibilityRole="button" onPress={() => router.back()} className="items-center py-2">
                <Text className="text-sm text-muted-foreground">
                  Lembrou a senha?{" "}
                  <Text className="font-medium text-primary">Entrar</Text>
                </Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
