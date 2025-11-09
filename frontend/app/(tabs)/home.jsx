// frontend/app/(tabs)/home.jsx

import React, { useState, useEffect } from 'react'; // Added useState and useEffect

// --- MOCK UTILITIES (Copied from other files for single-file consistency) ---
const Box = ({ children, style = {} }) => <div style={{ display: 'flex', flexDirection: 'column', ...style }}>{children}</div>;
const Label = ({ children, style = {} }) => <span style={{ ...style }}>{children}</span>;

// MOCK AXIOS UTILITY: Simulates an API call with JWT check
const API_URL = 'http://localhost:5000/api/v1'; // Base URL for MERN backend

const mockAxios = {
    get: async (url, config = {}) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800)); 

        const token = config.headers?.Authorization;
        console.log(`[MOCK AXIOS]: GET request to ${url}`);

        if (url === `${API_URL}/user/data`) {
            if (token && token.startsWith('Bearer mock-jwt-token')) {
                // Success: Token present and valid
                return {
                    data: {
                        success: true,
                        message: "Data fetched successfully.",
                        secretData: {
                            id: 'user-007',
                            username: 'Agent Smith',
                            items: ['MERN App', 'Tailwind CSS', 'Secure JWT']
                        }
                    }
                };
            } else {
                // Failure: Missing or invalid token
                console.warn("[MOCK AXIOS]: Authorization failed for protected route.");
                throw { response: { status: 401, data: { error: "Unauthorized access." } } };
            }
        }
        // Fallback for other routes
        throw new Error("Route not found.");
    }
};

// MOCK FOR useAuth - Must be replaced with the actual import when run in a real Expo environment.
const useAuth = () => {
    // Mock user object reflecting what is stored in AuthContext after login
    const user = { 
        email: "test@example.com", 
        token: "mock-jwt-token-12345",
        // In a real MERN app, this would contain actual user profile data (e.g., username, id)
    }; 
    
    const logout = () => {
        console.log("[MOCK AUTH]: User logged out. This will trigger a redirect.");
        // In a real app, this calls the AuthContext logout, clearing the token and redirecting.
    };
    return { user, loading: false, logout };
};
// --- END MOCK UTILITIES ---

const HomeScreen = () => {
    const { user, logout } = useAuth(); 

    // State for protected data
    const [protectedData, setProtectedData] = useState(null);
    const [dataLoading, setDataLoading] = useState(false);
    const [dataError, setDataError] = useState(null);

    // Function to fetch data from the protected MERN endpoint
    const fetchProtectedData = async () => {
        if (!user || !user.token) return;

        setDataLoading(true);
        setDataError(null);

        try {
            // Note: In a real app, 'axios' would be imported and configured globally.
            // Here, we use the mockAxios to demonstrate the request.
            const response = await mockAxios.get(`${API_URL}/user/data`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            
            setProtectedData(response.data.secretData);
        } catch (error) {
            console.error("Error fetching protected data:", error);
            setDataError(error.response?.data?.error || "Failed to fetch data.");
        } finally {
            setDataLoading(false);
        }
    };

    // Fetch data when the component mounts and the user token is available
    useEffect(() => {
        fetchProtectedData();
    }, [user.token]); // Dependency on token ensures it only runs after login

    const renderProtectedData = () => {
        if (dataLoading) {
            return <Label style={styles.dataStatus}>Loading secret data...</Label>;
        }
        if (dataError) {
            return <Label style={{...styles.dataStatus, color: '#f87171'}}>Error: {dataError}</Label>;
        }
        if (protectedData) {
            return (
                <Box style={styles.dataDetails}>
                    <Label style={styles.dataText}>ID: {protectedData.id}</Label>
                    <Label style={styles.dataText}>Username: {protectedData.username}</Label>
                    <Label style={styles.dataText}>Items:</Label>
                    <Box style={{ paddingLeft: 16 }}>
                        {protectedData.items.map((item, index) => (
                            <Label key={index} style={styles.dataItem}>- {item}</Label>
                        ))}
                    </Box>
                </Box>
            );
        }
        return null;
    };


    return (
        <Box style={styles.container}>
            <Box style={styles.contentCard}>
                <Label style={styles.welcomeTitle}>Welcome to the MERN App!</Label>
                <Label style={styles.subtitle}>
                    You are viewing a protected route.
                </Label>
                
                {/* User Info */}
                <Box style={styles.userInfoBox}>
                    <Label style={styles.infoLabel}>Authenticated User Details:</Label>
                    <Label style={styles.infoText}>Email: {user.email}</Label>
                    <Label style={styles.infoText}>Token Status: {user.token.substring(0, 15)}...</Label>
                    <Label style={styles.infoNote}>
                        (Token used for protected API calls)
                    </Label>
                </Box>
                
                {/* Protected Data Section */}
                <Box style={styles.dataBox}>
                    <Label style={styles.infoLabel}>Protected API Data</Label>
                    {renderProtectedData()}
                </Box>

                <button
                    onClick={logout}
                    style={styles.logoutButton}
                >
                    Log Out
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
    contentCard: {
        width: '100%',
        maxWidth: '500px',
        padding: 32,
        backgroundColor: '#1f2937', // Slightly lighter card
        borderRadius: 16,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        gap: 24,
        alignItems: 'stretch',
        textAlign: 'center',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4ade80', // Green primary color
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#9ca3af',
        marginBottom: 16,
    },
    userInfoBox: {
        padding: 16,
        backgroundColor: '#374151',
        borderRadius: 8,
        gap: 8,
        alignItems: 'flex-start',
        textAlign: 'left',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#f3f4f6',
        borderBottom: '1px solid #4b5563',
        paddingBottom: 4,
        marginBottom: 4,
        width: '100%',
    },
    infoText: {
        fontSize: 14,
        color: '#d1d5db',
    },
    infoNote: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 8,
    },
    // New Styles for Protected Data
    dataBox: {
        padding: 16,
        backgroundColor: '#2d3748', // Different shade for separation
        borderRadius: 8,
        gap: 8,
        alignItems: 'flex-start',
        textAlign: 'left',
    },
    dataStatus: {
        fontSize: 14,
        color: '#4ade80',
        width: '100%',
        textAlign: 'center',
    },
    dataDetails: {
        gap: 4,
    },
    dataText: {
        fontSize: 14,
        color: '#d1d5db',
    },
    dataItem: {
        fontSize: 14,
        color: '#a0aec0',
    },
    logoutButton: {
        padding: '12px 20px',
        backgroundColor: '#ef4444', // Red for danger/logout
        color: '#f3f4f6',
        fontWeight: 'bold',
        borderRadius: '8px',
        cursor: 'pointer',
        border: 'none',
        transition: 'background-color 0.3s',
        marginTop: 16,
    },
};

export default HomeScreen;
