import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  isApiError,
  isEmailAlreadyExistsError,
  isInvalidCredentialsError,
  isWeakPasswordError,
} from "@/api/errors";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { useLogin, useRegister } from "@/hooks/useAuth";

type AuthMode = "login" | "register";
type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown) => {
  if (isInvalidCredentialsError(error)) {
    return "Email ou senha incorretos.";
  }

  if (isEmailAlreadyExistsError(error)) {
    return "Este email já está cadastrado.";
  }

  if (isWeakPasswordError(error)) {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (isApiError(error)) {
    return error.message;
  }

  return "Não foi possível continuar. Tente novamente.";
};

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(params.mode === "register" ? "register" : "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const isPending = loginMutation.isPending || registerMutation.isPending;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setIsPasswordVisible(false);
  };

  useEffect(() => {
    if (params.mode === "register") {
      resetForm();
      setMode("register");
    }
  }, [params.mode]);

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    resetForm();
    setMode(nextMode);
  };

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: undefined,
      };
    });
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (mode === "register" && !name.trim()) {
      nextErrors.name = "Informe seu nome para criar a conta.";
    }

    if (!email.trim()) {
      nextErrors.email = "Preencha seu email.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Digite um email válido.";
    }

    if (!password.trim()) {
      nextErrors.password = "Preencha sua senha.";
    } else if (mode === "register" && password.trim().length < 8) {
      nextErrors.password = "A senha deve ter pelo menos 8 caracteres.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setErrors({});

      if (mode === "login") {
        await loginMutation.mutateAsync({ email: email.trim(), password: password.trim() });
      } else {
        await registerMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
        });
      }

      router.back();
    } catch (error) {
      if (isInvalidCredentialsError(error)) {
        setErrors({
          email: "Email ou senha incorretos.",
          password: "Email ou senha incorretos.",
        });
        return;
      }

      if (isEmailAlreadyExistsError(error)) {
        setErrors({ email: "Este email já está cadastrado." });
        return;
      }

      if (isWeakPasswordError(error)) {
        setErrors({ password: "A senha deve ter pelo menos 8 caracteres." });
        return;
      }

      setErrors({ password: getErrorMessage(error) });
    }
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View className="px-4 pb-8 pt-4">
            <AnimatedPressable className="mb-6 h-11 w-11 items-center justify-center rounded-full bg-card" onPress={() => router.back()}>
              <ChevronLeft color="#141821" size={20} strokeWidth={1.75} />
            </AnimatedPressable>

            <Text className="font-bold text-[28px] text-foreground">
              {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">
              {mode === "login"
                ? "Use seu email para acessar seus ingressos, perfil e preferências."
                : "Cadastre-se para salvar ingressos, favoritos e continuar sua compra."}
            </Text>
          </View>

          <View className="gap-4 px-4">
            <View className="flex-row rounded-2xl bg-secondary p-1">
              {(["login", "register"] as const).map((item) => {
                const active = item === mode;

                return (
                  <AnimatedPressable
                    key={item}
                    className={`flex-1 rounded-[18px] px-4 py-3 ${active ? "bg-card" : "bg-transparent"}`}
                    onPress={() => handleModeChange(item)}
                  >
                    <Text className={`text-center font-medium text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
                      {item === "login" ? "Entrar" : "Criar conta"}
                    </Text>
                  </AnimatedPressable>
                );
              })}
            </View>

            <View className="gap-3 rounded-[28px] bg-card p-5">
              {mode === "register" ? (
                <View>
                  <Text className="mb-2 font-medium text-sm text-foreground">Nome</Text>
                  <TextInput
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect={false}
                    className={`rounded-2xl border bg-background px-4 py-4 text-sm text-foreground ${errors.name ? "border-red-500" : "border-border"}`}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                    onChangeText={(value) => {
                      setName(value);
                      clearFieldError("name");
                    }}
                    placeholder="João Silva"
                    placeholderTextColor="#727985"
                    ref={nameInputRef}
                    returnKeyType="next"
                    textContentType="name"
                    submitBehavior="submit"
                    value={name}
                  />
                  {errors.name ? <Text className="mt-2 text-xs text-destructive">{errors.name}</Text> : null}
                </View>
              ) : null}

              <View>
                <Text className="mb-2 font-medium text-sm text-foreground">Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  className={`rounded-2xl border bg-background px-4 py-4 text-sm text-foreground ${errors.email ? "border-red-500" : "border-border"}`}
                  keyboardType="email-address"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  onChangeText={(value) => {
                    setEmail(value);
                    clearFieldError("email");
                  }}
                  placeholder="cliente@exemplo.com"
                  placeholderTextColor="#727985"
                  ref={emailInputRef}
                  returnKeyType="next"
                  textContentType="emailAddress"
                  submitBehavior="submit"
                  value={email}
                />
                {errors.email ? <Text className="mt-2 text-xs text-destructive">{errors.email}</Text> : null}
              </View>

              <View>
                <Text className="mb-2 font-medium text-sm text-foreground">Senha</Text>
                <View className="relative">
                  <TextInput
                    autoCapitalize="none"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    autoCorrect={false}
                    className={`rounded-2xl border bg-background px-4 py-4 pr-14 text-sm text-foreground ${errors.password ? "border-red-500" : "border-border"}`}
                    onSubmitEditing={handleSubmit}
                    onChangeText={(value) => {
                      setPassword(value);
                      clearFieldError("password");
                    }}
                    placeholder="Minimo de 8 caracteres"
                    placeholderTextColor="#727985"
                    ref={passwordInputRef}
                    returnKeyType="go"
                    secureTextEntry={!isPasswordVisible}
                    textContentType={mode === "login" ? "password" : "newPassword"}
                    submitBehavior="submit"
                    value={password}
                  />

                  <AnimatedPressable
                    accessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-4 top-0 h-full items-center justify-center"
                    hitSlop={10}
                    onPress={() => setIsPasswordVisible((current) => !current)}
                  >
                    {isPasswordVisible ? (
                      <EyeOff color="#727985" size={20} strokeWidth={1.75} />
                    ) : (
                      <Eye color="#727985" size={20} strokeWidth={1.75} />
                    )}
                  </AnimatedPressable>
                </View>
                {errors.password ? <Text className="mt-2 text-xs text-destructive">{errors.password}</Text> : null}
              </View>

              <AnimatedPressable className="mt-2 items-center rounded-2xl bg-primary px-4 py-4" disabled={isPending} onPress={handleSubmit}>
                <Text className="font-bold text-base text-primary-foreground">
                  {isPending ? "Carregando..." : mode === "login" ? "Entrar" : "Criar conta"}
                </Text>
              </AnimatedPressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}