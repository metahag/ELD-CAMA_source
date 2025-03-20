/*
 * Interface for study, experiment and effect.

    When any interface is changed make sure to change the emtpyXXX function as well.
    When changing Experiment or study make sure to change in newTypes.ts as well.
 */
export interface Country {
    name: string;
}
export interface Category {
    name: string;
}
export interface Study {
    study_id: number;
    title: string;
    authors: string;
    keywords: string;
    abstract: string;
    category: Category | null;
    country: Category | null;
    study_year: number;
    doi: string;
    peer_reviewed: boolean;
    approved: boolean;
    experiments: Experiment[];
}

export const emptyStudy = (id: number): Study => ({
    study_id: id,
    title: "",
    authors: "",
    keywords: "",
    abstract: "",
    category:  null,
    country: null,
    study_year: 0,
    doi: "",
    approved: false,
    peer_reviewed: false,
    experiments: [],
});	

export interface Experiment {
    study_id?: number;
    experiment_nr?: number;
    source?: string;
    intervention: string;
    intervention_op: string;
    target_population: string;
    mean_age?: number;
    grade?: {
        "k":boolean;
		"first":boolean;
		"second":boolean;
		"third":boolean;
		"fourth":boolean;
		"fifth":boolean;
		"sixth":boolean;
		"seventh":boolean;
		"eight":boolean;
		"ninth":boolean;
		 "tenth":boolean;
		 "eleventh":boolean;
		 "twelfth":boolean;
    };
    ni: number; //sample size
    study_design: 'RCT' | 'QES' | "N/A";
    participant_design: 'within' | 'between' | 'mixed' | "N/A";
    implemented: 'researcher' | 'teacher' | 'paraprofessional' | "N/A";
    duration_week?: number;
    frequency_n?: number;
    intensity_n?: number;
    robins?: string;
    risks: 'low' | 'moderate' | 'high' | 'NA';
    effects: Effect[];
}

export const emptyExperiment = (experiment_nr: number, study_id: number): Experiment => ({
    study_id: study_id,
    experiment_nr: experiment_nr,
    source: "",
    intervention: "",
    intervention_op: "",
    target_population: "",
    mean_age: undefined,
    grade: {
        "k":false,
		"first":false,
		"second":false,
		"third":false,
		"fourth":false,
		"fifth":false,
		"sixth":false,
		"seventh":false,
		"eight":false,
		"ninth":false,
        "tenth":false,
        "eleventh":false,
        "twelfth":false,
    },
    ni: 0,
    study_design: "N/A",
    participant_design: "N/A",
    implemented: "N/A",
    duration_week: 0,
    frequency_n: 0,
    intensity_n: 0,
    robins: "",
    risks: "NA",
    effects: [],
});

export interface Effect {
    study_id?: number;
    experiment_nr?: number;
    effect_size_nr?: number;
    test_time: 'baseline(pre-test)' | 'post-test' | 'follow-up' | "N/A";
    gender_1?: number;
    gender_2?: number;
    gender_3?: number;
    effect_size_type: 'SMD' | 'RR/OR' | "N/A" ;
    mean_age_1i?: number;
    m1i?: number;
    sd1i?: number;
    n1i?: number;
    mean_age_2i?: number;
    m2i?: number;
    sd2i?: number;
    n2i?: number;
    icc?: number;
    ai?: number;
    bi?: number;
    ci?: number;
    di?: number;
    ri?: number;
    t?: number;
    f_stat?: number;
    d?: number;
    d_var?: number;
    outcome: string;
    test_name?: string;
    outcome_full: string;
    outcome_op?: string;
}

export const emptyEffect = (effect_size_nr: number, experiment_nr: number, study_id: number): Effect => ({
    effect_size_nr: effect_size_nr,
    study_id: study_id,
    experiment_nr: experiment_nr,
    test_time: "N/A",
    gender_1: 0,
    gender_2: 0,
    gender_3: 0,
    effect_size_type: "N/A",
    mean_age_1i: 0,
    m1i: 0,
    sd1i: 0,
    n1i: 0,
    mean_age_2i: 0,
    m2i: 0,
    sd2i: 0,
    n2i: 0,
    icc: 0,
    ai: 0,
    bi: 0,
    ci: 0,
    di: 0,
    ri: 0,
    t: 0,
    f_stat: 0,
    d: 0,
    d_var: 0,
    outcome: "",
    test_name: "",
    outcome_full: "",
    outcome_op: "",
});



export const schoolGrades = [
    "k",
    "first",
    "second",
    "third",
    "fourth",
    "fifth",
    "sixth",
    "seventh",
    "eight",
    "ninth",
     "tenth",
     "eleventh",
     "twelfth"];

export const schoolGradesOptions = [
        {label:"k", val:"k",},
        {label:"1", val: "first"},
        {label:"2", val: "second"},
        {label:"3", val: "third"},
        {label:"4", val: "fourth"},
        {label:"5", val: "fifth"},
        {label:"6", val: "sixth"},
        {label:"7", val: "seventh"},
        {label:"8", val: "eight"},
        {label:"9", val: "ninth"},
        {label:"10", val: "tenth"},
        {label:"11", val: "eleventh"},
        {label:"12", val: "twelfth"}];