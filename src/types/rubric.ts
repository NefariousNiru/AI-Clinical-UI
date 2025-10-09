// src/types/rubric.ts
export type CriterionBinary = {
    type: "binary"
    key: string
    verbiage: string
    weight: number
    aliases?: string[]
    unitEquivalents?: Array<Record<string, Record<string, number>>>
}

export type SelectKItem = {
    key: string
    verbiage: string
    aliases?: string[]
}

export type CriterionSelectK = {
    type: "select_k"
    groupId: string
    verbiage: string
    selectK: number
    awardPoints: number
    minItemsRequired?: number | null
    dependsOnAny?: string[] | null
    items: SelectKItem[]
}

export type Criterion = CriterionBinary | CriterionSelectK

export type Block = {
    id: string
    title: string
    maxPoints: number
    criteria: Criterion[]
    notes?: string
}

export type Section = {
    id: string
    title: string
    maxPoints: number
    blocks: Block[]
}

export type ScoringInvariants = {
    rounding: "0.5"
    requireSectionBlockSumsMatch: boolean
    gradingStyle?: "strict" | "lenient"
    notes?: string | null
}

export type RubricPayload = {
    rubricId: string
    rubricVersion: string
    schemaVersion: string
    scoringInvariants: ScoringInvariants
    contraindicationsPolicy: "non_scored_feedback_only" | "scored_zero_section"
    evidenceKeys?: string[]
    sections: Section[]
    nonScoredClinicalNotes?: string[]
}
