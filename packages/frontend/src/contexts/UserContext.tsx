import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User, userApi } from '../api/apiClient';

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, licenseNumber: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing login on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      loadUser(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId: string) => {
    try {
      setLoading(true);
      const user = await userApi.getUser(userId);
      setCurrentUser(user);
      setError(null);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('Failed to load user profile');
      // Clear invalid user ID
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    licenseNumber: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      // Since we don't have real authentication, we'll search for the user by email
      const users = await userApi.getAllUsers();
      const matchedUser = users.find(
        (user) =>
          user.email.toLowerCase() === email.toLowerCase() &&
          user.drivingLicense.licenseNumber === licenseNumber
      );

      if (!matchedUser) {
        setError('Invalid credentials');
        return false;
      }

      setCurrentUser(matchedUser);
      localStorage.setItem('userId', matchedUser.id);
      setError(null);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setCurrentUser(null);
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      setLoading(true);
      await userApi.deleteUser(currentUser.id);
      localStorage.removeItem('userId');
      setCurrentUser(null);
      return true;
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError('Failed to delete account');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ currentUser, loading, error, login, logout, deleteAccount }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
