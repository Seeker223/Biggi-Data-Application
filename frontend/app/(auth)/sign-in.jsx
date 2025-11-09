// frontend/app/(auth)/sign-in.jsx

import React, { useState } from 'react';
// FIX: Changed import path. In the single-file structure, the context is exported from App.jsx,
// but since this component is nested, the simple "../App" may fail.
// I will assume the useAuth hook is available globally/locally for the mock setup.

// --- MOCK UTILITIES (Copied from App.jsx) ---
const Box = ({ children, style = {} }) => <div style={{ display: 'flex', flexDirection: 'column', ...style }}>{children}</div>;
const Label = ({ children, style = {} }) => <span style={{ ...style }}>{children}</span>;
const ActivityIndicator = ({ size, color }) => <div style={{ animation: 'spin 1s linear infinite', fontSize: '24px', color }}>🌀</div>;
// Mocking Expo-Router's useRouter for navigation
const useRouter = () => ({
    replace: (path) => console.log(`[NAV]: Replacing current screen with ${path}`),
    push: (path) => console.log(`[NAV]: Pushing screen ${path}`),
});
// Mocking Input as a standard HTML input element
const Input = ({ value, onChangeText, placeholder, secureTextEntry, style }) => (
    <input
        type={secureTextEntry ? 'password' : 'text'}
        value={value}
        onChange={e => onChangeText(e.target.value)}
        placeholder={placeholder}
        style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #4b5563',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            fontSize: '16px',
            outline: 'none',
            ...style
        }}
    />
);

// We need the actual useAuth hook's signature but cannot import it directly.
// In this mock environment, we must assume the component is running within the AuthProvider 
// and the hook is somehow resolvable. I'll include a placeholder hook that MUST be replaced
// with the actual import when run in a real Expo environment.

// TEMPORARY MOCK FOR useAuth - Replace this with 'import { useAuth } from "../App"' 
// when you run this in a fully configured Expo project where module resolution works.
const useAuth = () => {
    // A dummy login function that logs credentials and returns success
    const login = async (email, password) => {
        console.log(`[MOCK AUTH]: Attempting login for ${email}`);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500)); 
        // In a real app, the imported useAuth is used here.
        console.log("[MOCK AUTH]: Returning success (Assuming MERN server is running)");
        return { success: true }; 
    };
    return { login, user: null, loading: false };
};
// --- END MOCK UTILITIES ---

const SignInScreen = () => {
    // State for form inputs
    const [email, setEmail] = useState('test@example.com');
    const [password, setPassword] = useState('password123');
    // State for UI/API status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Using the temporarily defined useAuth mock above, which simulates calling the MERN backend.
    const { login } = useAuth(); 
    const router = useRouter(); // Mocked navigation hook

    const handleSubmit = async () => {
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        // The actual call to the MERN backend through AuthContext
        const result = await login(email, password);

        if (result.success) {
            // In a real Expo app, this would redirect to the main authenticated screen
            router.replace('/home');
        } else {
            // This error message comes from the MERN backend through the AuthContext
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <Box style={styles.container}>
            <Box style={styles.card}>
                <Label style={styles.title}>Welcome Back</Label>
                <Label style={styles.subtitle}>Log in to access your MERN account</Label>
                
                {/* Email Input */}
                <Box style={styles.inputGroup}>
                    <Label style={styles.inputLabel}>Email</Label>
                    <Input 
                        value={email}
                        onChangeText={setEmail}
                        placeholder="user@example.com"
                    />
                </Box>

                {/* Password Input */}
                <Box style={styles.inputGroup}>
                    <Label style={styles.inputLabel}>Password</Label>
                    <Input 
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        secureTextEntry={true}
                    />
                </Box>

                {/* Error Message */}
                {error ? (
                    <Label style={styles.errorText}>
                        {error}
                    </Label>
                ) : null}

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={styles.button(isSubmitting)}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#1f2937" />
                    ) : (
                        'Log In'
                    )}
                </button>
            </Box>
        </Box>
    );
}

const styles = {
    container: {
        flex: 1,
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827', // Dark background
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: 32,
        backgroundColor: '#1f2937', // Slightly lighter card
        borderRadius: 16,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        gap: 20,
        alignItems: 'stretch',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f3f4f6', // Light text
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputGroup: {
        gap: 8,
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        color: '#9ca3af',
    },
    errorText: {
        color: '#f87171', // Red text
        textAlign: 'center',
        fontSize: 14,
        marginTop: 10,
    },
    button: (loading) => ({
        padding: '12px 20px',
        backgroundColor: loading ? '#bbf7d0' : '#4ade80', // Green button
        color: loading ? '#1f2937' : '#1f2937',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: loading ? 'default' : 'pointer',
        border: 'none',
        transition: 'background-color 0.3s',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }),
};

export default SignInScreen;
