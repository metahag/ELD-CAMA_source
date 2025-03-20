import { useState, useEffect, useMemo } from 'react';
import { Box, Grid, Typography, Button, TextField, InputAdornment, Tooltip, Pagination, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import StudyCard from './StudyCard';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { fetchApprovedStudies } from '../../api/dataAPI';
import FilterAndDownload from '../../components/downloadFilteredData';

const DatabasePage = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [viewMode, setViewMode] = useState("grid"); // Toggle between 'grid' and 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = viewMode === "grid" ? 12 : 25;

  useEffect(() => {
    const loadStudies = async () => {
      setLoading(true);
      const fetchedStudies = await fetchApprovedStudies();
      if (fetchedStudies) {
        setStudies(fetchedStudies);
      }
      setLoading(false);
    };
    loadStudies();
  }, []);

  const toggleViewMode = () => setViewMode(viewMode === "grid" ? "list" : "grid");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredData = studies.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / itemsPerPage);
  }, [filteredData, itemsPerPage]);

  return (
    <Box sx={{ px: 4 }}>
      <Typography variant="h4" gutterBottom>
        Download Filtered Data
      </Typography>
      <FilterAndDownload />
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        marginBottom={4}
      >
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TextField
            fullWidth
            style={{
              marginBottom: 40,
              maxWidth: 800,
              backgroundColor: "white",
            }}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search datasets..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip
            title={
              viewMode === "grid"
                ? "Switch to List View"
                : "Switch to Grid View"
            }
          >
            <Button
              variant="text"
              onClick={toggleViewMode}
              sx={{ minWidth: "auto", marginLeft: 12 }}
            >
              {viewMode === "grid" ? <ViewListIcon /> : <ViewModuleIcon />}
            </Button>
          </Tooltip>

          {viewMode === "grid" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
              }}
            >
              {filteredData
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((study) => (
                  <StudyCard key={study.id} studyData={study} />
                ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {filteredData
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((study) => (
                  <StudyCard key={study.id} studyData={study} />
                ))}
            </Box>
          )}

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, newPage) => setCurrentPage(newPage)}
            sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            color="primary"
          />
        </>
      )}
    </Box>
  );
};

export default DatabasePage;
