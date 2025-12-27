// file: src/pages/student/forms/FormCard.tsx

import type {ReactNode} from "react";

type Props = {
    title: string;
    children: ReactNode;
    className?: string;
};

export default function FormCard({title, children, className = ""}: Props) {
    return (
        <section
            className={[
                "app-bg border border-subtle rounded-2xl p-4",
                "shadow-sm",
                "flex flex-col gap-3",
                className,
            ].join(" ")}
        >
            <div className="text-primary font-semibold text-sm">{title}</div>
            {children}
        </section>
    );
}
