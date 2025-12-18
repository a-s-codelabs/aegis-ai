import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {usePermissions, PermissionType} from '../hooks/usePermissions';
import {RESULTS} from 'react-native-permissions';

interface PermissionRowProps {
  title: string;
  description: string;
  status: string;
  onRequest: () => void;
  isLoading?: boolean;
}

const PermissionRow: React.FC<PermissionRowProps> = ({
  title,
  description,
  status,
  onRequest,
  isLoading = false,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case RESULTS.GRANTED:
        return '#10b981'; // green
      case RESULTS.DENIED:
      case RESULTS.BLOCKED:
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (status) {
      case RESULTS.GRANTED:
        return 'Granted';
      case RESULTS.DENIED:
        return 'Denied';
      case RESULTS.BLOCKED:
        return 'Blocked';
      default:
        return 'Not Requested';
    }
  };

  return (
    <View style={styles.permissionRow}>
      <View style={styles.permissionInfo}>
        <Text style={styles.permissionTitle}>{title}</Text>
        <Text style={styles.permissionDescription}>{description}</Text>
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusDot, {backgroundColor: getStatusColor()}]}
          />
          <Text style={[styles.statusText, {color: getStatusColor()}]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
      {status !== RESULTS.GRANTED && (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={onRequest}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.requestButtonText}>Grant</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

interface PermissionScreenProps {
  onAllPermissionsGranted?: () => void;
}

export const PermissionScreen: React.FC<PermissionScreenProps> = ({
  onAllPermissionsGranted,
}) => {
  const {
    permissions,
    isLoading,
    requestPermission,
    requestAllPermissions,
    hasAllPermissions,
  } = usePermissions();

  React.useEffect(() => {
    if (hasAllPermissions() && onAllPermissionsGranted) {
      onAllPermissionsGranted();
    }
  }, [permissions, hasAllPermissions, onAllPermissionsGranted]);

  const handleRequestPermission = async (type: PermissionType) => {
    await requestPermission(type);
  };

  const handleRequestAll = async () => {
    await requestAllPermissions();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Permissions Required</Text>
        <Text style={styles.subtitle}>
          To protect you from scams, we need the following permissions:
        </Text>
      </View>

      <View style={styles.permissionsList}>
        <PermissionRow
          title="Contacts"
          description="Access your contacts to identify trusted callers"
          status={permissions.contacts}
          onRequest={() => handleRequestPermission('contacts')}
          isLoading={isLoading}
        />

        <PermissionRow
          title="Phone State"
          description="Detect incoming calls and screen potential scams"
          status={permissions.phone}
          onRequest={() => handleRequestPermission('phone')}
          isLoading={isLoading}
        />

        <PermissionRow
          title="Display Over Other Apps"
          description="Show call alerts and scam warnings during incoming calls"
          status={permissions.overlay}
          onRequest={() => handleRequestPermission('overlay')}
          isLoading={isLoading}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.requestAllButton,
          hasAllPermissions() && styles.requestAllButtonDisabled,
        ]}
        onPress={handleRequestAll}
        disabled={isLoading || hasAllPermissions()}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.requestAllButtonText}>
            {hasAllPermissions() ? 'All Permissions Granted' : 'Grant All Permissions'}
          </Text>
        )}
      </TouchableOpacity>

      {hasAllPermissions() && (
        <Text style={styles.successText}>
          ✓ All permissions granted! You can now use the app.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020817',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    lineHeight: 24,
  },
  permissionsList: {
    marginBottom: 24,
  },
  permissionRow: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  requestAllButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  requestAllButtonDisabled: {
    backgroundColor: '#10b981',
  },
  requestAllButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

