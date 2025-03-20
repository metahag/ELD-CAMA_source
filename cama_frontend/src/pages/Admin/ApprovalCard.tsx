import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { Study } from "../../api/newTypes";
import { ArrowDownward } from "@mui/icons-material";
import Studyform from "../Upload/study_form";
import Experimentform from "../Upload/experiment_form";

interface ApprovalCardProps {
  data: Study;
  onApprove: (studyId: number, studyTitle: string) => void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({ data, onApprove }) => {
  const handleApprove = () => {
    onApprove(data.study_id, data.title);
  };

  return (
    <Card sx={{ minWidth: 275, margin: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5"  gutterBottom>
          {data.title}
        </Typography>
        <Typography variant="h6" component="div">
          {data.authors}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {data.study_year}
        </Typography>
        <Typography variant="body2">
          {data.abstract.substring(0, 100)}...
        </Typography>
        <Accordion>
          <AccordionSummary expandIcon={<ArrowDownward />} aria-controls="panel1-content" id="panel1-header">
            <Typography>Show details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Studyform onChange={() => {}} inputs={data} readOnly={true} />
            {data.experiments.map(experiment => (
              <Box key={experiment.experiment_nr}>
                <Experimentform 
                  key={experiment.experiment_nr} 
                  readOnly={true}
                  allowAdd={false}
                  onchangeEffect={() => {}} 
                  onChange={() => {}} 
                  inputs={experiment} 
                  addEffect={() => {}}
                  removeEffect={() => {}}
                  experiment_nr={experiment.experiment_nr}
                  newEffects={[]}
                />
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={handleApprove}>Approve</Button>
      </CardActions>
    </Card>
  );
};

export default ApprovalCard;
