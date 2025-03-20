import React, { useState } from "react";
import { TextField, MenuItem, Box } from "@mui/material";
import countries from "../../assets/countries.json";
import { Study } from "../../api/newTypes";

interface StudyformProps {
  inputs: Partial<Study>;
  readOnly?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: { [key: string]: string };
}

const studyFields = [
  { name: "Title", key: "title", type: "string", desc: "Title of the study" },
  { name: "Authors", key: "authors", type: "string", desc: "Authors of the study" },
  { name: "Year", key: "study_year", type: "number", desc: "Year the study was published" },
  { name: "Keywords", key: "keywords", type: "string", desc: "Keywords related to the study" },
  { name: "Abstract", key: "abstract", type: "multiline", desc: "Abstract of the study" },
  { name: "Country", key: "country", type: "option", desc: "Country where the study was conducted" },
  { name: "Peer reviewed", key: "peer_reviewed", type: "option", desc: "Was the study peer-reviewed?" },
  { name: "Category", key: "category", type: "option", desc: "Category of the study" },
  { name: "DOI", key: "doi", type: "string", desc: "DOI of the study" },
];

const Studyform: React.FC<StudyformProps> = ({ inputs = {}, readOnly = false, onChange = () => {}, errors = {} }) => {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const disabledStyling = {
    "& .MuiInputBase-input.Mui-disabled": {
      WebkitTextFillColor: "#010101",
    },
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Validate the input
    const field = studyFields.find(f => f.key === name);
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

  return (
    <Box>
      {studyFields.map((field) => (
        <span key={field.key}>
          {field.key !== "country" && field.key !== "peer_reviewed" && field.key !== "category" ? (
            <TextField
              disabled={readOnly}
              sx={{
                width: field.key === "abstract" ? "93%" : "45%",
                m: 1,
                ...disabledStyling,
              }}
              variant="outlined"
              id={"form" + field.key}
              label={field.name}
              name={field.key}
              defaultValue={inputs[field.key] ?? ""}
              onChange={handleChange}
              error={!!fieldErrors[field.key] || !!errors[field.key]}
              helperText={fieldErrors[field.key] || errors[field.key] || field.desc}
              multiline={field.key === "abstract"}
              rows={field.key === "abstract" ? 6 : undefined}
            />
          ) : (
            <TextField
              sx={{ width: "45%", mt: 2, ml: 1, ...disabledStyling }}
              variant="outlined"
              disabled={readOnly}
              id={"form" + field.key}
              label={field.name}
              name={field.key}
              select
              defaultValue={
                field.key === "peer_reviewed"
                  ? inputs.peer_reviewed
                    ? "yes"
                    : "no"
                  : inputs[field.key]?.name ?? ""
              }
              onChange={handleChange}
              error={!!fieldErrors[field.key] || !!errors[field.key]}
              helperText={fieldErrors[field.key] || errors[field.key] || field.desc}
            >
              {(field.key === "country" ? countries : field.key === "peer_reviewed" ? ["yes", "no"] : ["STEM", "Math", "Language"]).map((option) => (
                <MenuItem key={option.value || option} value={option.label || option}>
                  {option.label || option}
                </MenuItem>
              ))}
            </TextField>
          )}
        </span>
      ))}
    </Box>
  );
};

export default Studyform;
