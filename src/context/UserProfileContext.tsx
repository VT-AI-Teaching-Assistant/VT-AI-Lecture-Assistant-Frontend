import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../models';

interface InstructorData {
  instructor_id: number;
  name: string;
  email: string;
  canvas_instructor_id: number;
  created_at: string;
  updated_at: string;
}

interface UserProfileContextValue {
  profile: UserProfile | null;
  instructorData: InstructorData | null;
  setProfile: (profile: UserProfile | null) => void;
  setInstructorData: (instructorData: InstructorData | null) => void;
  getInstructorId: () => number | null;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'vt-ai-user-profile';
const INSTRUCTOR_STORAGE_KEY = 'vt-ai-instructor-data';

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);

  // Load profile and instructor data from localStorage on mount
  useEffect(() => {
    const profileRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const instructorRaw = localStorage.getItem(INSTRUCTOR_STORAGE_KEY);
    
    if (profileRaw) {
      try {
        const parsedProfile = JSON.parse(profileRaw) as UserProfile;
        setProfile(parsedProfile);
      } catch {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    
    if (instructorRaw) {
      try {
        const parsedInstructor = JSON.parse(instructorRaw) as InstructorData;
        setInstructorData(parsedInstructor);
      } catch {
        localStorage.removeItem(INSTRUCTOR_STORAGE_KEY);
      }
    }
  }, []);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [profile]);

  // Save instructor data to localStorage whenever it changes
  useEffect(() => {
    if (instructorData) {
      localStorage.setItem(INSTRUCTOR_STORAGE_KEY, JSON.stringify(instructorData));
    } else {
      localStorage.removeItem(INSTRUCTOR_STORAGE_KEY);
    }
  }, [instructorData]);

  const getInstructorId = useCallback((): number | null => {
    return instructorData?.instructor_id || null;
  }, [instructorData]);

  const value = useMemo<UserProfileContextValue>(
    () => ({
      profile,
      instructorData,
      setProfile,
      setInstructorData,
      getInstructorId
    }),
    [profile, instructorData, getInstructorId]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};

export const useUserProfile = (): UserProfileContextValue => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
};
