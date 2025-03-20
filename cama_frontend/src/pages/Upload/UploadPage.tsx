import React, { useState, useEffect } from "react";
import { Button, Box, Typography, Alert, Snackbar } from "@mui/material";
import Studyform from "./study_form";
import Experimentform from "./experiment_form";
import AddExperimentDialog from "./addExperimentDialog";
import { AddCircleOutline, RemoveCircleOutline, SavedSearch, Check } from "@mui/icons-material";
import { Experiment, Study, emptyExperiment, emptyEffect, emptyStudy, schoolGrades } from "../../api/newTypes";
import { addStudy, fetchStudyById } from "../../api/dataAPI";
import SearchDialog from "./searchDialog";
import { experimentFields } from "./experimentFields";
import { effectFields } from "./effectFields";

const UploadPage: React.FC = () => {
  const [experiments, setExperimentValues] = useState<number[]>([]);
  const [effects, setEffects] = useState<{ experiment_nr: number; effect_size_number: number }[]>([]);
  const [formSent, setFormSent] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [addExperimentDialogOpen, setAddExperimentDialogOpen] = useState(false);
  const [addToExisting, setAddToExisting] = useState(false);
  const [existingStudyId, setExistingStudyId] = useState<number>(-1);
  const [existingStudy, setExistingStudy] = useState<Study | undefined>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showAlert, setShowAlert] = useState(false);

  const addExperiment = () => {
    setExperimentValues((prev) => [...prev, prev.length + 1]);
  };

  const removeExperiment = (experimentId: number) => {
    if (window.confirm("Are you sure you want to remove this experiment?")) {
      setExperimentValues((prev) => prev.filter((experiment) => experiment !== experimentId));
    }
  };

  const clearExperiments = () => {
    setExperimentValues([]);
  };

  const addEffect = (experiment_nr: number) => {
    setEffects((prev) => {
      let effect_size_number = prev.length + 1;
      let newEffect = { experiment_nr, effect_size_number };
      return [...prev, newEffect];
    });
  };

  const removeEffect = (effect_size_number: number, experiment_nr: number) => {
    if (window.confirm("Are you sure you want to remove this effect?")) {
      setEffects((prev) => prev.filter((effect) => !(effect.effect_size_number === effect_size_number && effect.experiment_nr === experiment_nr)));
    }
  };

  const clearEffects = () => {
    setEffects([]);
  };

  const getFormEntry = (formData: FormData): Study => {
    let formEntry: Study = emptyStudy(0);
    let studyKeys = Object.keys(formEntry) as (keyof Study)[];

    studyKeys.forEach((key) => {
      if (key !== "experiments" && key !== "study_id") {
        let value: any = formData.get(key);
        if (key === "peer_reviewed") {
          value = value === "yes";
        }
        if (value !== null) {
          formEntry[key] = value as never;
        }
      }
    });

    experiments.forEach((experimentId) => {
      let newExp: Experiment = emptyExperiment(experimentId, formEntry.study_id);
      let experimentKeys = Object.keys(newExp) as (keyof Experiment)[];

      experimentKeys.forEach((key) => {
        if (key === "grade" && newExp.grade) {
          schoolGrades.forEach((grade) => {
            const value = formData.get(`${experimentId}_grade_${grade}`);
            if (value !== null) {
              newExp.grade![grade as keyof typeof newExp.grade] = value === "on";
            }
          });
        } else if (key !== "experiment_nr" && key !== "study_id" && key !== "effects") {
          const value = formData.get(`${experimentId}_${key}`) as string | number | boolean | null;
          if (value !== null) {
            newExp[key] = value as never;
          }
        }
      });

      effects.forEach((effectListObj) => {
        if (effectListObj.experiment_nr === experimentId) {
          let effect_size_number = effectListObj.effect_size_number;
          let newEffect = emptyEffect(effect_size_number, experimentId, formEntry.study_id);
          let effectKeys = Object.keys(newEffect) as (keyof typeof newEffect)[];

          effectKeys.forEach((key) => {
            if (key !== "effect_size_nr" && key !== "study_id" && key !== "experiment_nr") {
              const value = formData.get(`${experimentId}_${effect_size_number}_${key}`) as string | number | boolean | null;
              if (value !== null) {
                newEffect[key] = value as never;
              }
            }
          });
          newExp.effects.push(newEffect);
        }
      });

      formEntry.experiments.push(newExp);
    });

    return formEntry;
  };

  const validateForm = (formEntry: Study) => {
    let validationErrors: { [key: string]: string } = {};

    // Validate study fields
    if (!formEntry.title) validationErrors.title = "Title is required.";
    if (!formEntry.authors) validationErrors.authors = "Authors are required.";
    if (!formEntry.study_year) validationErrors.study_year = "Year is required.";
    if (!formEntry.keywords) validationErrors.keywords = "Keywords are required.";
    if (!formEntry.abstract) validationErrors.abstract = "Abstract is required.";
    if (formEntry.peer_reviewed === undefined) validationErrors.peer_reviewed = "Peer reviewed is required.";

    // Validate experiments
    formEntry.experiments.forEach((experiment, index) => {
      const experimentKey = `experiment_${index + 1}`;
      experimentFields.forEach((field) => {
        const value = experiment[field.key];
        if (field.type === "number" && value && isNaN(Number(value)) && value !== "NA") {
          validationErrors[`${experimentKey}_${field.key}`] = `${field.name} must be a number or "NA".`;
        } else if (field.type === "string" && !value && value !== "NA") {
          validationErrors[`${experimentKey}_${field.key}`] = `${field.name} is required.`;
        }
      });

      // Validate effects
      experiment.effects.forEach((effect, effectIndex) => {
        const effectKey = `${experimentKey}_effect_${effectIndex + 1}`;
        effectFields.forEach((field) => {
          const value = effect[field.key];
          if (field.type === "number" && value && isNaN(Number(value)) && value !== "NA") {
            validationErrors[`${effectKey}_${field.key}`] = `${field.name} must be a number or "NA".`;
          } else if (field.type === "string" && !value && value !== "NA") {
            validationErrors[`${effectKey}_${field.key}`] = `${field.name} is required.`;
          } else if (field.type === "option" && !value) {
            validationErrors[`${effectKey}_${field.key}`] = `${field.name} is required.`;
          }
        });
      });
    });

    return validationErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    let formEntry = getFormEntry(formData);

    const validationErrors = validateForm(formEntry);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowAlert(true);
      return;
    }

    const fullStudyData: Study = {
      ...formEntry,
      approved: false,
      experiments: formEntry.experiments.map<Experiment>((experiment) => ({
        ...experiment,
        effects: experiment.effects,
      })),
    };

    try {
      const response = await addStudy(fullStudyData);
      if (response) {
        setFormSent(true);
      } else {
        console.error("Failed to add study.");
      }
    } catch (error) {
      console.error("Error adding study:", error);
    }
  };

  const handleSearchDialogOpen = () => setSearchDialogOpen(true);
  const handleSearchDialogClose = () => setSearchDialogOpen(false);

  const handleAddExperimentDialogOpen = () => setAddExperimentDialogOpen(true);
  const handleAddExperimentDialogClose = () => {
    fetchExistingStudy();
    setAddExperimentDialogOpen(false);
  };

  const setAddNewStudy = () => {
    setExistingStudyId(-1);
    setExistingStudy(undefined);
    setAddToExisting(false);
    (document.querySelector("#uploadForm") as HTMLFormElement)?.reset();
    clearExperiments();
    clearEffects();
    setFormSent(false);
    setErrors({});
  };

  const fetchExistingStudy = async () => {
    if (existingStudyId !== -1) {
      try {
        const study = await fetchStudyById(existingStudyId);
        clearExperiments();
        clearEffects();
        setExistingStudy(study || undefined);
      } catch (error) {
        console.error("Error fetching study:", error);
      }
    }
  };

  useEffect(() => {
    fetchExistingStudy();
  }, [existingStudyId]);

  return (
    <Box sx={{ py: 2, pl: 2, textAlign: "left" }}>
      {formSent ? (
        <Box sx={{}}>
          <Alert icon={<Check fontSize="inherit" />} severity="success">
            Study has successfully been submitted!
          </Alert>
          <Button sx={{ ml: 2, mt: 2 }} size="small" variant="outlined" onClick={setAddNewStudy}>
            Upload new study
          </Button>
        </Box>
      ) : (
        <div>
          <AddExperimentDialog
            dialogOpen={addExperimentDialogOpen}
            handleDialogClose={handleAddExperimentDialogClose}
            study_id={existingStudy?.study_id || 0}
          />
          <SearchDialog
            dialogOpen={searchDialogOpen}
            value={existingStudy}
            handleDialogClose={handleSearchDialogClose}
            setAddToExisting={setAddToExisting}
            setExistingStudyId={setExistingStudyId}
          />

          <Typography variant="h3" gutterBottom>
            Upload
          </Typography>
          <Typography gutterBottom>
            Are you adding a new study to an existing dataset or a whole new meta-analysis?
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: "divider", my: 1 }}></Box>

          <Box sx={{ display: "flex", justifyContent: "start" }}>
            <Typography variant="h5">Study information</Typography>

            {!addToExisting ? (
              <Button
                sx={{ ml: 2 }}
                size="small"
                variant="outlined"
                startIcon={<SavedSearch />}
                onClick={handleSearchDialogOpen}
              >
                Add to existing study
              </Button>
            ) : (
              <Button sx={{ ml: 2 }} size="small" onClick={setAddNewStudy} variant="outlined">
                Add new study
              </Button>
            )}
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            <form onSubmit={handleSubmit} id="uploadForm">
              <Studyform key={addToExisting ? existingStudy?.study_id : -1} readOnly={addToExisting} inputs={addToExisting ? existingStudy : {}} errors={errors} />
              <Box sx={{ width: "90%", borderTop: 1, mx: 1, my: 3 }}></Box>

              {!addToExisting ? (
                <Button onClick={addExperiment} variant="outlined">
                  Add Experiment
                  <AddCircleOutline sx={{ ml: 1 }} />
                </Button>
              ) : (
                <Button sx={{ ml: 2 }} size="small" variant="contained" onClick={handleAddExperimentDialogOpen}>
                  Add experiment to study
                </Button>
              )}

              {experiments.map((experiment_nr) => (
                <Box key={experiment_nr}>
                  <Experimentform
                    inputs={{}}
                    readOnly={false}
                    newEffects={effects}
                    addEffect={addEffect}
                    removeEffect={removeEffect}
                    experiment_nr={experiment_nr}
                    errors={errors}
                  />

                  <Button sx={{ mt: 1 }} size="small" onClick={() => removeExperiment(experiment_nr)} variant="outlined" startIcon={<RemoveCircleOutline />}>
                    Remove Experiment
                  </Button>
                </Box>
              ))}

              {addToExisting
                ? existingStudy?.experiments.map((experiment) => (
                    <Box key={experiment.experiment_nr}>
                      <Experimentform
                        inputs={experiment}
                        readOnly={true}
                        newEffects={effects}
                        addEffect={addEffect}
                        removeEffect={removeEffect}
                        experiment_nr={experiment.experiment_nr}
                        fetchExistingStudy={fetchExistingStudy}
                        errors={errors}
                      />
                    </Box>
                  ))
                : ""}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {!addToExisting ? (
                  <Button type="submit" variant="contained" className="float-">
                    Send
                  </Button>
                ) : (
                  ""
                )}
              </Box>
            </form>
          </Box>
        </div>
      )}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setShowAlert(false)} severity="error">
          There are errors in the form. Please correct them before submitting.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UploadPage;
