import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Effectform from "./effect_form";
import {
  emptyEffect,
} from "../../api/newTypes";
import { addEffect } from "../../api/dataAPI";

interface AddEffectDialogProps {
  dialogOpen: boolean;
  handleDialogClose: () => void;
  experiment_nr: number;
  study_id: number;
}

const AddEffectDialog: React.FC<AddEffectDialogProps> = ({
  dialogOpen,
  handleDialogClose,
  experiment_nr,
  study_id,
}) => {
  const closeDialog = () => {
    handleDialogClose();
  };

  const effect_size_number = -1; // temporary "unique" ID. Id is set in backend later

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation(); // required since form in form

    const formData = new FormData(event.target as HTMLFormElement);
    console.log(formData);

    let newEffect = emptyEffect(effect_size_number, experiment_nr, study_id);
    let effectKeys = Object.keys(newEffect);
    // fill each prop with data from form
    effectKeys.forEach(function (key) {
      if (
        key !== "effect_size_number" &&
        key !== "study_id" &&
        key !== "experiment_nr"
      ) {
        // skip fields that are created in database
        newEffect[key] = formData.get(
          experiment_nr + "_" + effect_size_number + "_" + key
        );
      }
    });
    console.log(newEffect);

    try {
      const response = await addEffect(newEffect);
      if (response) {
        // Handle successful response if necessary
      } else {
        // Handle unsuccessful response if necessary
      }
    } catch (error) {
      console.error("Error adding study:", error);
    }
    handleDialogClose();
  };

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open={dialogOpen}
      onClose={handleDialogClose}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Experiment</DialogTitle>
        <DialogContent>
          <Effectform
            experiment_nr={experiment_nr}
            effect_size_number={effect_size_number}
            expanded={true}
            inputs={{}}
            readOnly={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button type="submit" variant="contained" className="float-">
            Send
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEffectDialog;
