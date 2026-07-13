import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppIcon } from '../../../components/AppIcon/AppIcon';
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

const SHEET_HEIGHT = '80%';

interface CreditCardBackdropProps {
  visible: boolean;
  form: CreditCardFormState;
  errors: Record<string, string>;
  onClose: () => void;
  onContinue: () => void;
  onChange: (field: keyof CreditCardFormState, value: string) => void;
  submitting?: boolean;
}

const testCards = {
  approved: {
    cardNumber: '4242 4242 4242 4242',
    expiryMonth: '12',
    expiryYear: '29',
    cvc: '123',
  },
  declined: {
    cardNumber: '4111 1111 1111 1111',
    expiryMonth: '12',
    expiryYear: '29',
    cvc: '123',
  },
};

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
  submitting = false,
}: CreditCardBackdropProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>Metodo de pago</Text>
              <Text style={styles.title}>Detalles de pago</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => {
                  onChange('cardNumber', testCards.approved.cardNumber);
                  onChange('expiryMonth', testCards.approved.expiryMonth);
                  onChange('expiryYear', testCards.approved.expiryYear);
                  onChange('cvc', testCards.approved.cvc);
                }}
                style={styles.shortcutIconButton}>
                <AppIcon color={colors.success} name="check_circle" size={18} />
              </Pressable>
              <Pressable
                onPress={() => {
                  onChange('cardNumber', testCards.declined.cardNumber);
                  onChange('expiryMonth', testCards.declined.expiryMonth);
                  onChange('expiryYear', testCards.declined.expiryYear);
                  onChange('cvc', testCards.declined.cvc);
                }}
                style={styles.shortcutIconButton}>
                <AppIcon color={colors.danger} name="cancel" size={18} />
              </Pressable>
              <Pressable disabled={submitting} onPress={onClose} style={styles.closeButton}>
                <AppIcon color={colors.textMuted} name="close" size={18} />
              </Pressable>
            </View>
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            style={styles.formScroll}>
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
          <Pressable
            disabled={submitting}
            onPress={onContinue}
            style={[styles.button, styles.continueButton, submitting ? styles.buttonDisabled : undefined]}>
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>{strings.continue}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.surfaceLowest,
    borderTopLeftRadius: scale(28),
    borderTopRightRadius: scale(28),
    height: SHEET_HEIGHT,
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(24),
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(14),
  },
  headerCopy: {
    flex: 1,
    paddingRight: scale(12),
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scale(8),
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: scale(999),
    height: verticalScale(4),
    marginBottom: verticalScale(14),
    width: scale(34),
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: scale(0.8),
    marginBottom: verticalScale(6),
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(24),
    fontWeight: '800',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: scale(999),
    height: scale(40),
    justifyContent: 'center',
    width: scale(40),
  },
  shortcutIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.border,
    borderRadius: scale(999),
    borderWidth: 1,
    height: scale(36),
    justifyContent: 'center',
    width: scale(36),
  },
  content: {
    gap: verticalScale(10),
    paddingBottom: verticalScale(8),
  },
  formScroll: {
    flex: 1,
  },
  field: {
    gap: verticalScale(4),
  },
  row: {
    flexDirection: 'row',
    gap: scale(12),
  },
  half: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(14),
    borderWidth: 1,
    color: colors.text,
    fontSize: moderateScale(14),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: moderateScale(11),
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: scale(16),
    paddingVertical: verticalScale(13),
  },
  continueButton: {
    marginTop: verticalScale(20),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
});
