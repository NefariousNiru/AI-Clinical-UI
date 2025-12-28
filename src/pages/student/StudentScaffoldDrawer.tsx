// file: src/pages/student/StudentScaffoldDrawer.tsx

import SharedScaffoldDrawer from "../shared/SharedScaffoldDrawer";

type StudentScaffoldDrawerProps = {
    open: boolean;
    onClose: () => void;
    onOpenSettings?: () => void;
    studentName?: string;
};

export function StudentScaffoldDrawer({
                                          open,
                                          onClose,
                                          onOpenSettings,
                                          studentName,
                                      }: StudentScaffoldDrawerProps) {
    return (
        <SharedScaffoldDrawer
            open={open}
            onClose={onClose}
            onOpenSettings={onOpenSettings}
            drawerId="student-drawer"
            title="AI IPC Workup"
            subtitle={studentName}
            actionsLabel="Actions"
        />
    );
}
