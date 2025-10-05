import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { authService } from '../services/authService';
import { COLORS, FONT_SIZES, SPACING, COMPONENTS } from '../constants';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Register'
>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

type FormErrors = Partial<{
  name: string;
  email: string;
  cpf: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
  general: string;
}>;

export default function Register({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Informe seu nome completo.';
    }

    if (!email.trim()) {
      nextErrors.email = 'Informe um e-mail válido.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Formato de e-mail inválido.';
    }

    const digits = cpf.replace(/\D/g, '');
    if (!digits) {
      nextErrors.cpf = 'Informe o CPF.';
    } else if (digits.length !== 11) {
      nextErrors.cpf = 'O CPF deve ter 11 dígitos.';
    }

    if (!dateOfBirth.trim()) {
      nextErrors.dateOfBirth = 'Informe a data de nascimento (AAAA-MM-DD).';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      nextErrors.dateOfBirth = 'Use o formato AAAA-MM-DD.';
    }

    if (!password) {
      nextErrors.password = 'Informe uma senha.';
    } else if (password.length < 6) {
      nextErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirme a senha.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'As senhas não coincidem.';
    }

    setErrors(nextErrors);
    setSuccessMessage('');
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        cpf: cpf.replace(/\D/g, ''),
        dateOfBirth: dateOfBirth.trim(),
      });

      setSuccessMessage('Cadastro realizado! Entre com seus dados para continuar.');
      setErrors({});
      setPassword('');
      setConfirmPassword('');
      navigation.navigate('Login');
    } catch (error: any) {
      setErrors({ general: error.message || 'Não foi possível concluir o cadastro.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.wrapper}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Preencha seus dados para ativar sua carteira ShiftBox.
        </Text>

        {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}
        {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="João Silva"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={name}
            onChangeText={setName}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            placeholder="00000000000"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={cpf}
            onChangeText={setCpf}
            keyboardType="number-pad"
            maxLength={14}
          />
          {errors.cpf ? <Text style={styles.errorText}>{errors.cpf}</Text> : null}

          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numbers-and-punctuation"
          />
          {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
            <Text style={styles.linkText}>Já tem conta? Fazer login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.BG_SCREEN,
  },
  scrollContent: {
    // flexGrow: 1,
    padding: SPACING.LG,
  },
  content: {
    paddingTop: 60,
    gap: SPACING.LG,
  },
  title: {
    fontSize: FONT_SIZES.TITLE_MAIN,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_SECONDARY,
  },
  form: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: COMPONENTS.CARD_RADIUS,
    padding: SPACING.LG,
    gap: SPACING.SM,
    ...COMPONENTS.CARD_SHADOW,
  },
  label: {
    fontSize: FONT_SIZES.SM,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  input: {
    height: COMPONENTS.INPUT_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.DIVIDER,
    borderRadius: COMPONENTS.INPUT_RADIUS,
    paddingHorizontal: SPACING.BASE,
    fontSize: FONT_SIZES.BODY,
    color: COLORS.TEXT_PRIMARY,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: COMPONENTS.BUTTON_RADIUS,
    height: COMPONENTS.BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.SM,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.PRIMARY_CONTRAST,
    fontSize: FONT_SIZES.BODY,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: SPACING.BASE,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZES.SM,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
  },
  successText: {
    color: COLORS.SUCCESS,
    fontSize: FONT_SIZES.SM,
  },
});