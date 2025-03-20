import React, { useState } from "react";
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
} from "@mui/material";
import { Study } from "../../api/newTypes";
import { searchStudy } from "../../api/dataAPI";

interface SearchDialogProps {
  dialogOpen: boolean;
  handleDialogClose: () => void;
  setAddToExisting: React.Dispatch<React.SetStateAction<boolean>>;
  setExistingStudyId: React.Dispatch<React.SetStateAction<number>>;
  value: Study | null;
}

const SearchDialog: React.FC<SearchDialogProps> = ({
  dialogOpen,
  handleDialogClose,
  setAddToExisting,
  setExistingStudyId,
  value,
}) => {
  const [options, setOptions] = useState<Study[]>([]);

  const handleChange = (_: any, newValue: Study | null) => {
    console.log(newValue);
    if (newValue) {
      setExistingStudyId(newValue.study_id);
    }
  };

  const fetchOptions = async (query: string) => {
    try {
      const studies = await searchStudy(query);
      if (studies) {
        setOptions(studies); // Update the options state
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const getOptionLabel = (option: Study) =>
    option.study_id + ": " + option.title;

  return (
    <Dialog open={dialogOpen} onClose={handleDialogClose}>
      <DialogTitle>Search study</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Search for study to add experiments/effects to.
        </DialogContentText>

        <Autocomplete
          sx={{ mt: 2 }}
          options={options}
          getOptionLabel={getOptionLabel}
          onChange={handleChange}
          value={value || null}
          onInputChange={(_, newInputValue) => fetchOptions(newInputValue)}
          renderInput={(params) => (
            <TextField {...params} label="Search Studies" />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          disabled={!value}
          onClick={() => {
            setAddToExisting(true);
            handleDialogClose();
          }}
        >
          Fetch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SearchDialog;
