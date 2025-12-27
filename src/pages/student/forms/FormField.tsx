// file: src/pages/student/forms/FormField.tsx

import type {ChangeEvent} from "react";

type Props = {
    label: string;
    value?: string;
    onChange: (next?: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    multiline?: boolean;
    className?: string;
};

export default function FormField({
                                      label,
                                      value,
                                      onChange,
                                      placeholder,
                                      readOnly,
                                      multiline,
                                      className = "",
                                  }: Props) {
    const v = value ?? "";

    const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const raw = e.target.value;
        const next = raw.trim().length === 0 ? undefined : raw;
        onChange(next);
    };

    const base =
        "w-full rounded-lg border border-subtle bg-surface-subtle px-3 py-2 text-primary " +
        "focus:outline-none focus:ring-2 focus:ring-black/10";

    return (
        <label className={["flex flex-col gap-1", className].join(" ")}>
            <span className="text-primary text-xs">{label}</span>
            {multiline ? (
                <textarea
                    className={[base, "min-h-[88px] resize-y"].join(" ")}
                    value={v}
                    onChange={handle}
                    placeholder={placeholder}
                    readOnly={readOnly}
                />
            ) : (
                <input
                    className={base}
                    value={v}
                    onChange={handle}
                    placeholder={placeholder}
                    readOnly={readOnly}
                />
            )}
        </label>
    );
}
