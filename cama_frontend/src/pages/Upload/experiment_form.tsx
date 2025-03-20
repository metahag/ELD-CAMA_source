import React, { useState } from "react";
import {
  FormLabel,
  FormControlLabel,
  Checkbox,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  ArrowDownward,
  AddCircleOutline,
  RemoveCircleOutline,
} from "@mui/icons-material";
import { experimentFields } from "./experimentFields";
import EffectForm from "./effect_form";
import { schoolGradesOptions, Experiment } from "../../api/newTypes";
import AddEffectDialog from "./addEffectDialog";

interface ExperimentFormProps {
  experiment_nr: number;
  removeEffect: (effect_size_number: number, experiment_nr: number) => void;
  addEffect: (experiment_nr: number) => void;
  newEffects: { experiment_nr: number; effect_size_number: number }[];
  readOnly?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onchangeEffect?: () => void;
  inputs: Partial<Experiment>;
  expanded?: boolean;
  study_id?: number;
  fetchExistingStudy?: () => void;
  allowAdd?: boolean;
  errors?: { [key: string]: string };
}

const ExperimentForm: React.FC<ExperimentFormProps> = ({
  experiment_nr,
  removeEffect,
  addEffect,
  newEffects = [],
  readOnly = false,
  inputs = {},
  expanded = false,
  study_id = -1,
  fetchExistingStudy = () => {},
  allowAdd = true,
  onChange = () => {}, // Default empty function
  errors = {}, // Default empty object for errors
}: any) => {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const disabledStyling = {
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "#010101",
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const fieldKey = name.split('_').slice(1).join('_'); // Extract the field key from the name

    // Validate the input
    const field = experimentFields.find(f => f.key === fieldKey);
    if (field) {
      let error = "";
      if (value !== "NA") {
        switch (field.type) {
          case "number":
            if (isNaN(Number(value))) {
              error = "Must be a number or 'NA'";
            }
            break;
          case "string":
            if (typeof value !== "string" || value.trim() === "") {
              error = "Must be a string or 'NA'";
            }
            break;
          default:
            break;
        }
      }

      setFieldErrors(prevErrors => ({
        ...prevErrors,
        [name]: error,
      }));
    }

    // Call the onChange prop if provided
    onChange(event);
  };

  const insertEffect = (effect: any) => {
    return (
      <div key={experiment_nr + "_" + effect.effect_size_number}>
        {effect.experiment_nr === experiment_nr ? (
          <Box>
            <EffectForm
              readOnly={readOnly}
              inputs={effect}
              experiment_nr={experiment_nr}
              effect_size_number={effect.effect_size_number}
            />
            {!readOnly ? (
              <Button
                sx={{ mt: 1 }}
                size="small"
                onClick={() =>
                  removeEffect(effect.effect_size_number, effect.experiment_nr)
                }
                variant="outlined"
                startIcon={<RemoveCircleOutline />}
              >
                Remove Effect
              </Button>
            ) : (
              ""
            )}
          </Box>
        ) : (
          ""
        )}
      </div>
    );
  };

  //addEffectDialog
  const [addEffectDialogOpen, setAddEffectDialogOpen] = React.useState(false);
  const handleAddEffectDialogOpen = () => setAddEffectDialogOpen(true);
  const handleAddEffectDialogClose = () => {
    fetchExistingStudy();
    setAddEffectDialogOpen(false);
  };

  return (
    <Box sx={{ width: "90%", borderLeft: 4, mt: 5, pl: 3 }}>
      <AddEffectDialog
        dialogOpen={addEffectDialogOpen}
        handleDialogClose={handleAddEffectDialogClose}
        experiment_nr={experiment_nr}
        study_id={study_id || 0}
      />
      <Accordion defaultExpanded={expanded}>
        <AccordionSummary
          expandIcon={<ArrowDownward />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Experiment Data</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormLabel component="legend">School grade</FormLabel>
          {schoolGradesOptions.map((grade) => (
            <FormControlLabel
              key={"grade_" + grade.val}
              sx={{ mx: 0 }}
              name={experiment_nr + "_grade_" + grade.val}
              control={
                <Checkbox
                  defaultChecked={inputs?.grade?.[grade.val] ?? false}
                  name={experiment_nr + "_grade_" + grade.val}
                  disabled={readOnly}
                />
              }
              label={grade.label}
              labelPlacement="top"
            />
          ))}
          <br />
          {experimentFields.map((field) => (
            <span key={field.key}>
              {field.key !== "grade" ? (
                <TextField
                  disabled={readOnly || false || field.type === "disabled"}
                  sx={{ 
                    width: field.type === "multiline" ? "93%" : "30%", 
                    mt: 1, 
                    ml: 1, 
                    ...disabledStyling 
                  }}
                  variant="standard"
                  id={"form" + field.key}
                  label={field.name}
                  name={experiment_nr + "_" + field.key}
                  select={field.type === "option"}
                  defaultValue={
                    field.type === "option"
                      ? inputs[field.key]?.[field.database_name] ?? ""
                      : inputs[field.key] ?? ""
                  }
                  onChange={handleChange}
                  error={!!fieldErrors[`${experiment_nr}_${field.key}`] || !!errors[`${experiment_nr}_${field.key}`]}
                  helperText={fieldErrors[`${experiment_nr}_${field.key}`] || errors[`${experiment_nr}_${field.key}`] || field.desc}
                  multiline={field.type === "multiline"}
                  rows={field.type === "multiline" ? 4 : undefined}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={`${field.key}-${option}`} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                ""
              )}
            </span>
          ))}

          {/*existing effects (only when readOnly)*/}
          {inputs.effects?.map(
            (effect: { effect_size_number: number; experiment_nr: number }) => (
              <div key={experiment_nr + "_" + effect.effect_size_number}>
                {insertEffect(effect)}
              </div>
            )
          )}

          {/*new effects*/}
          {newEffects.map(
            (effect: { effect_size_number: number; experiment_nr: number }) => (
              <div key={experiment_nr + "_" + effect.effect_size_number}>
                {insertEffect(effect)}
              </div>
            )
          )}
          {!readOnly ? (
            <div>
              <Button
                onClick={() => {
                  addEffect(experiment_nr);
                }}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Effect
                <AddCircleOutline sx={{ ml: 1 }} />
              </Button>
            </div>
          ) : (
            ""
          )}
          {readOnly && allowAdd ? (
            <div>
              <Button
                onClick={handleAddEffectDialogOpen}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Effect To Experiment
                <AddCircleOutline sx={{ ml: 1 }} />
              </Button>
            </div>
          ) : (
            ""
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ExperimentForm;
