import React, { useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";
import { blueGrey } from "@mui/material/colors";
import { effectFields } from "./effectFields"; // Make sure the import path is correct
import { Effect } from "../../api/newTypes";

interface EffectFormProps {
  inputs: Partial<Effect>;
  experiment_nr: number;
  effect_size_number: number;
  readOnly: boolean;
  expanded?: boolean;
}

const EffectForm: React.FC<EffectFormProps> = ({
  inputs,
  experiment_nr,
  effect_size_number,
  readOnly,
  expanded = false,
}) => {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const disabledStyling = {
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "#010101",
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Validate the input
    const fieldKey = name.split('_').slice(2).join('_'); // Get the field key from the name
    const field = effectFields.find(f => f.key === fieldKey);
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
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Accordion
        sx={{ backgroundColor: blueGrey["A100"] }}
        defaultExpanded={expanded}
      >
        <AccordionSummary
          expandIcon={<ArrowDownward />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography>Effect Data</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {effectFields.map((field) => (
            <TextField
              disabled={readOnly}
              key={field.key}
              sx={{ 
                width: field.type === "multiline" ? "93%" : "23%", 
                mt: 1, 
                ml: 1, 
                ...disabledStyling 
              }}
              variant="outlined"
              id={`form${field.key}`}
              label={field.name}
              name={`${experiment_nr}_${effect_size_number}_${field.key}`}
              select={field.type === "option"}
              defaultValue={
                field.type === "option"
                  ? inputs[field.key]?.[field.database_name] ?? ""
                  : inputs[field.key] ?? ""
              }
              onChange={handleChange}
              error={!!fieldErrors[`${experiment_nr}_${effect_size_number}_${field.key}`]}
              helperText={fieldErrors[`${experiment_nr}_${effect_size_number}_${field.key}`] || field.desc}
              multiline={field.type === "multiline"}
              rows={field.type === "multiline" ? 4 : undefined}
              fullWidth
            >
              {field.options?.map((option) => (
                <MenuItem key={`${field.key}-${option}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default EffectForm;
