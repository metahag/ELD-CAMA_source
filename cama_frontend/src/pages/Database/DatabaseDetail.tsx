import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Divider
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchStudyById } from "../../api/dataAPI";

const DatabaseDetail = () => {
  const { id: paramId } = useParams();
  const id = paramId ? parseInt(paramId, 10) : null;
  const [study, setStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchStudy = async () => {
      if (!id) {
        console.error("No study ID provided");
        return;
      }
      try {
        const response = await fetchStudyById(id);
        setStudy(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching study:', error);
        setError(true);
        setLoading(false);
      }
    };

    fetchStudy();
  }, [id]);

  const handleExpandClick = (index) => {
    setExpanded(prevExpanded => ({
      ...prevExpanded,
      [index]: !prevExpanded[index]
    }));
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Typography>Error loading study details.</Typography>;
  if (!study) return <Typography>No study data.</Typography>;

  const { title, doi, authors, keywords, abstract, experiments, category, country } = study;

  return (
    <Box sx={{ margin: 4, textAlign: "left" }}>
      <Card raised>
        <CardContent sx={{ borderLeft: 4, borderColor: 'primary.main', p: 3 }}>
          <Typography variant="h4" gutterBottom>{title}</Typography>
          <Typography variant="subtitle1" gutterBottom>DOI: {doi}</Typography>
          <Typography variant="subtitle1" gutterBottom>Authors: {authors}</Typography>
          <Typography variant="subtitle2" gutterBottom>Keywords: {keywords}</Typography>
          <Typography variant="body1" align="left" gutterBottom>Abstract: {abstract}</Typography>
          <Typography variant="body1" align="left" gutterBottom>
            Category: {category ? category.name : 'N/A'}
          </Typography>
          <Typography variant="body1" align="left" gutterBottom>
            Country: {country ? country.name : 'N/A'}
          </Typography>
        </CardContent>
      </Card>
      {experiments.map((experiment, index) => (
        <Card key={index} sx={{ mt: 2 }}>
          <CardContent sx={{ borderLeft: 4, borderColor: 'primary.main', p: 3 }}>
            <Typography variant="h6">Experiment Details:</Typography>
            {Object.keys(experiment).filter(key => key !== 'effects' && key !== 'grade').map(key => (
              <Typography key={key}>
                {key === 'study_design' ? `Study Design: ${experiment[key].design}` :
                 key === 'participant_design' ? `Participant Design: ${experiment[key].design}` :
                 key === 'implemented' ? `Implemented by: ${experiment[key].implementor}` :
                 key === 'risks' ? `Risk of Bias: ${experiment[key].rob}` :
                 `${key.charAt(0).toUpperCase() + key.slice(1)}: ${experiment[key]}`}
              </Typography>
            ))}
            <Typography variant="body2" sx={{ mt: 2 }}>Grades:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {Object.keys(experiment.grade).map(gradeKey => (
                <FormControlLabel
                  key={gradeKey}
                  control={<Checkbox checked={experiment.grade[gradeKey]} disabled />}
                  label={gradeKey.charAt(0).toUpperCase() + gradeKey.slice(1)}
                />
              ))}
            </Box>
          </CardContent>
          <Accordion expanded={expanded[index]} onChange={() => handleExpandClick(index)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
              <Typography>Show Effects</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {experiment.effects.map((effect, effIndex) => (
                <Box key={effIndex} sx={{ ml: 4 }}>
                  <Typography variant="h6" sx={{ mt: 2 }}>Effect {effIndex + 1} Details:</Typography>
                  {Object.keys(effect).map(key => (
                    <Typography key={key}>
                      {key === 'effect_size_type' ? `Effect Size Type: ${effect[key].name}` :
                       key === 'test_time' ? `Test Time: ${effect[key].time}` :
                       `${key.charAt(0).toUpperCase() + key.slice(1)}: ${effect[key]}`}
                    </Typography>
                  ))}
                  {effIndex < experiment.effects.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}
    </Box>
  );
};

export default DatabaseDetail;
