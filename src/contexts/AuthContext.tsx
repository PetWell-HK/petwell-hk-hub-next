import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { areAllMatchingClientProfilesComplete } from '@/services/forumApi';
import { getCurrentUserInfo } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (value: boolean | null) => void;
  requiresProfileCompletion: boolean;
  setRequiresProfileCompletion: (value: boolean) => void;
  userInfo: {
    userId: string;
    username: string;
    email: string;
    rawEmail?: string;
    isAdmin: boolean;
  } | null;
  setUserInfo: (info: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [requiresProfileCompletion, setRequiresProfileCompletion] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const syncAuthState = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('[AuthContext] getCurrentUser success', currentUser);
        setIsAuthenticated(true);
        const info = await getCurrentUserInfo();
        console.log('[AuthContext] resolved user info', info);

        const lookupEmail = info?.rawEmail || info?.email;
        let needsProfileCompletion = false;
        if (lookupEmail) {
          try {
            const isComplete = await areAllMatchingClientProfilesComplete(lookupEmail);
            needsProfileCompletion = !isComplete;
          } catch (profileCheckError) {
            console.warn('[AuthContext] profile completeness check failed, keep user signed in', profileCheckError);
          }
        }

        setIsAuthenticated(true);
        setRequiresProfileCompletion(needsProfileCompletion);
        setUserInfo(info);
      } catch (error: any) {
        console.log('[AuthContext] syncAuthState failed', error);
        if (error.message?.includes('Session expired') || 
            error.name === 'NotAuthorizedException') {
          setIsAuthenticated(false);
          setRequiresProfileCompletion(false);
          setUserInfo(null);
          console.log('Session expired, user needs to log in again');
        } else {
          setIsAuthenticated(false);
          setRequiresProfileCompletion(false);
          setUserInfo(null);
        }
      }
    };

    void syncAuthState();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      const authEvent = payload?.event;
      console.log('[AuthContext] Hub auth event', authEvent, payload);

      if (authEvent === 'signedIn' || authEvent === 'tokenRefresh') {
        void syncAuthState();
        return;
      }

      if (
        authEvent === 'signedOut' ||
        authEvent === 'tokenRefresh_failure' ||
        authEvent === 'signInWithRedirect_failure'
      ) {
        setIsAuthenticated(false);
        setRequiresProfileCompletion(false);
        setUserInfo(null);
      }
    });

    return unsubscribe;
  }, []);

  // Refresh userInfo when isAuthenticated becomes true (e.g., after login)
  useEffect(() => {
    const refreshUserInfo = async () => {
      if (isAuthenticated === true && !userInfo) {
        try {
          const info = await getCurrentUserInfo();
          const lookupEmail = info?.rawEmail || info?.email;
          let isComplete = true;
          if (lookupEmail) {
            try {
              isComplete = await areAllMatchingClientProfilesComplete(lookupEmail);
            } catch (profileCheckError) {
              console.warn('[AuthContext] refresh profile completeness check failed, keep session', profileCheckError);
            }
          }
          setUserInfo(info);
          setRequiresProfileCompletion(!isComplete);
        } catch (error: any) {
          console.error('Error refreshing user info:', error);
          // If we can't get user info, user might not be truly authenticated
          if (error.message?.includes('Session expired') || 
              error.name === 'NotAuthorizedException') {
            setIsAuthenticated(false);
            setRequiresProfileCompletion(false);
            setUserInfo(null);
          }
        }
      }
    };
    refreshUserInfo();
  }, [isAuthenticated, userInfo]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        requiresProfileCompletion,
        setRequiresProfileCompletion,
        userInfo,
        setUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

