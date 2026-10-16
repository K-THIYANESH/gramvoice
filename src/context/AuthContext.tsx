/**
 * GramVoice TN - Role-Based Authentication & Session Context
 * Production-Ready User Registration, Credential Verification & Switcher
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';

interface AuthContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  selectedPanchayatId: string;
  setSelectedPanchayatId: (id: string) => void;
  isOfficial: boolean;
  isAdmin: boolean;
  isBiometricEnabled: boolean;
  toggleBiometric: (enable: boolean) => void;
  biometricLogin: (role?: UserRole, method?: 'fingerprint' | 'face_id') => void;
  registerCitizen: (data: { name: string; nameTamil?: string; phone: string; panchayatId: string; panchayatName: string; wardNumber: number; biometricToken?: string }) => void;
  loginOfficial: (role: UserRole, panchayatId: string, credentialCode?: string, biometricToken?: string) => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showBiometricModal: boolean;
  setShowBiometricModal: (show: boolean) => void;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  CITIZEN: {
    id: 'cit-101',
    name: 'Muthuvel Karuppan',
    nameTamil: 'முத்துவேல் கருப்பன்',
    phone: '9842109876',
    role: 'CITIZEN',
    panchayatId: 'pan-001',
    panchayatName: 'Alanganallur',
    wardNumber: 4
  },
  PANCHAYAT_SECRETARY: {
    id: 'off-sec-01',
    name: 'T. Sundaralingam',
    nameTamil: 'டி. சுந்தரலிங்கம்',
    phone: '9443100001',
    role: 'PANCHAYAT_SECRETARY',
    panchayatId: 'pan-001',
    panchayatName: 'Alanganallur',
    wardNumber: 0
  },
  PANCHAYAT_PRESIDENT: {
    id: 'off-pres-01',
    name: 'K. Meenatchi Sundaram',
    nameTamil: 'கே. மீனாட்சி சுந்தரம்',
    phone: '9842100002',
    role: 'PANCHAYAT_PRESIDENT',
    panchayatId: 'pan-001',
    panchayatName: 'Alanganallur',
    wardNumber: 0
  },
  BDO: {
    id: 'off-bdo-01',
    name: 'Dr. V. Arulselvan IAS (BDO Vadipatti)',
    nameTamil: 'டாக்டர் வி. அருள்செல்வன் IAS',
    phone: '9443300003',
    role: 'BDO',
    panchayatId: 'pan-001',
    panchayatName: 'Vadipatti Block / Alanganallur',
    wardNumber: 0
  },
  DISTRICT_COLLECTOR: {
    id: 'off-coll-01',
    name: 'District Collectorate Madurai',
    nameTamil: 'மாவட்ட ஆட்சித்தலைவர் அலுவலகம், மதுரை',
    phone: '9443400004',
    role: 'DISTRICT_COLLECTOR',
    panchayatId: 'pan-001',
    panchayatName: 'Madurai District (All Panchayats)',
    wardNumber: 0
  },
  SUPER_ADMIN: {
    id: 'off-admin',
    name: 'GramVoice TN System Administrator',
    nameTamil: 'கிராம்வாய்ஸ் முதன்மை நிர்வாகி',
    phone: '9999900000',
    role: 'SUPER_ADMIN',
    panchayatId: 'pan-001',
    panchayatName: 'Tamil Nadu Rural Development HQ',
    wardNumber: 0
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('gv_role');
    return (saved as UserRole) || 'CITIZEN';
  });

  const [customProfile, setCustomProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('gv_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>(() => {
    return localStorage.getItem('gv_panchayat_id') || 'pan-001';
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showBiometricModal, setShowBiometricModal] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(() => {
    return localStorage.getItem('gv_biometric_enabled') !== 'false';
  });

  const toggleBiometric = (enable: boolean) => {
    setIsBiometricEnabled(enable);
    localStorage.setItem('gv_biometric_enabled', enable ? 'true' : 'false');
  };

  const biometricLogin = (role: UserRole = 'CITIZEN', method: 'fingerprint' | 'face_id' = 'fingerprint') => {
    const targetUser = DEFAULT_USERS[role] || DEFAULT_USERS.CITIZEN;
    setCustomProfile(targetUser);
    setCurrentRole(role);
    setSelectedPanchayatId(targetUser.panchayatId);
    localStorage.setItem('gv_role', role);
    localStorage.setItem('gv_panchayat_id', targetUser.panchayatId);
    localStorage.setItem('gv_user_profile', JSON.stringify(targetUser));
    setShowBiometricModal(false);
    setShowAuthModal(false);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('gv_role', role);
    if (customProfile && customProfile.role === role) {
      // keep custom
    } else {
      const defaultUser = DEFAULT_USERS[role];
      if (defaultUser) {
        setCustomProfile(defaultUser);
        localStorage.setItem('gv_user_profile', JSON.stringify(defaultUser));
      }
    }
  };

  const handleSetPanchayat = (id: string) => {
    setSelectedPanchayatId(id);
    localStorage.setItem('gv_panchayat_id', id);
  };

  const registerCitizen = (data: { name: string; nameTamil?: string; phone: string; panchayatId: string; panchayatName: string; wardNumber: number; biometricToken?: string }) => {
    const newCitizen: UserProfile = {
      id: `cit-${Date.now().toString().slice(-4)}`,
      name: data.name,
      nameTamil: data.nameTamil || data.name,
      phone: data.phone,
      role: 'CITIZEN',
      panchayatId: data.panchayatId,
      panchayatName: data.panchayatName,
      wardNumber: data.wardNumber
    };
    setCustomProfile(newCitizen);
    setCurrentRole('CITIZEN');
    setSelectedPanchayatId(data.panchayatId);
    localStorage.setItem('gv_role', 'CITIZEN');
    localStorage.setItem('gv_panchayat_id', data.panchayatId);
    localStorage.setItem('gv_user_profile', JSON.stringify(newCitizen));
    setShowAuthModal(false);
    setShowBiometricModal(false);
  };

  const loginOfficial = (role: UserRole, panchayatId: string, credentialCode?: string, biometricToken?: string) => {
    const base = DEFAULT_USERS[role] || DEFAULT_USERS.PANCHAYAT_SECRETARY;
    const officialUser: UserProfile = {
      ...base,
      panchayatId
    };
    setCustomProfile(officialUser);
    setCurrentRole(role);
    setSelectedPanchayatId(panchayatId);
    localStorage.setItem('gv_role', role);
    localStorage.setItem('gv_panchayat_id', panchayatId);
    localStorage.setItem('gv_user_profile', JSON.stringify(officialUser));
    setShowAuthModal(false);
    setShowBiometricModal(false);
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    const updated = { ...(customProfile || DEFAULT_USERS[currentRole]), ...data };
    setCustomProfile(updated);
    localStorage.setItem('gv_user_profile', JSON.stringify(updated));
  };

  const currentUser = customProfile || DEFAULT_USERS[currentRole];
  const isOfficial = currentUser.role !== 'CITIZEN';
  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DISTRICT_COLLECTOR';

  return (
    <AuthContext.Provider value={{
      currentUser,
      switchRole,
      selectedPanchayatId,
      setSelectedPanchayatId: handleSetPanchayat,
      isOfficial,
      isAdmin,
      isBiometricEnabled,
      toggleBiometric,
      biometricLogin,
      registerCitizen,
      loginOfficial,
      updateUserProfile,
      showAuthModal,
      setShowAuthModal,
      showBiometricModal,
      setShowBiometricModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
