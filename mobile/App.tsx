import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet} from 'react-native';
import {useAppStore} from './src/store/useAppStore';
import {PermissionScreen} from './src/components/PermissionScreen';
import {usePermissions} from './src/hooks/usePermissions';

const App = () => {
  const visits = useAppStore(s => s.visits);
  const increment = useAppStore(s => s.increment);
  const {hasAllPermissions} = usePermissions();
  const [showPermissions, setShowPermissions] = useState(true);

  React.useEffect(() => {
    increment();
  }, [increment]);

  // Show permission screen until all permissions are granted
  if (showPermissions && !hasAllPermissions()) {
    return (
      <SafeAreaView style={styles.container}>
        <PermissionScreen
          onAllPermissionsGranted={() => setShowPermissions(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>ANTI-SCAM home</Text>
        <Text style={styles.subtitle}>Visits this session: {visits}</Text>
        <Text style={styles.statusText}>
          ✓ All permissions granted
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#020817'},
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {
    fontSize: 24,
    color: '#e5e7eb',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {fontSize: 16, color: '#9ca3af', marginBottom: 8},
  statusText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default App;

