/**
 * GramVoice TN - Citizen Problem Reporting & SLA Dispatch Screen
 * Visual Interactive Categories & 1-Tap Voice/Photo Capture
 * Mobile responsive: wrapping chips, flexible box size, enlarged touch targets
 */
import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Mic, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Send, 
  Droplets, 
  Lightbulb, 
  Milestone, 
  Waves, 
  Building, 
  Upload,
  AlertTriangle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { api } from '../../services/api';
import { MaintenanceTicket } from '../../types';
import { VoiceRecorder } from '../common/VoiceRecorder';
import { CitizenReceiptModal } from '../common/CitizenReceiptModal';
import { triggerHaptic } from '../../services/nativeService';

interface ReportProblemProps {
  onBack: () => void;
  onRefresh: () => void;
}

export const ReportProblem: React.FC<ReportProblemProps> = ({ onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { isOnline, enqueueItem } = useOffline();

  const [category, setCategory] = useState<string>('Water Pipeline');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [wardNumber, setWardNumber] = useState<number>(currentUser.wardNumber || 4);
  const [landmark, setLandmark] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successTicket, setSuccessTicket] = useState<any | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const categories = [
    { id: 'Water Pipeline', labelEn: 'Water Leak', labelTa: 'குடிநீர் குழாய்', icon: Droplets, sla: '24h' },
    { id: 'Street Light', labelEn: 'Street Light', labelTa: 'தெருவிளக்கு', icon: Lightbulb, sla: '72h' },
    { id: 'Road Pothole', labelEn: 'Road Damage', labelTa: 'சாலை பழுது', icon: Milestone, sla: '72h' },
    { id: 'Drainage Blockage', labelEn: 'Drainage', labelTa: 'கழிவுநீர்', icon: Waves, sla: '48h' },
    { id: 'Public Toilet', labelEn: 'Sanitation', labelTa: 'சுகாதாரம்', icon: Building, sla: '24h' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceDescription = (result: { textFallback: string }) => {
    setDescription(result.textFallback);
    setShowVoiceRecorder(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ticketPriority: MaintenanceTicket['priority'] = category === 'Water Pipeline' || category === 'Public Toilet' ? 'URGENT' : 'HIGH';

    const payload: Partial<MaintenanceTicket> = {
      title: title || `${category} reported at Ward ${wardNumber}`,
      titleTamil: language === 'ta' ? `${category} - வார்டு ${wardNumber}` : title,
      description: description || 'Citizen reported public grievance via mobile app.',
      category: category as any,
      panchayatId: currentUser.panchayatId,
      wardNumber: Number(wardNumber),
      gpsLocation: { lat: 10.0489, lng: 78.0779, landmark: landmark || 'Near Ward Center' },
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800&q=80',
      priority: ticketPriority,
      reportedByPhoneMasked: currentUser.phone
    };

    try {
      if (!isOnline) {
        await enqueueItem('maintenance_ticket', payload);
        triggerHaptic('success');
        setSuccessTicket({ ticketNumber: 'GV-MNT-OFFLINE', status: 'QUEUED' });
      } else {
        const ticket = await api.createMaintenanceTicket(payload);
        triggerHaptic('success');
        setSuccessTicket(ticket);
        onRefresh();
      }
    } catch (err: any) {
      console.warn('Filing ticket failed, saving offline:', err);
      await enqueueItem('maintenance_ticket', payload);
      setSuccessTicket({ ticketNumber: 'GV-MNT-OFFLINE', status: 'QUEUED' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.btnBack}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight break-words">
            {t.reportProblemTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            {language === 'ta' ? 'அதிகாரப்பூர்வ SLA காலக்கெடுவுடன் தீர்க்கப்படும்' : 'Tracked with government SLA resolution timelines'}
          </p>
        </div>

        {successTicket ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-emerald-950">
              {language === 'ta' ? 'புகார் வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Registered Successfully!'}
            </h3>
            <div className="inline-block font-mono font-bold bg-white px-3 py-1 rounded-xl border border-emerald-200 text-sm text-emerald-900">
              {successTicket.ticketNumber}
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {language === 'ta' 
                ? 'ஊராட்சி செயலர் மற்றும் களப் பணியாளருக்கு தகவல் அனுப்பப்பட்டது.' 
                : 'Panchayat officials and frontline engineers have been dispatched.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(true)}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                {language === 'ta' ? 'அரசு ஒப்புதல் ரசீது காண்க' : 'View Official Token Receipt'}
              </button>
              <button
                type="button"
                onClick={() => { setSuccessTicket(null); setTitle(''); setDescription(''); setPhotoUrl(''); }}
                className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'ta' ? 'மற்றொரு புகார்' : 'File Another Grievance'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selector Grid - Wrapping to multiple lines */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Problem Category & SLA:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(c => {
                  const Icon = c.icon;
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between min-h-[88px] ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-200' 
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 shrink-0">
                          {c.sla} SLA
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight break-words">
                          {language === 'ta' ? c.labelTa : c.labelEn}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ward & Landmark with Responsive Stacking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ward Number:
                </label>
                <select
                  value={wardNumber}
                  onChange={(e) => setWardNumber(Number(e.target.value))}
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                    <option key={w} value={w}>Ward {w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Landmark / Street:
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Mariamman Temple"
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Title / Short note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Brief Issue Description:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Main pipeline leaking opposite to school gate"
                className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Voice Description or Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Detailed Description:</label>
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  {showVoiceRecorder ? 'Type instead' : 'Record in Tamil Voice'}
                </button>
              </div>

              {showVoiceRecorder ? (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <VoiceRecorder
                    promptText={language === 'ta' ? 'புகாரை தமிழில் பேசவும்' : 'Speak problem details in Tamil or English'}
                    onRecorded={handleVoiceDescription}
                  />
                </div>
              ) : (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain details for the panchayat field crew..."
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              )}
            </div>

            {/* Photo Capture & Upload Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Site Evidence Photo:</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex-1 min-w-[200px] border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/30 transition-colors">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 font-semibold block">
                    {photoUrl ? 'Photo Uploaded / Attached' : 'Capture or Select Photo'}
                  </span>
                  <span className="text-[10px] text-slate-400">GPS tag will be attached</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoUrl && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Registering...' : t.problemSubmit}</span>
            </button>
          </form>
        )}
      </div>

      {/* Official Citizen Acknowledgment & Token Receipt Modal */}
      <CitizenReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        ticket={successTicket}
      />
    </div>
  );
};
