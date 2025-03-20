import React, { useEffect, useState, useContext } from 'react';
import { Grid, Paper, Avatar, Box, Typography, CircularProgress, List, ListItem, ListItemText, Divider, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { apiUrl } from '../../api/apiConfig';

const ProfilePage: React.FC = () => {
  const { session, isLoading: authLoading, isAdmin: contextIsAdmin, refreshAccessToken, fetchUserData } = useContext(AuthContext);
  const navigate = useNavigate();
  const [emailError, setEmailError] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState(session?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeaders = (token: string) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    if (!authLoading && !session) {
      navigate('/home');
      return;
    }

    // If we already have the studies in the session, no need to fetch
    if (session?.studies) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadUserData = async () => {
      if (!session?.orcid || !session?.accessToken) {
        return;
      }

      setLoading(true);

      try {
        const data = await fetchUserData();
        if (isMounted && data) {
          setError("");
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message || "Failed to load user data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [session?.orcid, session?.accessToken, refreshAccessToken, authLoading, navigate, session, fetchUserData]);

  const handleEmailUpdate = async () => {
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email address is invalid");
      return;
    }

    try {
      let response = await fetch(`${apiUrl}/api/cama-user/update-email/`, {
        method: 'POST',
        headers: getAuthHeaders(session.accessToken),
        body: JSON.stringify({ orcid: session.orcid, email: email }),
      });

      if (response.status === 401) {
        console.log('Token expired during email update, attempting refresh...');
        const newToken = await refreshAccessToken();
        if (!newToken) {
          throw new Error('Failed to refresh token');
        }

        response = await fetch(`${apiUrl}/api/cama-user/update-email/`, {
          method: 'POST',
          headers: getAuthHeaders(newToken),
          body: JSON.stringify({ orcid: session.orcid, email: email }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update email: ${errorText}`);
      }

      // After successful email update, fetch latest user data
      await fetchUserData();
      setEmailError("");
      setEmailDialogOpen(false);
      alert("Email updated successfully");
    } catch (error) {
      console.error("Error updating email:", error);
      setEmailError(error.message || "An error occurred while updating email");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Grid container justifyContent="center" spacing={3} style={{ marginTop: '2rem' }}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ padding: '2rem', textAlign: 'center' }}>
          <Avatar sx={{ width: '100px', height: '100px', margin: '0 auto' }}>
            {session.name && session.name.charAt(0)}
          </Avatar>
          <Box mt={2}>
            <Typography variant="h5">{session.name || 'Your Name'}</Typography>
            <Typography variant="subtitle1" color="textSecondary">{session.orcid || 'ORCID not found.'}</Typography>
            <Typography variant="subtitle2" color="textSecondary">{email || 'No email found, please provide one. '}</Typography>
            
            <Button onClick={() => setEmailDialogOpen(true)} variant="contained" color="primary" sx={{ mt: 2 }}>
              Update Email
            </Button>
            
            {contextIsAdmin && (
              <Typography variant="body2" color="primary" mt={2}>
                Admin User
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={10}>
        <Paper elevation={3} sx={{ padding: '2rem' }}>
          <Typography variant="h6" textAlign="center">Uploaded Studies</Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
            <List>
              {session.studies && session.studies.length > 0 ? (
                session.studies.map((study: any) => (
                  <React.Fragment key={study.study_id}>
                    <ListItem button component={Link} to={`/database/${study.study_id}`}>
                      <ListItemText primary={study.title} secondary={study.authors} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary" mt={2} textAlign="center">
                  No studies uploaded.
                </Typography>
              )}
            </List>
          </Box>
        </Paper>
      </Grid>

      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle>Update Email Address</DialogTitle>
        <DialogContent>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!emailError}
            helperText={emailError}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEmailUpdate} variant="contained" color="primary">
            Update Email
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ProfilePage;
