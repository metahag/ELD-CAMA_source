import React, { useState, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { NavLink, Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../context/authContext';

const pages = ['Home', 'Subjects', 'Apps', 'Database'];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { session, isAdmin, isLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
    navigate('/home');
  };

  if (isLoading) {
    return null; // or a loading spinner, if you prefer
  }

  return (
    <AppBar position="sticky" color="default">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              {session && isAdmin && (
                <MenuItem key="Admin" onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Admin</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                component={NavLink}
                to={`/${page.toLowerCase()}`}
                onClick={handleCloseNavMenu}
                sx={{
                  color: 'black',
                  display: 'block',
                  position: 'relative',
                  '&.active': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: 'primary.main',
                    }
                  }
                }}
              >
                {page}
              </Button>
            ))}
            {session && isAdmin && (
              <Button
                key="Admin"
                component={NavLink}
                to="/admin"
                onClick={handleCloseNavMenu}
                sx={{
                  color: 'black',
                  display: 'block',
                  position: 'relative',
                  '&.active': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: 'primary.main',
                    }
                  }
                }}
              >
                Admin
              </Button>
            )}
          </Box>

          <Box sx={{ flexGrow: 0, display: "flex" }}>
            {session && (
              <Link to="Upload">
                <Button
                  size="small"
                  key="addstudy"
                  variant="contained"
                  color="primary"
                  sx={{ mr: 3 }}
                >
                  Add Study
                </Button>
              </Link>
            )}

            {session ? (
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ width: "40px", height: "40px", margin: "0 auto" }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Link to="Login">
                <Button
                  size="small"
                  key="login"
                  variant="contained"
                  color="primary"
                  sx={{ mr: 3 }}
                >
                  Login
                </Button>
              </Link>
            )}

            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem key="Profile" onClick={handleCloseUserMenu}>
                <Link to="Profile">
                  <Typography textAlign="center">Profile</Typography>
                </Link>
              </MenuItem>
              <MenuItem key="Logout" onClick={handleLogout}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
