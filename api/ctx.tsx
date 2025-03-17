import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState'
import { apiSignIn } from './requests';

const AuthContext = createContext<{
    signIn: (username: string, password: string) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
}>({
    signIn: () => null,
    signOut: () => null,
    session: null,
    isLoading: false,
})

export function useSession() {
    const value = useContext(AuthContext);
    if (process.env.NODE_ENV !== 'production') {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }
    return value
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('token');

    return (
        <AuthContext.Provider
            value={{
                signIn: async (username, password) => {
                    try {
                        const token = await apiSignIn(username, password)
                        if (token) setSession(token)
                    } catch (error: any) {
                        throw error
                    }
                },
                signOut: () => {
                    setSession(null)
                },
                session,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


