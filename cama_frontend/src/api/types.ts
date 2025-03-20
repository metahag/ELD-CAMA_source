
export interface DataEntry {
    id: number;
    image?: string;
    to?: string; //for the link
    title: string;
    authors: string;
    keywords: string;
    abstract: string;
    category: string | number;
    country: string;
    year: string | number;
    doi: string | number;
    peer_reviewed: string | number;
    experiment_number: string | number;
    effect_size_number: string | number;
    mean_age: string | number;
    grade: string | number;
    ni: string | number;
    gender_1: string | number; //hmm 
    gender_2: string | number; //hmm
    study_design: string | number;
    participant_design: string | number;
    implementation: string | number;
    duration_week: string | number;
    frequency_n: string | number;
    intensity_n: string | number;
    m1i: string | number;
    sd1i: string | number;
    n1i: string | number;
    m2i: string | number;
    sd2i: string | number;
    n2i: string | number;
    icc: string | number;
    ai: string | number;
    bi: string | number;
    ci: string | number;
    di: string | number;
    ri: string | number;
    ni__1: string | number;
    t: string | number;
    f_stat: string | number;
    d: string | number;
    d_var: string | number;
    rob: string | number;
    robins: string | number;
    outcome: string | number;
    outcome_full: string | number;
  }
  