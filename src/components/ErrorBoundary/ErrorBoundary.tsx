import React, { Component, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';
import { moderateScale, scale, verticalScale } from '../../utils/responsive';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ocurrio un error inesperado</Text>
          <Text style={styles.subtitle}>
            Reinicia la vista para continuar con el flujo de checkout.
          </Text>
          <Pressable onPress={this.handleReset} style={styles.button}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: scale(24),
  },
  title: {
    color: colors.text,
    fontSize: moderateScale(22),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: moderateScale(15),
    marginBottom: verticalScale(20),
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: scale(14),
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(12),
  },
  buttonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
});
