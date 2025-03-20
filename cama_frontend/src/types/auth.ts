export interface User {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
}

export interface Session {
    token: string;
    tokenExpiry: string;
    user: User;
}

export interface AuthContextType {
    session: Session | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
} 