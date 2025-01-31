import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
  } from "react";
  import {
    checkAuthStatus,
    loginUser,
    logoutUser,
    signupUser,
  } from "../helpers/api-communicator";
  
  // Define User type for authentication
  type User = {
    name: string;
    email: string;
  };
  
  // Define UserAuth type for auth context value
  type UserAuth = {
    isLoggedIn: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  };
  
  // Create auth context with null as default value
  const AuthContext = createContext<UserAuth | null>(null);
  
  // Auth Provider component that wraps the app and provides auth context
  export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State for user data and login status
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    // Check auth status on component mount
    useEffect(() => {
      const checkStatus = async () => {
        try {
          const data = await checkAuthStatus();
          if (data && 'email' in data && 'name' in data) {
            setUser({ email: data.email, name: data.name });
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setIsLoggedIn(false);
          setUser(null);
        }
      };
  
      checkStatus();
    }, []);
  
    // Handle user login
    const login = async (email: string, password: string) => {
      const data = await loginUser(email, password);
      if (data && 'email' in data && 'name' in data) {
        setUser({ email: data.email, name: data.name });
        setIsLoggedIn(true);
      }
    };
  
    // Handle user signup
    const signup = async (name: string, email: string, password: string) => {
      const data = await signupUser(name, email, password);
      if (data && 'email' in data && 'name' in data) {
        setUser({ email: data.email, name: data.name });
        setIsLoggedIn(true);
      }
    };
  
    // Handle user logout
    const logout = async () => {
      try {
        await logoutUser();
        setIsLoggedIn(false);
        setUser(null);
        window.location.reload();
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
  
    // Create context value object
    const value: UserAuth = {
      user,
      isLoggedIn,
      login,
      logout,
      signup,
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  };
  
  // Custom hook to use auth context
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
  