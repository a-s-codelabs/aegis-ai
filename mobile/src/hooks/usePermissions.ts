import {useEffect, useState} from 'react';
import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
  PermissionStatus,
} from 'react-native-permissions';

export type PermissionType = 'contacts' | 'phone' | 'overlay';

export interface PermissionState {
  contacts: PermissionStatus;
  phone: PermissionStatus;
  overlay: PermissionStatus;
}

const getPermissionKey = (type: PermissionType): Permission => {
  if (Platform.OS === 'android') {
    switch (type) {
      case 'contacts':
        return PERMISSIONS.ANDROID.READ_CONTACTS;
      case 'phone':
        return PERMISSIONS.ANDROID.READ_PHONE_STATE;
      case 'overlay':
        return PERMISSIONS.ANDROID.SYSTEM_ALERT_WINDOW;
      default:
        throw new Error(`Unknown permission type: ${type}`);
    }
  }
  // iOS permissions would go here
  throw new Error('iOS permissions not yet implemented');
};

/**
 * Hook to manage app permissions
 * Returns permission states and request functions
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState<PermissionState>({
    contacts: RESULTS.UNAVAILABLE,
    phone: RESULTS.UNAVAILABLE,
    overlay: RESULTS.UNAVAILABLE,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Check all permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    setIsLoading(true);
    try {
      const [contacts, phone, overlay] = await Promise.all([
        check(getPermissionKey('contacts')),
        check(getPermissionKey('phone')),
        check(getPermissionKey('overlay')),
      ]);

      setPermissions({
        contacts,
        phone,
        overlay,
      });
    } catch (error) {
      console.error('[Permissions] Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (
    type: PermissionType
  ): Promise<PermissionStatus> => {
    try {
      const permission = getPermissionKey(type);

      // Special handling for overlay permission (Android)
      if (type === 'overlay' && Platform.OS === 'android') {
        // SYSTEM_ALERT_WINDOW requires opening settings
        if (Platform.Version >= 23) {
          try {
            const canDrawOverlays = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW
            );

            if (!canDrawOverlays) {
              Alert.alert(
                'Overlay Permission Required',
                'Please enable "Display over other apps" permission in settings to show call alerts.',
                [
                  {text: 'Cancel', style: 'cancel'},
                  {
                    text: 'Open Settings',
                    onPress: () => {
                      Linking.openSettings();
                    },
                  },
                ]
              );
              return RESULTS.DENIED;
            }
            return RESULTS.GRANTED;
          } catch (error) {
            console.error('[Permissions] Error checking overlay:', error);
            return RESULTS.DENIED;
          }
        }
      }

      const result = await request(permission);
      setPermissions(prev => ({...prev, [type]: result}));
      return result;
    } catch (error) {
      console.error(`[Permissions] Error requesting ${type}:`, error);
      return RESULTS.DENIED;
    }
  };

  const requestAllPermissions = async (): Promise<PermissionState> => {
    setIsLoading(true);
    try {
      const [contacts, phone, overlay] = await Promise.all([
        requestPermission('contacts'),
        requestPermission('phone'),
        requestPermission('overlay'),
      ]);

      const newPermissions = {contacts, phone, overlay};
      setPermissions(newPermissions);
      return newPermissions;
    } catch (error) {
      console.error('[Permissions] Error requesting all permissions:', error);
      return permissions;
    } finally {
      setIsLoading(false);
    }
  };

  const hasAllPermissions = (): boolean => {
    return (
      permissions.contacts === RESULTS.GRANTED &&
      permissions.phone === RESULTS.GRANTED &&
      permissions.overlay === RESULTS.GRANTED
    );
  };

  const hasPermission = (type: PermissionType): boolean => {
    return permissions[type] === RESULTS.GRANTED;
  };

  return {
    permissions,
    isLoading,
    requestPermission,
    requestAllPermissions,
    checkAllPermissions,
    hasAllPermissions,
    hasPermission,
  };
};

