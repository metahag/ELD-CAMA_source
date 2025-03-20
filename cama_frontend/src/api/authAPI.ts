const clientId = import.meta.env.VITE_ORCID_CLIENT_ID;
//const frontendUrl = 'http://192.168.0.14:3000';
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const redirectUri = import.meta.env.VITE_ORCID_REDIRECT_URI;
const authorizationUrl = `https://orcid.org/oauth/authorize?client_id=${clientId}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri || '')}`;

// Redirect user to ORCID authorization URL
export const redirectToOrcid = () => {
  console.log('Redirecting to:', authorizationUrl);
  window.location.href = authorizationUrl;
};

// Function to refresh the access token
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${backendUrl}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.access;
    }
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Handle the token and user data received from the backend redirect
export const handleOrcidCallback = async (token: string, orcid: string, email?: string) => {
  try {
    // First, get the refresh token from the backend
    const tokenResponse = await fetch(`${backendUrl}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get tokens');
    }

    const tokenData = await tokenResponse.json();
    const { access: accessToken, refresh: refreshToken } = tokenData;

    // Fetch user data using the access token
    console.log('authAPI.ts: Making request with headers:', {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const response = await fetch(`${backendUrl}/api/cama-user/${orcid}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    const data = await response.json();
    
    return {
      accessToken,
      refreshToken,
      orcid: orcid,
      name: data.name || '',
      email: email || data.email || '',
      biography: data.biography || '',
      is_admin: data.is_admin || false,
      studies: data.studies || [],
    };
  } catch (error) {
    console.error('Error handling ORCID callback:', error);
    throw error;
  }
};
