import React from 'react';
import { View } from 'react-native';
import { CustomSpinner } from '../CustomSpinner';

export function LoadingView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF8F5' }}>
      <CustomSpinner size="large" color="#2E7D32" />
    </View>
  );
}
