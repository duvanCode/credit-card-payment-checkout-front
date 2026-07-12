import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { ErrorBoundary } from './src/components/ErrorBoundary/ErrorBoundary';
import { AppNavigator } from './src/navigation/AppNavigator';
import { store } from './src/store';

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </Provider>
    </ErrorBoundary>
  );
}
