// file: src/pages/rubric/RubricSearchAutocomplete.tsx

import {useEffect, useMemo, useState} from "react";
import {Loader2, Search} from "lucide-react";
import Modal from "../../../components/Modal";
import {searchRubrics} from "../../../lib/api/admin/rubric";
import {addDisease} from "../../../lib/api/admin/disease";
import type {RubricSearchItem} from "../../../lib/types/rubric";
import {titleizeDiseaseName} from "../../../lib/functions";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 3;

type CreateDiseaseModalProps = {
    open: boolean;
    initialName: string;
    onClose: () => void;
};

function CreateDiseaseModal({
                                open,
                                initialName,
                                onClose,
                            }: CreateDiseaseModalProps) {
    const [name, setName] = useState(initialName);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setName(initialName);
        setSaving(false);
        setError(null);
    }, [open, initialName]);

    async function handleSave() {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Disease name cannot be empty.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const resp = await addDisease(trimmed);

            // Backend returns { created: [...], skipped: [...] }.
            // Only close when at least one disease was created as ui allows to create only one disease
            if (Array.isArray(resp.created) && resp.created.length > 0) {
                onClose();
            } else {
                // Could be already existing or skipped for some other reason.
                setError(
                    "Disease could not be created (it may already exist or was skipped).",
                );
            }
        } catch (e) {
            setError("Failed to save disease. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal
            open={open}
            onClose={saving ? undefined : onClose}
            title="Create new disease"
            className="w-[min(420px,95vw)]"
        >
            <div className="space-y-3 text-sm">
                <p className="text-muted">
                    Add a new disease.
                </p>

                <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted">Disease name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                        className="mt-1 h-9 w-full rounded-md border border-subtle bg-input px-2 text-sm text-primary"
                        disabled={saving}
                    />
                </label>

                {error && (
                    <p className="text-xs text-danger" role="alert">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="h-8 rounded-4xl border border-subtle bg-surface-subtle px-3 text-xs font-medium text-primary hover:bg-surface disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="inline-flex h-8 items-center rounded-4xl bg-secondary px-3 text-xs font-medium text-on-secondary hover:opacity-90 disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Save disease"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

type RubricSearchAutocompleteProps = {
    /** Optional heading/label for the field */
    label?: string;
};

export default function RubricSearchAutocomplete({
                                                     label = "Search disease / rubric",
                                                 }: RubricSearchAutocompleteProps) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<RubricSearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);

    // debounce query
    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(handle);
    }, [query]);

    // fetch autocomplete results when debouncedQuery changes
    useEffect(() => {
        if (debouncedQuery.length < MIN_QUERY_LEN) {
            setResults([]);
            setError(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        // hard-code limit 10 as requested
        searchRubrics(debouncedQuery, 10)
            .then((resp) => {
                if (cancelled) return;
                setResults(resp.results ?? []);
            })
            .catch(() => {
                if (cancelled) return;
                setResults([]);
                setError("Failed to load suggestions.");
            })
            .finally(() => {
                if (cancelled) return;
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    const showCreateInline = useMemo(
        () => debouncedQuery.length >= MIN_QUERY_LEN && results.length === 0,
        [debouncedQuery, results.length],
    );

    function handleClickCreateDiseaseInline() {
        setCreateModalOpen(true);
    }

    function handleClickCreateRubric(item: RubricSearchItem) {
        // TODO: wire to "add rubric" flow
        // eslint-disable-next-line no-console
        console.log("[Autocomplete] create rubric for disease:", item.diseaseName);
    }

    function handleClickViewRubric(item: RubricSearchItem) {
        // TODO: wire to "view rubric" flow
        // eslint-disable-next-line no-console
        console.log("[Autocomplete] view rubric for disease:", item.diseaseName);
    }

    return (
        <div className="space-y-2 text-sm">
            {/* Search input */}
            <div className="space-y-1">
                <label className="block text-xs font-medium text-muted">
                    {label}
                </label>
                <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
                        <Search className="h-4 w-4 text-muted" aria-hidden="true"/>
                    </span>
                    <input
                        type="text"
                        value={query}
                        onChange={(ev) => setQuery(ev.target.value)}
                        placeholder="Start typing a disease name…"
                        className="h-9 w-full rounded-4xl border border-subtle bg-input pl-8 pr-3 text-sm text-primary placeholder:text-muted"
                        autoComplete="off"
                    />
                </div>
                <p className="text-[11px] text-muted">
                    Type at least {MIN_QUERY_LEN} characters to search.
                </p>
            </div>

            {/* Results panel */}
            <div className="rounded-xl border border-subtle bg-surface-subtle">
                {loading && (
                    <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted">
                        <Loader2 className="h-3 w-3 animate-spin"/>
                        <span>Searching…</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="px-3 py-2 text-xs text-danger">{error}</div>
                )}

                {!loading && !error && debouncedQuery.length < MIN_QUERY_LEN && (
                    <div className="px-3 py-2 text-xs text-muted">
                        Start typing to see matching diseases.
                    </div>
                )}

                {!loading &&
                    !error &&
                    debouncedQuery.length >= MIN_QUERY_LEN &&
                    results.length > 0 && (
                        <ul className="max-h-64 overflow-auto divide-y divide-subtle text-xs">
                            {results.map((item) => (
                                <li
                                    key={item.diseaseName}
                                    className="flex items-center justify-between gap-2 px-3 py-2"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-primary">
                                            {titleizeDiseaseName(item.diseaseName)}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-muted">
                                            {item.rubricExists
                                                ? "Rubric exists for this disease."
                                                : "No rubric yet for this disease."}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {item.rubricExists ? (
                                            <button
                                                type="button"
                                                onClick={() => handleClickViewRubric(item)}
                                                className="h-7 rounded-4xl border border-subtle bg-secondary text-on-secondary px-2 text-[11px] font-medium text-primary hover:bg-surface-subtle"
                                            >
                                                View rubric
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleClickCreateRubric(item)}
                                                className="h-7 rounded-4xl bg-secondary px-2 text-[11px] font-medium text-on-secondary hover:opacity-90"
                                            >
                                                Create Rubric
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                {/* No matches -> inline create disease prompt */}
                {!loading &&
                    !error &&
                    showCreateInline && (
                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                            <div className="flex-1 min-w-0">
                                <div className="truncate text-primary">
                                    No diseases match &ldquo;{debouncedQuery}&rdquo;.
                                </div>
                                <div className="mt-0.5 text-[11px] text-muted">
                                    You can create a new disease using this key. Click create to
                                    learn more.
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleClickCreateDiseaseInline}
                                className="h-7 rounded-4xl bg-secondary px-2 text-[11px] font-medium text-on-secondary hover:opacity-90"
                            >
                                Create disease
                            </button>
                        </div>
                    )}
            </div>

            {/* Create disease modal */}
            <CreateDiseaseModal
                open={createModalOpen}
                initialName={debouncedQuery}
                onClose={() => setCreateModalOpen(false)}
            />
        </div>
    );
}
