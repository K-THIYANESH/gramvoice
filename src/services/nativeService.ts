import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { App as CapApp } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { Network } from '@capacitor/network';

export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

// Initialize native status bar & app listeners
export const initNativeApp = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Set status bar styling to official TN green theme
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#065f46' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (e) {
      console.warn('Status bar native config skipped:', e);
    }

    try {
      // Handle native Android hardware back button
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    } catch (e) {
      console.warn('Native back button listener skipped:', e);
    }
  }
};

// Native Haptic Vibration Feedback
export const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light'): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      if (type === 'light') {
        await Haptics.impact({ style: ImpactStyle.Light });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'success') {
        await Haptics.notification({ type: NotificationType.Success });
      } else if (type === 'warning') {
        await Haptics.notification({ type: NotificationType.Warning });
      } else if (type === 'error') {
        await Haptics.notification({ type: NotificationType.Error });
      }
    } else if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
      (window.navigator as any).vibrate?.(type === 'heavy' ? 40 : 15);
    }
  } catch {
    // Fallback silently if haptics unavailable
  }
};

// Native Toast Notification
export const showNativeToast = async (message: string, duration: 'short' | 'long' = 'short'): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await Toast.show({
        text: message,
        duration: duration,
        position: 'bottom',
      });
    }
  } catch {
    // Fallback to web UI
  }
};

// Native Network Status
export const getNativeNetworkStatus = async (): Promise<boolean> => {
  try {
    const status = await Network.getStatus();
    return status.connected;
  } catch {
    return navigator.onLine;
  }
};
