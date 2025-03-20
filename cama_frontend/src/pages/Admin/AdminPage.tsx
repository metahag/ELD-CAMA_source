import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import ApprovalCard from "./ApprovalCard";
import { fetchAllStudies, approveStudy } from "../../api/dataAPI";
import { Study } from "../../api/newTypes";

const AdminPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const loadStudies = async () => {
      const fetchedStudies = await fetchAllStudies();
      if (!fetchedStudies) {
        setLoading(false);
        setError(true);
        return;
      } else {
        const unapprovedStudies = fetchedStudies.filter(study => !study.approved);
        setStudies(unapprovedStudies);
        setLoading(false);
      }
    };
    loadStudies();
  }, []);

  const handleApproval = async (studyId: number, studyTitle: string) => {
    try {
      const response = await approveStudy(studyId);
      if (response) {
        setStudies(prevStudies => prevStudies.filter(study => study.study_id !== studyId));
        setSuccessMessage(`Study "${studyTitle}" has been approved!`);
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error("Error approving study:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Typography>Error loading studies.</Typography>;

  return (
    <Box sx={{ py: 2, pl: 2, textAlign: "left" }}>
      <Typography variant="h3" gutterBottom>
        Upload control
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", my: 1 }}></Box>

      <Typography variant="h5">Pending studies</Typography>
      <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
        {studies.map((study) => (
          <ApprovalCard key={study.study_id} data={study} onApprove={handleApproval} />
        ))}
      </Box>

      <Snackbar open={showSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPage;
