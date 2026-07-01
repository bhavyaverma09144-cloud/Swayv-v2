import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CommonTabPlaceholder({ title }: { title: string }) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{title} Content Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 40 },
  placeholderText: { color: '#7E7A86', fontSize: 16, fontFamily: 'AppFont-Regular' },
});

export default memo(CommonTabPlaceholder);