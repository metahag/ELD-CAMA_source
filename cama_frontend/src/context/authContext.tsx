import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { apiUrl } from '../api/apiConfig';

// Define the session type
type Session = { 
  accessToken: string; 
  refreshToken: string;
  orcid: string;
  name: string;
  email: string;
  studies?: any[];
  is_admin?: boolean;
  userData?: any;
};

type AuthContextType = {
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (session: Session) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  fetchUserData: () => Promise<any>;
};

// Create a context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Function to refresh the access token
const refreshAccessToken = async (token: string): Promise<string | null> => {
  try {
    const response = await fetch(`${apiUrl}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: token }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.access;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshPromise = useRef<Promise<string | null> | null>(null);

  // Function to refresh the access token
  const refreshToken = async (): Promise<string | null> => {
    if (!session?.refreshToken) return null;
    
    // If already refreshing, return the existing promise
    if (refreshPromise.current) {
      return refreshPromise.current;
    }
    
    setIsRefreshing(true);
    
    // Create new refresh promise
    refreshPromise.current = (async () => {
      try {
        const newAccessToken = await refreshAccessToken(session.refreshToken);
        if (newAccessToken) {
          const updatedSession = { ...session, accessToken: newAccessToken };
          setSession(updatedSession);
          localStorage.setItem('AUTH_SESSION', JSON.stringify(updatedSession));
          return newAccessToken;
        }
        return null;
      } finally {
        setIsRefreshing(false);
        refreshPromise.current = null;
      }
    })();

    return refreshPromise.current;
  };

  const fetchUserData = async () => {
    if (!session?.orcid || !session?.accessToken || isFetching) return null;
    setIsFetching(true);

    try {
      const response = await fetch(`${apiUrl}/api/cama-user/${session.orcid}/`, {
        headers: getAuthHeaders(session.accessToken)
      });

      if (response.status === 401 && !isRefreshing) {
        const newToken = await refreshToken();
        if (!newToken) {
          handleLogout();
          return null;
        }

        const retryResponse = await fetch(`${apiUrl}/api/cama-user/${session.orcid}/`, {
          headers: getAuthHeaders(newToken)
        });

        if (!retryResponse.ok) {
          handleLogout();
          return null;
        }

        const data = await retryResponse.json();
        updateSessionWithUserData(data);
        return data;
      }

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
        }
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      updateSessionWithUserData(data);
      return data;
    } catch (error) {
      return null;
    } finally {
      setIsFetching(false);
    }
  };

  const updateSessionWithUserData = (data: any) => {
    if (!session) return;
    
    const updatedSession = {
      ...session,
      name: data.name || session.name,
      email: data.email || session.email,
      studies: data.studies || session.studies,
      is_admin: data.is_admin ?? session.is_admin,
      userData: data,
    };
    
    setIsAdmin(data.is_admin ?? false);
    setSession(updatedSession);
    localStorage.setItem('AUTH_SESSION', JSON.stringify(updatedSession));
  };

  useEffect(() => {
    const storedSession = localStorage.getItem('AUTH_SESSION');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setSession(sessionData);
        setIsAdmin(sessionData.is_admin || false);
        
        // Only fetch user data if we don't have studies data
        if (sessionData.orcid && sessionData.accessToken && !sessionData.studies) {
          fetchUserData();
        }
      } catch (error) {
        localStorage.removeItem('AUTH_SESSION');
        setSession(null);
        setIsAdmin(false);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (newSession: Session) => {
    try {
      // Store all data from the initial login response
      const initialSession = {
        ...newSession,
        is_admin: newSession.is_admin || false,
      };
      
      // Set session in state and localStorage
      setSession(initialSession);
      setIsAdmin(initialSession.is_admin);
      localStorage.setItem('AUTH_SESSION', JSON.stringify(initialSession));

      if (!initialSession.studies) {
        await fetchUserData();
      }
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  const handleLogout = () => {
    setSession(null);
    setIsAdmin(false);
    localStorage.removeItem('AUTH_SESSION');
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      isAdmin, 
      isLoading, 
      login: handleLogin, 
      logout: handleLogout,
      refreshAccessToken: refreshToken,
      fetchUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};
