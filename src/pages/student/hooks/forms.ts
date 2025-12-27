// file: src/pages/student/hooks/forms.ts

import {useCallback, useMemo, useState} from "react";
import { z } from "zod";
import {
    PatientInfoSchema,
    type PatientInfo,
    type MrpToolData,
    type PatientDemographics,
    type SocialHistory,
    type MedicalHistory,
    type MedicationList,
    type MedicationHistory,
    type LabResult,
    type ProgressNotes,
    makeEmptyPatientInfo,
} from "../../../lib/types/studentSubmission";

function mergePatientInfo(base: PatientInfo, incoming?: Partial<PatientInfo>): PatientInfo {
    if (!incoming) return base;

    return {
        ...base,
        ...incoming,
        mrpToolData: incoming.mrpToolData ?? base.mrpToolData,
        patientDemographics: {...base.patientDemographics, ...incoming.patientDemographics},
        socialHistory: {...base.socialHistory, ...incoming.socialHistory},
        medicalHistory: {...base.medicalHistory, ...incoming.medicalHistory},
        medicationList: {
            ...base.medicationList,
            ...incoming.medicationList,
            medications: incoming.medicationList?.medications ?? base.medicationList.medications,
        },
        labResult: {...base.labResult, ...incoming.labResult},
        progressNotes: {...base.progressNotes, ...incoming.progressNotes},
    };
}

export function usePatientInfoForm(initial?: Partial<PatientInfo>) {
    const [patientInfo, setPatientInfo] = useState<PatientInfo>(() =>
        mergePatientInfo(makeEmptyPatientInfo(), initial),
    );

    // Section setters
    const setMrpToolData = useCallback((next?: MrpToolData) => {
        setPatientInfo((p) => ({...p, mrpToolData: next}));
    }, []);

    const setPatientDemographics = useCallback((next: PatientDemographics) => {
        setPatientInfo((p) => ({...p, patientDemographics: next}));
    }, []);

    const setSocialHistory = useCallback((next: SocialHistory) => {
        setPatientInfo((p) => ({...p, socialHistory: next}));
    }, []);

    const setMedicalHistory = useCallback((next: MedicalHistory) => {
        setPatientInfo((p) => ({...p, medicalHistory: next}));
    }, []);

    const setMedicationList = useCallback((next: MedicationList) => {
        setPatientInfo((p) => ({...p, medicationList: next}));
    }, []);

    const setLabResult = useCallback((next: LabResult) => {
        setPatientInfo((p) => ({...p, labResult: next}));
    }, []);

    const setProgressNotes = useCallback((next: ProgressNotes) => {
        setPatientInfo((p) => ({...p, progressNotes: next}));
    }, []);

    // Medication list helpers
    const addMedication = useCallback((seed?: Partial<MedicationHistory>) => {
        setPatientInfo((p) => ({
            ...p,
            medicationList: {
                ...p.medicationList,
                medications: [
                    ...p.medicationList.medications,
                    {scheduledStartStopDate: seed?.scheduledStartStopDate, prn: seed?.prn},
                ],
            },
        }));
    }, []);

    const updateMedicationAt = useCallback((index: number, patch: Partial<MedicationHistory>) => {
        setPatientInfo((p) => {
            const meds = p.medicationList.medications.slice();
            const cur = meds[index];
            if (!cur) return p;
            meds[index] = {...cur, ...patch};
            return {
                ...p,
                medicationList: {...p.medicationList, medications: meds},
            };
        });
    }, []);

    const removeMedicationAt = useCallback((index: number) => {
        setPatientInfo((p) => {
            const meds = p.medicationList.medications.slice();
            meds.splice(index, 1);
            return {
                ...p,
                medicationList: {...p.medicationList, medications: meds},
            };
        });
    }, []);

    // Re-hydrate from backend (view screen) or when user loads a saved submission
    const hydrate = useCallback((next?: Partial<PatientInfo>) => {
        setPatientInfo((p) => mergePatientInfo(p, next));
    }, []);

    const validation = useMemo(() => PatientInfoSchema.safeParse(patientInfo), [patientInfo]);

    return {
        patientInfo, // full JSON (camelCase)
        setPatientInfo, // if you want raw control

        // sections (convenience)
        mrpToolData: patientInfo.mrpToolData,
        patientDemographics: patientInfo.patientDemographics,
        socialHistory: patientInfo.socialHistory,
        medicalHistory: patientInfo.medicalHistory,
        medicationList: patientInfo.medicationList,
        labResult: patientInfo.labResult,
        progressNotes: patientInfo.progressNotes,

        // section setters
        setMrpToolData,
        setPatientDemographics,
        setSocialHistory,
        setMedicalHistory,
        setMedicationList,
        setLabResult,
        setProgressNotes,

        // medication helpers
        addMedication,
        updateMedicationAt,
        removeMedicationAt,

        // hydration + validation
        hydrate,
        validation,
        isValid: validation.success,
        errors: validation.success ? null : z.treeifyError(validation.error),
    };
}
