import React from "react";
import { Button, Box, Typography, Container, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import mainImage from "../../assets/images/banner.png";
import scienceImage from "../../assets/images/science.png";
import languageImage from "../../assets/images/math.png";
import mathImage from "../../assets/images/lang.png";

const HomePage: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          sx={{
            background: `linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${mainImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 2,
            mb: 8,
            p: 4,
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Our Research Portal!
          </Typography>
          <Typography variant="body1" paragraph>
            Explore our research projects, datasets, and tools. Navigate
            through different subjects and utilize our apps to conduct
            meta-analyses and validate data.
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/about">
            Learn More
          </Button>
        </Box>

        {/* Section 1: Subjects */}
        <Grid container spacing={4} alignItems="center" py={8}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Subjects
              </Typography>
              <Typography variant="body1" paragraph>
                Browse studies by various subjects including Mathematics,
                Science, and Language.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/subjects">
                Explore Subjects
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: "center" }}>
              <img src={scienceImage} alt="Subjects" style={{ borderRadius: 8, maxWidth: "100%" }} />
            </Box>
          </Grid>
        </Grid>

        {/* Section 2: Apps */}
        <Grid container spacing={4} alignItems="center" py={8}>
          <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
            <Box sx={{ textAlign: "center" }}>
              <img src={languageImage} alt="Apps" style={{ borderRadius: 8, maxWidth: "100%" }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Apps
              </Typography>
              <Typography variant="body1" paragraph>
                Utilize our suite of apps for meta-analysis and data validation.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/apps">
                Explore Apps
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Section 3: Database */}
        <Grid container spacing={4} alignItems="center" py={8}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" component="h2" gutterBottom>
                Database
              </Typography>
              <Typography variant="body1" paragraph>
                Access our comprehensive research database.
              </Typography>
              <Button variant="contained" color="primary" component={Link} to="/database">
                Explore Database
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: "center" }}>
              <img src={mathImage} alt="Database" style={{ borderRadius: 8, maxWidth: "100%" }} />
            </Box>
          </Grid>
        </Grid>

        {/* Call to Action Section */}
        <Box textAlign="center" py={8}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to start contributing?
          </Typography>
          <Button variant="contained" color="primary" component={Link} to="/login">
            Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;