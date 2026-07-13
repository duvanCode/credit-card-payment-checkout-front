import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../constants/colors';
import { detectCardType } from '../../../utils/cardValidation';
import { formatCardNumber } from '../../../utils/formatters';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';

interface CardNumberInputProps {
  value: string;
  error?: string;
  onChangeText: (value: string) => void;
}

export function CardNumberInput({ value, error, onChangeText }: CardNumberInputProps) {
  const cardType = detectCardType(value);
  const brandText =
    cardType === 'VISA' ? 'VISA' : cardType === 'MASTERCARD' ? 'MasterCard' : 'Tarjeta';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Numero de tarjeta</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : undefined]}>
        <TextInput
          keyboardType="number-pad"
          onChangeText={text => onChangeText(formatCardNumber(text))}
          placeholder="4242 4242 4242 4242"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={value}
        />
        <View style={styles.brand}>
          <Text style={styles.brandText}>{brandText}</Text>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: verticalScale(4),
  },
  label: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceLowest,
    borderColor: colors.border,
    borderRadius: scale(14),
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: scale(12),
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: moderateScale(14),
    paddingVertical: verticalScale(8),
  },
  brand: {
    backgroundColor: colors.accentSoft,
    borderRadius: scale(999),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  brandText: {
    color: colors.primary,
    fontSize: moderateScale(10),
    fontWeight: '700',
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: moderateScale(11),
  },
});
