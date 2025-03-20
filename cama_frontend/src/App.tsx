import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.tsx";
import HomePage from "./pages/Home/HomePage";
import Footer from "./components/Footer.tsx";
import Profile from "./pages/Profile/Profile";
import AboutPage from "./pages/FooterPages/AboutPage.tsx";
import AppPage from "./pages/FooterPages/AppPage.tsx";
import FbFPage from "./pages/FooterPages/FbFPage.tsx";
import AdminPage from "./pages/Admin/AdminPage.tsx";
import AppsPage from "./pages/Apps/ShinyAppsPage";
import UploadPage from "./pages/Upload/UploadPage";
import LoginPage from "./pages/Login/LoginPage";
import OrcidCallback from "./components/OrcidCallback";
import { createTheme } from "@mui/material/styles";
import { Container } from "@mui/material";
import { ThemeProvider } from "@emotion/react";
import DatabasePage from "./pages/Database/DatabasePage";
import DatabaseDetail from "./pages/Database/DatabaseDetail.tsx";
import SubjectsPage from "./pages/Subjects/SubjectsPage.tsx";
import { AuthProvider } from './context/authContext';

// Wrapper component to handle location-based layout
const AppContent = () => {
  const location = useLocation();
  const isAppsPage = location.pathname === '/Apps';

  return (
    <>
      <Navbar />
      <Container
        maxWidth="xl"
        sx={{ 
          px: isAppsPage ? 0 : 4, // No horizontal padding on Apps page
          py: isAppsPage ? 0 : 4, // No vertical padding on Apps page
          minHeight: "60vh",
          maxWidth: "95vw !important", // Even wider
          display: 'flex',
          flexDirection: 'column',
        }}
        className="bg-gray-100"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Home" element={<HomePage />} />
          <Route path="/Apps" element={<AppsPage />} />
          <Route path="/Subjects" element={<SubjectsPage />} />
          <Route path="/Database" element={<DatabasePage />} />
          <Route path="/Database/:id" element={<DatabaseDetail />} />
          <Route path="/Admin" element={<AdminPage />} />
          <Route path="/About" element={<AboutPage />} />
          <Route path="/App" element={<AppPage />} />
          <Route path="/FbF" element={<FbFPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Upload" element={<UploadPage />} />
          <Route path="/callback" element={<OrcidCallback />} />
        </Routes>
      </Container>
      {!isAppsPage && <Footer />} {/* Only show footer when not on Apps page */}
    </>
  );
};

const App: React.FC = () => {
  const theme = createTheme({
    palette: {
      mode: "light",
      primary: {
        light: "#757ce8",
        main: "#000000",
        dark: "#002884",
        contrastText: "#fff",
      },
      secondary: {
        light: "#ff7961",
        main: "#f44336",
        dark: "#ba000d",
        contrastText: "#000",
      },
    },
  });

  return (
    <AuthProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <AppContent />
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
};

export default App;
