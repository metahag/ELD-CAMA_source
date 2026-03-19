import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import { useContext } from 'react';

const OrcidCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const refreshToken = params.get('refresh_token');
      const orcid = params.get('orcid');
      const name = params.get('name');
      const email = params.get('email');
      const isAdmin = params.get('is_admin') === 'true';

      if (!token || !refreshToken || !orcid) {
        const errorMsg = 'Missing required data in callback';
        setError(errorMsg);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const userData = {
          accessToken: token,
          refreshToken: refreshToken,
          orcid: orcid,
          name: name || '',
          email: email || '',
          is_admin: isAdmin,
          studies: []
        };

        await login(userData);

        let attempts = 0;
        const maxAttempts = 50;
        
        const checkSession = () => {
          const storedSession = localStorage.getItem('AUTH_SESSION');
          
          if (storedSession) {
            const sessionData = JSON.parse(storedSession);
            
            if (sessionData.accessToken === userData.accessToken) {
              if (!email) {
                navigate('/profile', { replace: true });
              } else {
                navigate('/', { replace: true });
              }
              return;
            }
          }
          
          attempts++;
          if (attempts >= maxAttempts) {
            setError('Failed to set up session. Please try logging in again.');
            setTimeout(() => navigate('/login'), 3000);
            return;
          }
          
          setTimeout(checkSession, 100);
        };

        checkSession();
      } catch (error) {
        const errorMsg = 'Error during ORCID authentication. Please try again.';
        setError(errorMsg);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [location, login, navigate]);

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      height="100vh"
      gap={2}
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress />
          <Typography variant="h6">
            Processing ORCID login...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OrcidCallback; 