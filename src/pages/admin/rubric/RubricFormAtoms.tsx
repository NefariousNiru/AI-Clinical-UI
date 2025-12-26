// file: src/pages/admin/rubric/RubricFormAtoms.tsx

import React, {useEffect, useState} from "react";
import {ChevronDown, ChevronUp} from "lucide-react";
import {capitalizeFirst} from "../../../lib/utils/functions.ts";

export function TooltipBadge({tip}: { tip: string }) {
    return (
        <span className="relative inline-flex items-center">
            <span
                className={[
                    "group inline-flex h-4 w-4 items-center justify-center rounded-full",
                    "border border-subtle bg-surface-subtle text-[10px] font-semibold text-muted",
                    "cursor-default select-none",
                ].join(" ")}
                aria-label={tip}
            >
                ?
                <span
                    className={[
                        "pointer-events-none absolute top-full z-50 mt-2 hidden",
                        "left-2 right-2 mx-auto",
                        "w-[260px] max-w-[calc(100vw-16px)]",
                        "whitespace-normal break-words rounded-xl",
                        "border border-subtle bg-surface px-2 py-1.5 text-[11px] leading-snug text-primary shadow-lg",
                        "group-hover:block",
                    ].join(" ")}
                    role="tooltip"
                >
                    {tip}
                </span>
            </span>
        </span>
    );
}

export function FieldLabel({label, tip}: { label: string; tip?: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="text-[11px] font-medium text-muted">{label}</div>
            {tip ? <TooltipBadge tip={tip}/> : null}
        </div>
    );
}

export function Card({
                         title,
                         open,
                         onToggle,
                         children,
                         right,
                     }: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    right?: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-subtle app-bg shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-primary">{capitalizeFirst(title)}</div>
                </div>

                <div className="flex items-center gap-2">
                    {right ? <div className="hidden sm:block">{right}</div> : null}
                    {open ? <ChevronUp/> : <ChevronDown/>}
                </div>
            </button>

            {open ? <div className="px-4 pb-4">{children}</div> : null}
        </section>
    );
}

export function ChevronToggle({
                                  open,
                                  onToggle,
                                  title,
                              }: {
    open: boolean;
    onToggle: () => void;
    title?: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full",
                "border border-subtle bg-surface text-primary hover:bg-surface-subtle",
            ].join(" ")}
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
        >
            {open ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
        </button>
    );
}

export function TextInput({
                              value,
                              onChange,
                              onBlur,
                              disabled = false,
                              placeholder,
                              invalid = false,
                              title,
                          }: {
    value: string;
    onChange: (v: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    invalid?: boolean;
    title?: string;
}) {
    return (
        <input
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            title={title}
            onBlur={onBlur}
            onChange={(e) => onChange(e.target.value)}
            className={[
                "h-8 w-full rounded-3xl border bg-surface px-2 text-xs text-primary placeholder:text-muted",
                invalid ? "border-danger" : "border-subtle",
                disabled ? "opacity-50" : "",
                "focus:outline-none focus:border-strong",
            ].join(" ")}
        />
    );
}

export function TextArea({
                             value,
                             onChange,
                             disabled = false,
                             placeholder,
                         }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <textarea
            disabled={disabled}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={[
                "min-h-[64px] w-full rounded-2xl border border-subtle bg-surface px-3 py-2",
                "text-xs leading-relaxed text-primary placeholder:text-muted",
                disabled ? "opacity-50" : "",
                "focus:outline-none focus:border-strong",
            ].join(" ")}
        />
    );
}

export function NumInput({
                             value,
                             onChange,
                             onBlur,
                             disabled = false,
                             title,
                         }: {
    value: number;
    onChange: (v: number) => void;
    onBlur?: () => void;
    disabled?: boolean;
    title?: string;
}) {
    return (
        <input
            disabled={disabled}
            type="number"
            value={Number.isFinite(value) ? value : 0}
            title={title}
            onBlur={onBlur}
            onChange={(e) => onChange(Number(e.target.value))}
            className={[
                "h-8 w-full rounded-3xl border border-subtle bg-surface px-2 text-xs text-primary",
                disabled ? "opacity-70" : "",
                "focus:outline-none focus:border-strong",
            ].join(" ")}
        />
    );
}

export function SmallButton({
                                children,
                                onClick,
                                variant = "secondary",
                                disabled = false,
                                title,
                                fullWidth = false,
                            }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "secondary" | "ghost" | "danger";
    disabled?: boolean;
    title?: string;
    fullWidth?: boolean;
}) {
    const cls =
        variant === "secondary"
            ? "bg-secondary text-on-secondary hover:opacity-90"
            : variant === "danger"
                ? "bg-danger text-on-danger hover:opacity-90"
                : "border border-subtle bg-surface text-primary hover:bg-surface-subtle";

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            disabled={disabled}
            title={title}
            className={[
                "h-8 rounded-3xl px-3 text-[11px] font-medium",
                fullWidth ? "w-full" : "",
                cls,
                disabled ? "opacity-60" : "",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function stringifyJsonValue(v: unknown): string {
    if (v === null || v === undefined) return "";
    try {
        return JSON.stringify(v, null, 2);
    } catch {
        return "";
    }
}

function safeParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
    const trimmed = text.trim();
    if (!trimmed) return {ok: true, value: null};
    try {
        const v: unknown = JSON.parse(trimmed);
        return {ok: true, value: v};
    } catch {
        return {ok: false, error: "Invalid JSON"};
    }
}

export function JsonTextArea({
                                 label,
                                 tip,
                                 value,
                                 onCommit,
                                 placeholder,
                             }: {
    label: string;
    tip?: string;
    value: unknown;
    onCommit: (v: unknown) => void;
    placeholder?: string;
}) {
    const [text, setText] = useState<string>(() => stringifyJsonValue(value));
    const [bad, setBad] = useState<boolean>(false);

    useEffect(() => {
        setText(stringifyJsonValue(value));
        setBad(false);
    }, [value]);

    return (
        <label className="space-y-1">
            <FieldLabel label={label} tip={tip}/>
            <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    setBad(false);
                }}
                onBlur={() => {
                    const parsed = safeParseJson(text);
                    if (!parsed.ok) {
                        setBad(true);
                        return;
                    }
                    setBad(false);
                    onCommit(parsed.value);
                }}
                placeholder={placeholder ?? "{\n  \n}"}
                className={[
                    "min-h-[88px] w-full rounded-2xl border bg-surface px-3 py-2 font-mono text-[11px] leading-relaxed text-primary",
                    bad ? "border-danger" : "border-subtle",
                    "focus:outline-none focus:border-strong",
                ].join(" ")}
                spellCheck={false}
            />
            {bad ? <div className="text-[11px] text-danger">Invalid JSON</div> : null}
        </label>
    );
}
