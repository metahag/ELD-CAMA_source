import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import Experimentform from "./experiment_form";
import {
  emptyExperiment,
  emptyEffect,
  schoolGrades,
} from "../../api/newTypes";
import { addExperiment } from "../../api/dataAPI";

interface AddExperimentDialogProps {
  dialogOpen: boolean;
  handleDialogClose: () => void;
  study_id: number;
}

const AddExperimentDialog: React.FC<AddExperimentDialogProps> = ({
  dialogOpen,
  handleDialogClose,
  study_id,
}) => {
  const closeDialog = () => {
    clearEffect();
    handleDialogClose();
  };

  const [effects, setEffects] = useState<
    { experiment_nr: number; effect_size_number: number }[]
  >([]);

  const addEffect = (experiment_nr: number) => {
    setEffects((prev) => {
      const effect_size_number = prev.length + 1;
      const newEffect = {
        experiment_nr: experiment_nr,
        effect_size_number: effect_size_number,
      };
      return [...prev, newEffect];
    });
  };

  const removeEffect = (effect_size_number: number, experiment_nr: number) => {
    if (window.confirm("Are you sure you want to remove this effect?")) {
      setEffects((prev) =>
        prev.filter(
          (effect) =>
            !(
              effect["effect_size_number"] === effect_size_number &&
              effect["experiment_nr"] === experiment_nr
            )
        )
      );
    }
  };

  const clearEffect = () => {
    setEffects([]);
  };

  const experiment_nr = -1;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    console.log(formData);

    const newExp = emptyExperiment(experiment_nr, study_id);
    const experimentKeys = Object.keys(newExp);

    // Fill each prop with data from form
    experimentKeys.forEach((key) => {
      if (key === "grade") {
        schoolGrades.forEach((grade) => {
          newExp["grade"][grade] =
            formData.get(experiment_nr + "_grade_" + grade) === "on" || false;
        });
      } else if (key !== "experiment_nr" && key !== "study_id" && key !== "effects") {
        // Skip fields that are created in database. Effects are handled below
        newExp[key] = formData.get(experiment_nr + "_" + key);
      }
    });

    // Create empty effect for each existing effect connected to this experiment and fill with data from form
    effects.forEach((effectListObj) => {
      if (effectListObj["experiment_nr"] === experiment_nr) {
        const effect_size_number = effectListObj["effect_size_number"];
        const newEffect = emptyEffect(
          effect_size_number,
          experiment_nr,
          study_id
        );
        const effectKeys = Object.keys(newEffect);
        // Fill each prop with data from form
        effectKeys.forEach((key) => {
          if (
            key !== "effect_size_number" &&
            key !== "study_id" &&
            key !== "experiment_nr"
          ) {
            // Skip fields that are created in database
            newEffect[key] = formData.get(
              experiment_nr + "_" + effect_size_number + "_" + key
            );
          }
        });
        newExp.effects.push(newEffect);
      }
    });

    try {
      const response = await addExperiment(newExp);
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
          <Experimentform
            experiment_nr={experiment_nr}
            addEffect={addEffect}
            removeEffect={removeEffect}
            newEffects={effects}
            expanded={true}
            inputs={{}}
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

export default AddExperimentDialog;
