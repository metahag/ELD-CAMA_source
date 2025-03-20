import { ExperimentField } from '../../types/formFieldTypes';

export const experimentFields: ExperimentField[] = [
    { name: "Number of the experiment", key: "experiment_nr", type: "disabled", desc: "Which experiment in the study was it" },
    { name: "Intervention", key: "intervention", type: "string", desc: "Name of the intervention" },
    { name: "Intervention Operationalization", key: "intervention_op", type: "multiline", desc: "Description of the intervention", width: "93%" },
    { name: "Target Population", key: "target_population", type: "string", desc: "Who was the intervention aimed at" },
    { name: "Mean Age", key: "mean_age", type: "number", desc: "Mean age of the participants" },
    { name: "Source", key: "source", type: "string", desc: "link/doi to the meta-analysis it was extracted from (can be empty if it's an original study) " },
    { name: "School grade", key: "grade", type: "checkbox", desc: "State the grades (e.g., K-12)" }, //this is manually treated in experiment_form
    { name: "Sample size", key: "ni", type: "number", desc: "Total sample size" },
    { name: "Study Design", key: "study_design", type: "option", desc: "E.g. RCT, QES", options: ["RCT", "QES"], database_name:"design" },
    { name: "Participant Design", key: "participant_design", type: "option", desc: "E.g. within or between subject design", options: ["within", "between", "mixed"], database_name:"design" },
    { name: "Implementation", key: "implemented", type: "option", desc: "Who conducted/implemented the intervention", options: ["researcher", "teacher", "paraprofessional"], database_name:"implementor" },
    { name: "Duration in weeks", key: "duration_week", type: "number", desc: "How long was the intervention?" },
    { name: "Frequency of sessions", key: "frequency_n", type: "number", desc: "How many occasions did the intervention run?" },
    { name: "Intensity of the sessions", key: "intensity_n", type: "number", desc: "How long were each session in minutes?" },
    { name: "Risk of Bias (Cochrane)", key: "risks", type: "option", desc: "Risk of bias assessment for randomized studies - final score for the entire study", options:["low", "moderate", "high", "N/A"], database_name:"rob" },
    { name: "Risk of Bias (ROBINS-I)", key: "robins", type: "string", desc: "Risk of bias assessment for non-randomized studies" },
];
