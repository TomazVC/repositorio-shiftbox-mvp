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

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

export default function Login({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await authService.login({ email, password });
      navigation.replace('MainTabs');
    } catch (error: any) {
      setErrorMessage(error.message || 'Não foi possível fazer o login.');
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
        <Text style={styles.title}>ShiftBox</Text>
        <Text style={styles.subtitle}>Carteira digital conectada ao pool</Text>

        <View style={styles.form}>
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

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="********"
            placeholderTextColor={COLORS.PLACEHOLDER}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.testCredentials}>
          <Text style={styles.testText}>Credenciais de teste:</Text>
          <Text style={styles.testEmail}>joao@example.com / senha123</Text>
          <Text style={styles.testEmail}>maria@example.com / senha123</Text>
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
    justifyContent: 'center',
    padding: SPACING.LG,
  },
  content: {
    gap: SPACING['2XL'],
  },
  title: {
    fontSize: FONT_SIZES.TITLE_MAIN,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.SM,
  },
  subtitle: {
    fontSize: FONT_SIZES.BODY,
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING['2XL'],
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
  errorText: {
    color: COLORS.ERROR,
    fontSize: FONT_SIZES.SM,
    marginTop: SPACING.XS,
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
  testCredentials: {
    alignItems: 'center',
    gap: SPACING.XS,
  },
  testText: {
    fontSize: FONT_SIZES.AUXILIARY,
    color: COLORS.TEXT_SECONDARY,
  },
  testEmail: {
    fontSize: FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    fontFamily: 'monospace',
  },
});