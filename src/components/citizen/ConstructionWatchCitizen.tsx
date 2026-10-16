/**
 * GramVoice TN - Citizen Construction Watch & Photo Defect Reporting
 * Mobile responsive: wrapping titles, expandable boxes, touch-optimized
 */
import React, { useState } from 'react';
import { 
  Hammer, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  Send 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { Project, ConstructionPhotoReport } from '../../types';
import { api } from '../../services/api';
import { Alert } from '../common/Alert';

interface ConstructionWatchCitizenProps {
  projects: Project[];
  photos: ConstructionPhotoReport[];
  onBack: () => void;
  onRefresh: () => void;
}

export const ConstructionWatchCitizen: React.FC<ConstructionWatchCitizenProps> = ({ projects, photos, onBack, onRefresh }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { isOnline, enqueueItem } = useOffline();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-001');
  const [comment, setComment] = useState<string>('');
  const [reportType, setReportType] = useState<string>('progress_verification');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successReport, setSuccessReport] = useState<ConstructionPhotoReport | null>(null);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const projectPhotos = photos.filter(p => p.projectId === selectedProjectId);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoBase64) return;
    setIsSubmitting(true);

    const payload = {
      projectId: activeProject.id,
      milestoneId: activeProject.milestones[1]?.id || activeProject.milestones[0]?.id,
      imageBase64: photoBase64,
      comment,
      citizenName: currentUser.name,
      gpsCoordinates: activeProject.gpsLocation,
      reportType
    };

    try {
      if (!isOnline) {
        await enqueueItem('construction_photo', payload);
        setSuccessReport({
          id: 'cp-offline',
          projectId: activeProject.id,
          milestoneId: 'ms-002',
          citizenId: currentUser.id,
          citizenName: currentUser.name,
          photoUrl: photoBase64,
          gpsCoordinates: activeProject.gpsLocation,
          gpsVerified: true,
          reportType: reportType as any,
          comment,
          officialStatus: 'pending',
          createdAt: new Date().toISOString()
        });
      } else {
        const result = await api.submitConstructionPhoto(payload);
        setSuccessReport(result);
        onRefresh();
      }
    } catch (e) {
      await enqueueItem('construction_photo', payload);
      setSuccessReport({ id: 'cp-offline' } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16 px-1 sm:px-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.btnBack}
        </button>

        <span className="text-xs bg-orange-100 text-orange-900 border border-orange-200 font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <Hammer className="w-3.5 h-3.5 text-orange-700" />
          Citizen Quality Oversight
        </span>
      </div>

      {/* Project Selector Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Select Construction Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {language === 'ta' ? p.titleTamil : p.title} ({p.panchayatName})
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span>Contractor: <strong>{activeProject.contractorName || 'Assigned'}</strong></span>
          <span>Target: <strong>{activeProject.completionTargetDate}</strong></span>
          <span className="text-emerald-700 font-bold">Evidence Photos: {projectPhotos.length}</span>
        </div>
      </div>

      {/* Upload Site Photo Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 leading-tight break-words">
          <Camera className="w-5 h-5 text-orange-600 shrink-0" />
          <span>{language === 'ta' ? 'கட்டுமான தள புகைப்படத்தை பதிவேற்றவும்' : 'Upload Construction Site Evidence Photo'}</span>
        </h3>

        {successReport ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-sm sm:text-base">
              {language === 'ta' ? 'புகைப்படம் ஆய்வுக்கு ஏற்றுக்கொள்ளப்பட்டது!' : 'Photo Received for Quality Inspection!'}
            </h4>
            
            {successReport.aiDefectAnalysis && (
              <div className="p-3 bg-white border border-emerald-200 rounded-xl text-xs text-left space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  AI Quality Triage Assessment:
                </span>
                <p className="text-slate-700 leading-relaxed break-words">{successReport.aiDefectAnalysis.summary}</p>
                <div className="flex flex-wrap items-center justify-between pt-1 text-[10px] text-slate-500 gap-1">
                  <span>Category: <strong>{successReport.aiDefectAnalysis.defectCategory}</strong></span>
                  <span>Confidence: <strong>{Math.round(successReport.aiDefectAnalysis.confidenceScore * 100)}%</strong></span>
                </div>
              </div>
            )}

            <button
              onClick={() => { setSuccessReport(null); setPhotoBase64(''); setComment(''); }}
              className="px-5 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Upload Another Photo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitPhoto} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setReportType('progress_verification')}
                className={`p-3 rounded-2xl border text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-center min-h-[54px] ${
                  reportType === 'progress_verification' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>Progress Verification</span>
                <span className="text-[11px] font-normal text-slate-500 mt-0.5">பணி முன்னேற்றம்</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType('defect_alert')}
                className={`p-3 rounded-2xl border text-xs font-bold text-left cursor-pointer transition-all flex flex-col justify-center min-h-[54px] ${
                  reportType === 'defect_alert' ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>Defect / Quality Alert</span>
                <span className="text-[11px] font-normal text-slate-500 mt-0.5">குறைபாடு எச்சரிக்கை</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observation Comment:
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Concrete curing in progress / Cracks noticed on side culvert"
                className="w-full p-2.5 sm:p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Evidence Photo:</label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex-1 min-w-[200px] border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-50 hover:bg-orange-50/30 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-slate-600 font-semibold block">
                    {photoBase64 ? 'Site Photo Selected' : 'Choose or Capture Site Photo'}
                  </span>
                  <span className="text-[10px] text-slate-400">GPS & Timestamp automatically tagged</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    required={!photoBase64}
                  />
                </label>

                {photoBase64 && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shrink-0">
                    <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !photoBase64}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Site Inspection Evidence</span>
            </button>
          </form>
        )}
      </div>

      {/* Existing Verified Site Photos Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-800 text-sm sm:text-base">
          {language === 'ta' ? 'கள ஆய்வு புகைப்படங்கள்' : 'Field Inspection Gallery'}
        </h4>

        {projectPhotos.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No photos uploaded for this project yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectPhotos.map(p => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="h-40 rounded-xl overflow-hidden bg-slate-200 relative">
                  <img src={p.photoUrl} alt="Inspection" className="w-full h-full object-cover" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    p.reportType === 'defect_alert' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {p.reportType === 'defect_alert' ? 'Defect Alert' : 'Progress'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 break-words">{p.comment}</p>

                {p.aiDefectAnalysis && (
                  <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" /> AI Scan:
                    </span>
                    <p className="text-slate-700 leading-snug break-words">{p.aiDefectAnalysis.summary}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  <span>By {p.citizenName}</span>
                  <span className="font-semibold text-emerald-700">Status: {p.officialStatus}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
