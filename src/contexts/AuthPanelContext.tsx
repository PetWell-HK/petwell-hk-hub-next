import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

type AuthView = "LANDING" | "PASSWORD" | "OTP" | "PROFILE";

interface AuthPanelContextType {
  isOpen: boolean;
  currentView: AuthView;
  email: string;
  openPanel: (view?: AuthView, email?: string) => void;
  closePanel: () => void;
  setView: (view: AuthView) => void;
  setEmail: (email: string) => void;
  onAuthSuccess: (callback: () => void) => void;
  triggerAuthSuccess: () => void;
}

const AuthPanelContext = createContext<AuthPanelContextType | undefined>(undefined);

export const AuthPanelProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<AuthView>("LANDING");
  const [email, setEmail] = useState("");
  const authSuccessCallbackRef = useRef<(() => void) | null>(null);

  const openPanel = (view: AuthView = "LANDING", emailValue: string = "") => {
    setCurrentView(view);
    setEmail(emailValue);
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const setView = (view: AuthView) => {
    setCurrentView(view);
  };

  const setEmailValue = (emailValue: string) => {
    setEmail(emailValue);
  };

  const onAuthSuccess = useCallback((callback: () => void) => {
    authSuccessCallbackRef.current = callback;
  }, []);

  const triggerAuthSuccess = useCallback(() => {
    if (authSuccessCallbackRef.current) {
      const cb = authSuccessCallbackRef.current;
      authSuccessCallbackRef.current = null;
      cb();
    }
  }, []);

  return (
    <AuthPanelContext.Provider value={{ isOpen, currentView, email, openPanel, closePanel, setView, setEmail: setEmailValue, onAuthSuccess, triggerAuthSuccess }}>
      {children}
    </AuthPanelContext.Provider>
  );
};

export const useAuthPanel = () => {
  const context = useContext(AuthPanelContext);
  if (context === undefined) {
    throw new Error('useAuthPanel must be used within an AuthPanelProvider');
  }
  return context;
};
