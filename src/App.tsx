/**
 * GramVoice TN - Root Application Container & Production Navigation Hub
 * Integrated AI Chatbot Support & User Registration Ecosystem
 */
import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { Navbar } from './components/common/Navbar';
import { OfflineBanner } from './components/common/OfflineBanner';
import { ChatBotSupport } from './components/common/ChatBotSupport';
import { UserAuthModal } from './components/common/UserAuthModal';
import { CitizenHome } from './components/citizen/CitizenHome';
import { CitizenProjects } from './components/citizen/CitizenProjects';
import { ProjectDetail } from './components/citizen/ProjectDetail';
import { GramSabhaCitizen } from './components/citizen/GramSabhaCitizen';
import { ReportProblem } from './components/citizen/ReportProblem';
import { ConstructionWatchCitizen } from './components/citizen/ConstructionWatchCitizen';
import { SuggestProject } from './components/citizen/SuggestProject';
import { MyActivity } from './components/citizen/MyActivity';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { initNativeApp } from './services/nativeService';
import { GovernmentDashboard } from './components/government/GovernmentDashboard';
import { GovernmentProjects } from './components/government/GovernmentProjects';
import { GovernmentGramSabha } from './components/government/GovernmentGramSabha';
import { GovernmentMaintenance } from './components/government/GovernmentMaintenance';
import { GovernmentConstruction } from './components/government/GovernmentConstruction';
import { GovernmentLedger } from './components/government/GovernmentLedger';
import { GovernmentDPR } from './components/government/GovernmentDPR';
import { GovernmentAnalytics } from './components/government/GovernmentAnalytics';
import { PublicTransparencyPortal } from './components/public/PublicTransparencyPortal';
import { api } from './services/api';
import { Project, GramSabhaSession, MaintenanceTicket, CitizenSubmission, ProjectSuggestion, ConstructionPhotoReport, Panchayat, GovernanceScore } from './types';

const AppContent: React.FC = () => {
  const { selectedPanchayatId, showAuthModal, setShowAuthModal } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'citizen' | 'government' | 'public'>('citizen');
  const [citizenView, setCitizenView] = useState<string>('home');
  const [governmentView, setGovernmentView] = useState<string>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // App Data State
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [gramSabhas, setGramSabhas] = useState<GramSabhaSession[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [submissions, setSubmissions] = useState<CitizenSubmission[]>([]);
  const [suggestions, setSuggestions] = useState<ProjectSuggestion[]>([]);
  const [constructionPhotos, setConstructionPhotos] = useState<ConstructionPhotoReport[]>([]);
  const [governanceScores, setGovernanceScores] = useState<GovernanceScore[]>([]);

  const loadData = async () => {
    try {
      const [pRes, prRes, gsRes, mRes, sRes, sugRes, cpRes, govRes] = await Promise.all([
        api.getPanchayats(),
        api.getProjects({ panchayatId: selectedPanchayatId }),
        api.getGramSabhas(selectedPanchayatId),
        api.getMaintenanceTickets({ panchayatId: selectedPanchayatId }),
        api.getSubmissions(),
        api.getSuggestions(selectedPanchayatId),
        api.getConstructionPhotos(),
        api.getGovernanceScores()
      ]);

      setPanchayats(pRes);
      setProjects(prRes);
      setGramSabhas(gsRes);
      setTickets(mRes);
      setSubmissions(sRes);
      setSuggestions(sugRes);
      setConstructionPhotos(cpRes);
      setGovernanceScores(govRes);

      if (selectedProject) {
        const updated = prRes.find(p => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  };

  useEffect(() => {
    initNativeApp();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedPanchayatId]);

  const handleCitizenNavigate = (view: string, data?: any) => {
    if (view === 'project_detail') {
      setSelectedProject(data);
      setCitizenView('project_detail');
    } else {
      setCitizenView(view);
    }
  };

  const handleGovernmentNavigate = (view: string, data?: any) => {
    setGovernmentView(view);
  };

  // Global Navigator for Chatbot Deep Links
  const handleGlobalNavigate = (tab: 'citizen' | 'government' | 'public', view?: string, data?: any) => {
    setCurrentTab(tab);
    if (tab === 'citizen' && view) {
      handleCitizenNavigate(view, data);
    } else if (tab === 'government' && view) {
      handleGovernmentNavigate(view, data);
    }
  };

  const activeGovernanceScore = governanceScores.find(g => g.panchayatId === selectedPanchayatId) || governanceScores[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-emerald-200 overflow-x-hidden w-full max-w-full">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        panchayats={panchayats}
      />

      <OfflineBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-6 overflow-x-hidden">
        {/* Tab 1: Citizen Experience */}
        {currentTab === 'citizen' && (
          <div className="w-full">
            {citizenView === 'home' && (
              <CitizenHome
                onNavigate={handleCitizenNavigate}
                projects={projects}
                gramSabhas={gramSabhas}
                activeTickets={tickets}
              />
            )}

            {citizenView === 'projects' && (
              <CitizenProjects
                projects={projects}
                onSelectProject={(p) => { setSelectedProject(p); setCitizenView('project_detail'); }}
                onBack={() => setCitizenView('home')}
              />
            )}

            {citizenView === 'project_detail' && selectedProject && (
              <ProjectDetail
                project={selectedProject}
                submissions={submissions}
                onBack={() => setCitizenView('projects')}
                onRefreshProject={loadData}
              />
            )}

            {citizenView === 'gramsabha' && (
              <GramSabhaCitizen
                gramSabha={gramSabhas[0]}
                onBack={() => setCitizenView('home')}
                onRefresh={loadData}
              />
            )}

            {citizenView === 'report_problem' && (
              <ReportProblem
                onBack={() => setCitizenView('home')}
                onRefresh={loadData}
              />
            )}

            {citizenView === 'construction_watch' && (
              <ConstructionWatchCitizen
                projects={projects}
                photos={constructionPhotos}
                onBack={() => setCitizenView('home')}
                onRefresh={loadData}
              />
            )}

            {citizenView === 'suggest_project' && (
              <SuggestProject
                suggestions={suggestions}
                onBack={() => setCitizenView('home')}
                onRefresh={loadData}
              />
            )}

            {citizenView === 'my_activity' && (
              <MyActivity
                submissions={submissions}
                tickets={tickets}
                onBack={() => setCitizenView('home')}
              />
            )}
          </div>
        )}

        {/* Tab 2: Government Desktop-First Console */}
        {currentTab === 'government' && (
          <div className="w-full">
            {governmentView === 'dashboard' && (
              <GovernmentDashboard
                onNavigate={handleGovernmentNavigate}
                projects={projects}
                tickets={tickets}
                gramSabhas={gramSabhas}
                governanceScore={activeGovernanceScore}
              />
            )}

            {governmentView === 'gov_projects' && (
              <GovernmentProjects
                projects={projects}
                onBack={() => setGovernmentView('dashboard')}
                onRefresh={loadData}
              />
            )}

            {governmentView === 'gov_gramsabha' && (
              <GovernmentGramSabha
                gramSabhas={gramSabhas}
                onBack={() => setGovernmentView('dashboard')}
                onRefresh={loadData}
              />
            )}

            {governmentView === 'gov_maintenance' && (
              <GovernmentMaintenance
                tickets={tickets}
                onBack={() => setGovernmentView('dashboard')}
                onRefresh={loadData}
              />
            )}

            {governmentView === 'gov_construction' && (
              <GovernmentConstruction
                photos={constructionPhotos}
                onBack={() => setGovernmentView('dashboard')}
                onRefresh={loadData}
              />
            )}

            {governmentView === 'gov_ledger' && (
              <GovernmentLedger
                onBack={() => setGovernmentView('dashboard')}
              />
            )}

            {governmentView === 'gov_dpr' && (
              <GovernmentDPR
                onBack={() => setGovernmentView('dashboard')}
              />
            )}

            {governmentView === 'gov_analytics' && (
              <GovernmentAnalytics
                onBack={() => setGovernmentView('dashboard')}
              />
            )}
          </div>
        )}

        {/* Tab 3: Public Transparency Portal (No Login) */}
        {currentTab === 'public' && (
          <div className="w-full">
            <PublicTransparencyPortal />
          </div>
        )}
      </main>

      {/* Production-Grade AI Chatbot Assistant (Fixed Bottom-Right, Non-Intrusive) */}
      <ChatBotSupport onNavigate={handleGlobalNavigate} />

      {/* User Registration & Official Authentication Modal */}
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        panchayats={panchayats}
      />

      {/* Native Mobile Bottom Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        citizenView={citizenView}
        setCitizenView={setCitizenView}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <OfflineProvider>
          <AppContent />
        </OfflineProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
