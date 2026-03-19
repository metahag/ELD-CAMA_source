import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { redirectToOrcid } from '../../api/authAPI';

const LoginPage: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (session) {
      navigate('/profile');
    }
  }, [session, navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in with ORCID
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={redirectToOrcid}
          >
            Login with ORCID
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
