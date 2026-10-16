/**
 * GramVoice TN - Civic Offline Banner & Queue Status
 */
import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, syncStatus, queue, triggerSync, simulatedOffline, setSimulatedOffline } = useOffline();
  const { language, t } = useLanguage();

  if (isOnline && queue.length === 0 && syncStatus === 'ONLINE') {
    return null;
  }

  return (
    <div className={`w-full py-2 px-4 text-xs sm:text-sm border-b transition-colors ${
      !isOnline 
        ? 'bg-amber-50 border-amber-300 text-amber-900' 
        : syncStatus === 'SYNCING' 
          ? 'bg-blue-50 border-blue-200 text-blue-900' 
          : syncStatus === 'SYNCED' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-slate-50 border-slate-200 text-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="w-4 h-4 text-amber-700 animate-pulse" />
          ) : syncStatus === 'SYNCING' ? (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
          ) : syncStatus === 'SYNCED' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <Database className="w-4 h-4 text-slate-600" />
          )}

          <div className="font-medium">
            {!isOnline ? (
              <span>
                <strong>{t.statusOffline}:</strong> {t.offlineBannerSubtitle}
              </span>
            ) : syncStatus === 'SYNCING' ? (
              <span>{t.statusSyncing} ({queue.length} items remaining)</span>
            ) : syncStatus === 'SYNCED' ? (
              <span>{t.statusSynced}</span>
            ) : (
              <span>{queue.length} submissions safely stored in local queue.</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {queue.length > 0 && isOnline && (
            <button
              onClick={() => triggerSync()}
              disabled={syncStatus === 'SYNCING'}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              Sync Now
            </button>
          )}

          <button
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            className="text-[11px] underline text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {simulatedOffline ? 'End Offline Simulation' : 'Test Offline Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
