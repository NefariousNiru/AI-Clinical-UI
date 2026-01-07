// file: src/pages/student/hooks/studentLayout.ts

import {useMemo} from "react";
import {matchPath, useLocation} from "react-router-dom";
import {STUDENT} from "../../../routes.ts";

type WorkupNavState = {
    weeklyWorkupId: number;
    studentEnrollmentId: string;
    weekNo?: number;
    patientName?: string;
};

type Args = {
    profileName?: string;
    welcomePrefix?: string;   // default: "Welcome"
    workupLabel?: string;     // default: "Workup"
};

export function useStudentLayoutTabText({
                                            profileName,
                                            welcomePrefix = "Welcome",
                                            workupLabel = "Workup",
                                        }: Args): string {
    const loc = useLocation();
    const st = (loc.state as WorkupNavState | null) ?? null;

    return useMemo(() => {
        const isWorkup = Boolean(matchPath({path: `${STUDENT}/workup`}, loc.pathname));

        if (isWorkup) {
            const wk = st?.weekNo;
            const pt = st?.patientName?.trim();

            if (typeof wk === "number" && pt) return `Week ${wk}: ${pt}`;
            if (typeof wk === "number") return `Week ${wk}`;
            return workupLabel;
        }

        return profileName ? `${welcomePrefix}, ${profileName}` : welcomePrefix;
    }, [loc.pathname, st?.weekNo, st?.patientName, profileName, welcomePrefix, workupLabel]);
}