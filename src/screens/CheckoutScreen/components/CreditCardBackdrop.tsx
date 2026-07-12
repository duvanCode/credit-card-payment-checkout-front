import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { strings } from '../../../constants/strings';
import { formatCvc, formatExpiryValue } from '../../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';
import { CardNumberInput } from './CardNumberInput';

export interface CreditCardFormState {
  cardNumber: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  legalId: string;
  legalIdType: string;
}

interface CreditCardBackdropProps {
  visible: boolean;
  form: CreditCardFormState;
  errors: Record<string, string>;
  onClose: () => void;
  onContinue: () => void;
  onChange: (field: keyof CreditCardFormState, value: string) => void;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'characters' | 'words';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : undefined]}
        value={value}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function CreditCardBackdrop({
  visible,
  form,
  errors,
  onClose,
  onContinue,
  onChange,
}: CreditCardBackdropProps) {
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrapper}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Datos de la tarjeta</Text>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <CardNumberInput
                error={errors.cardNumber}
                onChangeText={value => onChange('cardNumber', value)}
                value={form.cardNumber}
              />
              <Field
                autoCapitalize="characters"
                error={errors.holderName}
                label="Nombre del titular"
                onChangeText={value => onChange('holderName', value.toUpperCase())}
                placeholder="JUAN PEREZ"
                value={form.holderName}
              />
              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    error={errors.expiry}
                    keyboardType="number-pad"
                    label="Mes"
                    onChangeText={value => onChange('expiryMonth', formatExpiryValue(value))}
                    placeholder="MM"
                    value={form.expiryMonth}
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    error={errors.expiry}
                    keyboardType="number-pad"
                    label="Ano"
                    onChangeText={value => onChange('expiryYear', formatExpiryValue(value))}
                    placeholder="AA"
                    value={form.expiryYear}
                  />
                </View>
              </View>
              <Field
                error={errors.cvc}
                keyboardType="number-pad"
                label="CVV"
                onChangeText={value => onChange('cvc', formatCvc(value))}
                placeholder="123"
                value={form.cvc}
              />
              <Field
                error={errors.email}
                keyboardType="email-address"
                label="Email"
                onChangeText={value => onChange('email', value)}
                placeholder="correo@dominio.com"
                value={form.email}
              />
              <Field
                autoCapitalize="words"
                error={errors.fullName}
                label="Nombre completo"
                onChangeText={value => onChange('fullName', value)}
                placeholder="Nombre del cliente"
                value={form.fullName}
              />
              <Field
                error={errors.phoneNumber}
                keyboardType="number-pad"
                label="Telefono"
                onChangeText={value => onChange('phoneNumber', value.replace(/\D/g, ''))}
                placeholder="3001234567"
                value={form.phoneNumber}
              />
              <View style={styles.row}>
                <View style={styles.half}>
                  <Field
                    autoCapitalize="characters"
                    error={errors.legalIdType}
                    label="Tipo doc."
                    onChangeText={value => onChange('legalIdType', value.toUpperCase())}
                    placeholder="CC"
                    value={form.legalIdType}
                  />
                </View>
                <View style={styles.half}>
                  <Field
                    error={errors.legalId}
                    keyboardType="number-pad"
                    label="Documento"
                    onChangeText={value => onChange('legalId', value.replace(/\D/g, ''))}
                    placeholder="123456789"
                    value={form.legalId}
                  />
                </View>
              </View>
            </ScrollView>
            <View style={styles.actions}>
              <Pressable onPress={onClose} style={[styles.button, styles.secondaryButton]}>
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={onContinue} style={styles.button}>
                <Text style={styles.buttonText}>{strings.continue}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    maxHeight: '92%',
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: scale(999),
    height: verticalScale(5),
    marginBottom: verticalScale(14),
    width: scale(52),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginBottom: verticalScale(16),
  },
  content: {
    gap: verticalScale(12),
    paddingBottom: verticalScale(20),
  },
  field: {
    gap: verticalScale(6),
  },
  row: {
    flexDirection: 'row',
    gap: scale(12),
  },
  half: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: scale(14),
    borderWidth: 1,
    color: colors.text,
    fontSize: moderateScale(15),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(13),
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: moderateScale(12),
  },
  actions: {
    flexDirection: 'row',
    gap: scale(12),
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(14),
    flex: 1,
    paddingVertical: verticalScale(14),
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  secondaryButtonText: {
    color: colors.text,
  },
});
