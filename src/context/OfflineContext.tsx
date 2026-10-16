/**
 * GramVoice TN - Offline Queue & Network Synchronization Manager
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfflineQueuedItem } from '../types';

interface OfflineContextType {
  isOnline: boolean;
  setSimulatedOffline: (offline: boolean) => void;
  simulatedOffline: boolean;
  queue: OfflineQueuedItem[];
  syncStatus: 'ONLINE' | 'OFFLINE' | 'SAVING' | 'QUEUED' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED';
  enqueueItem: (type: OfflineQueuedItem['type'], payload: any) => Promise<string>;
  triggerSync: () => Promise<{ success: number; failed: number }>;
  clearQueue: () => void;
  removeQueuedItem: (id: string) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkOnline, setNetworkOnline] = useState<boolean>(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'ONLINE' | 'OFFLINE' | 'SAVING' | 'QUEUED' | 'SYNCING' | 'SYNCED' | 'SYNC_FAILED'>('ONLINE');
  const [queue, setQueue] = useState<OfflineQueuedItem[]>(() => {
    try {
      const saved = localStorage.getItem('gv_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const effectiveOnline = networkOnline && !simulatedOffline;

  useEffect(() => {
    const handleOnline = () => setNetworkOnline(true);
    const handleOffline = () => setNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gv_offline_queue', JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save offline queue to storage:', e);
    }
  }, [queue]);

  useEffect(() => {
    if (!effectiveOnline) {
      setSyncStatus(queue.length > 0 ? 'QUEUED' : 'OFFLINE');
    } else {
      if (queue.length > 0) {
        triggerSync();
      } else {
        setSyncStatus('ONLINE');
      }
    }
  }, [effectiveOnline]);

  const enqueueItem = async (type: OfflineQueuedItem['type'], payload: any): Promise<string> => {
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newItem: OfflineQueuedItem = {
      id,
      type,
      payload,
      timestamp: Date.now(),
      status: 'QUEUED',
      retryCount: 0
    };

    setSyncStatus('SAVING');
    setQueue(prev => [...prev, newItem]);
    
    setTimeout(() => {
      setSyncStatus(effectiveOnline ? 'SYNCING' : 'QUEUED');
      if (effectiveOnline) {
        triggerSync();
      }
    }, 400);

    return id;
  };

  const removeQueuedItem = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    setQueue([]);
    setSyncStatus(effectiveOnline ? 'ONLINE' : 'OFFLINE');
  };

  const triggerSync = async (): Promise<{ success: number; failed: number }> => {
    if (!effectiveOnline || queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    setSyncStatus('SYNCING');
    let successCount = 0;
    let failedCount = 0;
    const remainingQueue: OfflineQueuedItem[] = [];

    for (const item of queue) {
      try {
        let endpoint = '';
        let body = item.payload;

        if (item.type === 'voice_submission') {
          endpoint = '/api/submissions/voice';
        } else if (item.type === 'text_submission') {
          endpoint = '/api/submissions/text';
        } else if (item.type === 'maintenance_ticket') {
          endpoint = '/api/maintenance';
        } else if (item.type === 'suggestion') {
          endpoint = '/api/suggestions';
        } else if (item.type === 'construction_photo') {
          endpoint = '/api/construction/photos';
        }

        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          successCount++;
        }
      } catch (err: any) {
        failedCount++;
        remainingQueue.push({
          ...item,
          retryCount: item.retryCount + 1,
          status: 'FAILED',
          errorMessage: err.message
        });
      }
    }

    setQueue(remainingQueue);
    if (remainingQueue.length === 0) {
      setSyncStatus('SYNCED');
      setTimeout(() => setSyncStatus('ONLINE'), 3000);
    } else {
      setSyncStatus('SYNC_FAILED');
    }

    return { success: successCount, failed: failedCount };
  };

  return (
    <OfflineContext.Provider value={{
      isOnline: effectiveOnline,
      simulatedOffline,
      setSimulatedOffline,
      queue,
      syncStatus,
      enqueueItem,
      triggerSync,
      clearQueue,
      removeQueuedItem
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
