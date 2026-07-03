import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
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

import {
  isApiError,
  isInvalidCredentialsError,
} from "@/api/errors";
import { Screen } from "@/components/Screen";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  useLogin,
  useRegister,
  useRequestLoginCode,
  useVerifyLoginCode,
} from "@/hooks/useAuth";

type AuthMode = "login" | "register";
type LoginStep = "email" | "code" | "password";

interface LoginScreenProps {
  lockMode?: AuthMode;
  onAuthenticated?: () => void;
  onRequestRegister?: () => void;
}

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  password?: string;
  code?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{11}$/;
const CPF_REGEX = /^\d{11}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const MODE_OPTIONS: Array<{ label: string; value: AuthMode }> = [
  { label: "Entrar", value: "login" },
  { label: "Criar conta", value: "register" },
];

const getErrorMessage = (error: unknown) => {
  if (isInvalidCredentialsError(error)) {
    return "Email ou senha incorretos.";
  }

  if (isApiError(error)) {
    return error.message;
  }

  return "Não foi possível continuar. Tente novamente.";
};

const isValidCpf = (cpf: string) => {
  const digitsOnly = cpf.replace(/\D/g, "");

  if (!/^\d{11}$/.test(digitsOnly)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digitsOnly)) {
    return false;
  }

  const calculateCheckDigit = (base: string, factor: number) => {
    let total = 0;

    for (let index = 0; index < base.length; index += 1) {
      total += Number(base[index]) * (factor - index);
    }

    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateCheckDigit(digitsOnly.slice(0, 9), 10);
  const secondDigit = calculateCheckDigit(digitsOnly.slice(0, 10), 11);

  return firstDigit === Number(digitsOnly[9]) && secondDigit === Number(digitsOnly[10]);
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

export function LoginScreen({
  lockMode,
  onAuthenticated,
  onRequestRegister,
}: LoginScreenProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const initialMode: AuthMode = lockMode ?? (params.mode === "register" ? "register" : "login");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [codeExpiresIn, setCodeExpiresIn] = useState<number | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const cpfInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const requestCodeMutation = useRequestLoginCode();
  const verifyCodeMutation = useVerifyLoginCode();

  const isPending =
    loginMutation.isPending ||
    registerMutation.isPending ||
    requestCodeMutation.isPending ||
    verifyCodeMutation.isPending;

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCpf("");
    setPassword("");
    setCode("");
    setStatusMessage("");
    setCodeExpiresIn(null);
    setErrors({});
    setLoginStep("email");
    setIsPasswordVisible(false);
  };

  useEffect(() => {
    if (lockMode) {
      return;
    }

    if (params.mode === "register") {
      resetForm();
      setMode("register");
    }
  }, [lockMode, params.mode]);

  useEffect(() => {
    if (!lockMode) {
      return;
    }

    resetForm();
    setMode(lockMode);
  }, [lockMode]);

  const handleModeChange = (nextMode: AuthMode) => {
    if (lockMode) {
      return;
    }

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

  const validateEmail = () => {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Preencha seu email.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Digite um email válido.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const nextErrors: FormErrors = {};
    const normalizedName = name.trim();
    const normalizedEmail = email.trim();
    const normalizedPhone = phone.trim();
    const normalizedCpf = cpf.trim();
    const normalizedPassword = password.trim();

    if (!normalizedName) {
      nextErrors.name = "Informe seu nome para criar a conta.";
    } else if (normalizedName.length < 2) {
      nextErrors.name = "Informe seu nome completo.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Preencha seu email.";
    } else if (!EMAIL_REGEX.test(normalizedEmail)) {
      nextErrors.email = "Digite um email válido.";
    }

    if (!normalizedPhone) {
      nextErrors.phone = "Preencha seu telefone.";
    } else if (!PHONE_REGEX.test(normalizedPhone)) {
      nextErrors.phone = "O telefone deve ter 11 dígitos (DDD + número).";
    }

    if (!normalizedCpf) {
      nextErrors.cpf = "Preencha seu CPF.";
    } else if (!CPF_REGEX.test(normalizedCpf)) {
      nextErrors.cpf = "O CPF deve conter 11 dígitos.";
    } else if (!isValidCpf(normalizedCpf)) {
      nextErrors.cpf = "Digite um CPF válido.";
    }

    if (!normalizedPassword) {
      nextErrors.password = "Preencha sua senha.";
    } else if (!STRONG_PASSWORD_REGEX.test(normalizedPassword)) {
      nextErrors.password = "A senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e símbolo.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePasswordLogin = () => {
    if (password.trim()) {
      return true;
    }

    setErrors((current) => ({ ...current, password: "Preencha sua senha." }));
    return false;
  };

  const validateCodeLogin = () => {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setErrors((current) => ({ ...current, code: "Digite o código recebido por email." }));
      return false;
    }

    if (!/^\d{5}$/.test(normalizedCode)) {
      setErrors((current) => ({ ...current, code: "O código deve ter exatamente 5 dígitos numéricos." }));
      return false;
    }

    return true;
  };

  const validateCpfOnBlur = () => {
    const normalizedCpf = cpf.trim();

    if (!normalizedCpf) {
      return;
    }

    if (!CPF_REGEX.test(normalizedCpf)) {
      setErrors((current) => ({
        ...current,
        cpf: "O CPF deve conter 11 dígitos.",
      }));
    }
  };

  const handleSubmitLogin = async () => {
    if (!validateEmail()) {
      return;
    }

    const normalizedEmail = email.trim();

    if (loginStep === "email") {
      try {
        setErrors({});
        const response = await requestCodeMutation.mutateAsync({ email: normalizedEmail });
        setStatusMessage(response.message);
        setCodeExpiresIn(response.expiresIn);
        setLoginStep("code");
        setCode("");
        setTimeout(() => codeInputRef.current?.focus(), 50);
      } catch {
        setStatusMessage("Não foi possível enviar o código. Continue com sua senha.");
        setCodeExpiresIn(null);
        setLoginStep("password");
        setPassword("");
        setTimeout(() => passwordInputRef.current?.focus(), 50);
      }

      return;
    }

    if (loginStep === "code") {
      if (!validateCodeLogin()) {
        return;
      }

      try {
        setErrors({});
        await verifyCodeMutation.mutateAsync({
          email: normalizedEmail,
          code: code.trim(),
        });
        if (onAuthenticated) {
          onAuthenticated();
        } else {
          router.back();
        }
      } catch (error) {
        setErrors({ code: getErrorMessage(error) });
      }

      return;
    }

    if (!validatePasswordLogin()) {
      return;
    }

    try {
      setErrors({});
      await loginMutation.mutateAsync({ email: normalizedEmail, password: password.trim() });
      if (onAuthenticated) {
        onAuthenticated();
      } else {
        router.back();
      }
    } catch (error) {
      if (isInvalidCredentialsError(error)) {
        setErrors({
          email: "Email ou senha incorretos.",
          password: "Email ou senha incorretos.",
        });
        return;
      }

      setErrors({ password: getErrorMessage(error) });
    }
  };

  const handleSubmitRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }

    try {
      setErrors({});
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        password: password.trim(),
      });

      setMode("login");
      setLoginStep("email");
      setName("");
      setPhone("");
      setCpf("");
      setPassword("");
      setCode("");
      setCodeExpiresIn(null);
      setErrors({});
      setStatusMessage("Conta criada com sucesso. Continue com seu email para entrar.");
    } catch (error) {
      if (isApiError(error) && /email.*cadastrado/i.test(error.message)) {
        setErrors({ email: "Este email já está cadastrado." });
      } else {
        setErrors({ password: getErrorMessage(error) });
      }
    }
  };

  const handleSubmit = async () => {
    if (mode === "register") {
      await handleSubmitRegister();
      return;
    }

    await handleSubmitLogin();
  };

  const loginButtonLabel =
    loginStep === "email"
      ? "Continuar"
      : loginStep === "code"
        ? "Entrar com código"
        : "Entrar com senha";

  return (
    <Screen edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View className="px-4 pb-8 pt-4">
            <IconButton
              accessibilityLabel="Voltar"
              className="mb-6"
              icon={<ChevronLeft color="#141821" size={20} strokeWidth={1.75} />}
              onPress={() => router.back()}
            />

            <Text className="font-bold text-[28px] text-foreground">
              {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">
              {mode === "login"
                ? "Use seu email para receber um código de acesso ou entre com sua senha."
                : "Cadastre-se para salvar ingressos, favoritos e continuar sua compra."}
            </Text>
          </View>

          <View className="gap-4 px-4">
            {!lockMode ? (
              <SegmentedControl options={MODE_OPTIONS} onChange={handleModeChange} value={mode} />
            ) : null}

            <View className="gap-3 rounded-[28px] bg-card p-5">
              {mode === "register" ? (
                <FormInput
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect={false}
                  error={errors.name}
                  label="Nome"
                  onChangeText={(value) => {
                    setName(value);
                    clearFieldError("name");
                  }}
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  placeholder="João Silva"
                  placeholderTextColor="#727985"
                  ref={nameInputRef}
                  returnKeyType="next"
                  submitBehavior="submit"
                  textContentType="name"
                  value={name}
                />
              ) : null}

              <FormInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                error={errors.email}
                keyboardType="email-address"
                label="Email"
                onChangeText={(value) => {
                  setEmail(value);
                  clearFieldError("email");

                  if (mode === "login") {
                    setLoginStep("email");
                    setCode("");
                    setPassword("");
                    setCodeExpiresIn(null);
                    setStatusMessage("");
                  }
                }}
                onSubmitEditing={() => {
                  if (mode === "register") {
                    phoneInputRef.current?.focus();
                    return;
                  }

                  handleSubmit();
                }}
                placeholder="cliente@exemplo.com"
                placeholderTextColor="#727985"
                ref={emailInputRef}
                returnKeyType={mode === "register" ? "next" : "go"}
                submitBehavior="submit"
                textContentType="emailAddress"
                value={email}
              />

              {mode === "login" && statusMessage ? (
                <Text className="text-xs text-muted-foreground">
                  {statusMessage}
                  {codeExpiresIn ? ` (expira em ${Math.ceil(codeExpiresIn / 60)} min)` : ""}
                </Text>
              ) : null}

              {mode === "register" ? (
                <FormInput
                  autoCapitalize="none"
                  autoComplete="tel"
                  autoCorrect={false}
                  error={errors.phone}
                  keyboardType="number-pad"
                  label="Telefone"
                  onChangeText={(value) => {
                    const normalizedPhone = value.replace(/\D/g, "").slice(0, 11);
                    setPhone(normalizedPhone);
                    clearFieldError("phone");
                  }}
                  onSubmitEditing={() => cpfInputRef.current?.focus()}
                  placeholder="(11) 99988-7766"
                  placeholderTextColor="#727985"
                  ref={phoneInputRef}
                  returnKeyType="next"
                  submitBehavior="submit"
                  textContentType="telephoneNumber"
                  maxLength={15}
                  value={formatPhone(phone)}
                />
              ) : null}

              {mode === "register" ? (
                <FormInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.cpf}
                  keyboardType="number-pad"
                  label="CPF"
                  onBlur={validateCpfOnBlur}
                  onChangeText={(value) => {
                    const normalizedCpf = value.replace(/\D/g, "").slice(0, 11);
                    setCpf(normalizedCpf);
                    clearFieldError("cpf");
                  }}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  placeholder="123.456.789-01"
                  placeholderTextColor="#727985"
                  ref={cpfInputRef}
                  returnKeyType="next"
                  submitBehavior="submit"
                  maxLength={14}
                  value={formatCpf(cpf)}
                />
              ) : null}

              {mode === "login" && loginStep === "code" ? (
                <FormInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.code}
                  keyboardType="number-pad"
                  label="Código"
                  onChangeText={(value) => {
                    const numericCode = value.replace(/\D/g, "").slice(0, 5);
                    setCode(numericCode);
                    clearFieldError("code");
                  }}
                  onSubmitEditing={handleSubmit}
                  placeholder="Digite o código recebido"
                  placeholderTextColor="#727985"
                  ref={codeInputRef}
                  returnKeyType="go"
                  submitBehavior="submit"
                  textContentType="oneTimeCode"
                  maxLength={5}
                  value={code}
                />
              ) : null}

              {mode === "login" && loginStep === "password" ? (
                <FormInput
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect={false}
                  error={errors.password}
                  label="Senha"
                  onChangeText={(value) => {
                    setPassword(value);
                    clearFieldError("password");
                  }}
                  onRightAdornmentPress={() => setIsPasswordVisible((current) => !current)}
                  onSubmitEditing={handleSubmit}
                  placeholder="Sua senha"
                  placeholderTextColor="#727985"
                  ref={passwordInputRef}
                  returnKeyType="go"
                  rightAdornment={
                    isPasswordVisible ? (
                      <EyeOff color="#727985" size={20} strokeWidth={1.75} />
                    ) : (
                      <Eye color="#727985" size={20} strokeWidth={1.75} />
                    )
                  }
                  rightAdornmentAccessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  secureTextEntry={!isPasswordVisible}
                  submitBehavior="submit"
                  textContentType="password"
                  value={password}
                />
              ) : null}

              {mode === "register" ? (
                <FormInput
                  autoCapitalize="none"
                  autoComplete="new-password"
                  autoCorrect={false}
                  error={errors.password}
                  label="Senha"
                  onChangeText={(value) => {
                    setPassword(value);
                    clearFieldError("password");
                  }}
                  onRightAdornmentPress={() => setIsPasswordVisible((current) => !current)}
                  onSubmitEditing={handleSubmit}
                  placeholder="Mínimo de 8 caracteres"
                  placeholderTextColor="#727985"
                  ref={passwordInputRef}
                  returnKeyType="go"
                  rightAdornment={
                    isPasswordVisible ? (
                      <EyeOff color="#727985" size={20} strokeWidth={1.75} />
                    ) : (
                      <Eye color="#727985" size={20} strokeWidth={1.75} />
                    )
                  }
                  rightAdornmentAccessibilityLabel={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                  secureTextEntry={!isPasswordVisible}
                  submitBehavior="submit"
                  textContentType="newPassword"
                  value={password}
                />
              ) : null}

              {mode === "login" && loginStep === "code" ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setLoginStep("password");
                    setStatusMessage("Não recebeu o código? Entre com sua senha.");
                    setCodeExpiresIn(null);
                    setTimeout(() => passwordInputRef.current?.focus(), 50);
                  }}
                >
                  <Text className="text-center text-xs font-medium text-muted-foreground">
                    Não recebi o código
                  </Text>
                </Pressable>
              ) : null}

              {mode === "login" && loginStep === "password" ? (
                <View className="gap-2">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setLoginStep("email");
                      setPassword("");
                      setStatusMessage("");
                    }}
                  >
                    <Text className="text-center text-xs font-medium text-muted-foreground">
                      Tentar novamente com código por email
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: "/forgot-password", params: { email } })}
                  >
                    <Text className="text-center text-xs font-medium text-primary">
                      Esqueci minha senha
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <FormButton
                className="mt-2"
                disabled={isPending}
                isLoading={isPending}
                label={mode === "register" ? "Criar conta" : loginButtonLabel}
                onPress={handleSubmit}
              />

              {lockMode === "login" ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={onRequestRegister ?? (() => router.push("/register"))}
                >
                  <Text className="text-center text-xs font-medium text-primary">
                    Não tem conta? Criar conta
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default function LoginRoute() {
  return <LoginScreen />;
}
