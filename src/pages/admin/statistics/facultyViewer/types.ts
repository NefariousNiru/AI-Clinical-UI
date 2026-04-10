// file: src/pages/admin/statistics/facultyViewer/types.ts

export interface RawRow {
    mode?: string;
    disease_id?: string;
    type?: string;
    llm_output?: string | LlmOutput;
}

export interface LlmOutput {
    faculty_summary?: string;
    top_strengths?: string[];
    mixed_areas?: string[];
    common_gaps?: string[];
    teaching_actions?: string[];
}

export interface NormalizedRow {
    mode: string;
    disease_id: string;
    disease_label: string;
    type: string;
    type_label: string;
    faculty_summary: string;
    top_strengths: string[];
    mixed_areas: string[];
    common_gaps: string[];
    teaching_actions: string[];
}
