// file: src/pages/auth/EnrollmentActivationPage.tsx

import {
    type FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Header from "../../components/Header";
import {Bot, Info, KeyRound, CheckCircle2} from "lucide-react";
import {useEnrollmentActivation} from "./hooks/auth";
import {EnrollmentActivationRequest} from "../../lib/types/auth";

type FieldErrors = {
    form?: string;
};

export default function EnrollmentActivationPage() {
    const nav = useNavigate();
    const loc = useLocation();

    const searchParams = useMemo(
        () => new URLSearchParams(loc.search),
        [loc.search],
    );
    const token = searchParams.get("token");

    const [consentAi, setConsentAi] = useState(false);
    const [consentEnroll, setConsentEnroll] = useState(false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [redirectIn, setRedirectIn] = useState<number | null>(null);

    const {
        loading,
        error: apiError,
        success,
        activate,
    } = useEnrollmentActivation();

    const tokenMissing = !token || !token.trim();

    // On success, show a success card and start a countdown to login.
    useEffect(() => {
        if (!success) return;

        // Start at 5 seconds
        setRedirectIn(5);

        const intervalId = window.setInterval(() => {
            setRedirectIn((prev) => {
                if (prev === null) return prev;
                if (prev <= 1) {
                    window.clearInterval(intervalId);
                    nav("/login", {replace: true});
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [success, nav]);

    function clearFormError() {
        if (errors.form) {
            setErrors({form: undefined});
        }
    }

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});

        if (tokenMissing) {
            setErrors({
                form:
                    "Activation link is invalid or missing the token. Please request a new enrollment email.",
            });
            return;
        }

        if (!consentAi || !consentEnroll) {
            setErrors({
                form: "You must agree to all terms to continue.",
            });
            return;
        }

        // Validate payload shape with Zod (defensive, but simple)
        const parsed = EnrollmentActivationRequest.safeParse({token});
        if (!parsed.success) {
            setErrors({
                form:
                    parsed.error.issues[0]?.message ??
                    "Failed to validate activation request.",
            });
            return;
        }

        try {
            await activate(parsed.data);
            // success handled by hook + useEffect
        } catch {
            // hook already set apiError
        }
    }

    const effectiveFormError = errors.form || apiError || null;

    return (
        <div className="min-h-screen app-bg text-primary flex flex-col">
            <Header title="Confirm your AI Clinical enrollment"/>

            <main
                id="main-content"
                role="main"
                aria-label="Enrollment activation form"
                className="px-4 py-10 grid place-items-center flex-1"
            >
                {/* Missing token case: show a clear error and nothing else */}
                {tokenMissing && !success && (
                    <section
                        className="w-full max-w-[480px] rounded-2xl border border-danger bg-danger-soft text-danger px-5 py-4">
                        <p className="text-sm font-semibold mb-1">
                            Enrollment link is invalid
                        </p>
                        <p className="text-xs">
                            The enrollment link is missing a token or has been corrupted.
                            Please use the latest link from your email or ask your course
                            coordinator to send a new one.
                        </p>
                    </section>
                )}

                {/* Success state: show redirect countdown and manual fallback */}
                {!tokenMissing && success && (
                    <section
                        className="w-full max-w-[520px] rounded-2xl border border-accent bg-accent-soft px-5 py-4 text-sm text-primary">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-accent"/>
                            <p className="font-semibold">Enrollment confirmed</p>
                        </div>
                        <p className="text-xs mb-2">
                            Your AI Clinical enrollment and consent have been recorded
                            successfully.
                        </p>
                        <p className="text-xs mb-2">
                            You will be redirected to the login page
                            {" "}
                            in{" "}
                            <span className="font-semibold">
                                {redirectIn ?? 5}
                            </span>{" "}
                            seconds.
                        </p>
                        <p className="text-xs text-muted mb-3">
                            If you are not redirected automatically, you can use the button
                            below to continue.
                        </p>
                        <button
                            type="button"
                            onClick={() => nav("/login", {replace: true})}
                            className="h-9 rounded-md bg-accent text-on-accent text-xs font-medium px-4 hover:opacity-90"
                        >
                            Go to login now
                        </button>
                    </section>
                )}

                {/* Consent form, only if we have a token and not yet successful */}
                {!tokenMissing && !success && (
                    <form
                        onSubmit={onSubmit}
                        noValidate
                        className="w-full max-w-[520px] rounded-2xl border border-subtle bg-surface-subtle shadow-sm"
                    >
                        {/* Top chips */}
                        <div className="px-5 py-3 text-base font-semibold flex items-center gap-2">
                            <Bot className="h-4 w-4"/>
                            <span>Welcome to AI Clinical</span>
                        </div>

                        <div className="border-t border-subtle px-5 py-3 text-base font-light flex items-center gap-2">
                            <KeyRound className="h-4 w-4"/>
                            <span>Confirm your enrollment and consent</span>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Form / API errors */}
                            {effectiveFormError && (
                                <div
                                    className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
                                    {effectiveFormError}
                                </div>
                            )}

                            {/* Summary text */}
                            <section className="space-y-2 text-sm text-primary">
                                <p>
                                    This course uses AI systems to analyze your responses and
                                    generate feedback to support your learning.
                                </p>
                                <p>
                                    These systems may be provided by third-party AI vendors
                                    (for example, OpenAI or other providers). Your responses may
                                    be processed by these services in order to generate feedback
                                    and related educational analytics.
                                </p>
                                <p className="text-muted text-xs">
                                    The next steps require your explicit consent to use these AI
                                    systems and to confirm your enrollment in this AI-Clinical
                                    semester.
                                </p>
                            </section>

                            {/* Consent checkboxes */}
                            <div className="space-y-3 text-sm text-primary">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-[3px] h-4 w-4 rounded border-subtle bg-input"
                                        checked={consentAi}
                                        onChange={(ev) => {
                                            setConsentAi(ev.target.checked);
                                            clearFormError();
                                        }}
                                    />
                                    <span>
                                        I understand and consent that my responses in this course
                                        may be processed by AI systems (including third-party
                                        providers) for the purpose of generating feedback and
                                        related educational analytics.
                                    </span>
                                </label>

                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="mt-[3px] h-4 w-4 rounded border-subtle bg-input"
                                        checked={consentEnroll}
                                        onChange={(ev) => {
                                            setConsentEnroll(ev.target.checked);
                                            clearFormError();
                                        }}
                                    />
                                    <span>
                                        I confirm my enrollment in this AI-Clinical semester and
                                        agree to use the platform as part of my coursework.
                                    </span>
                                </label>
                            </div>

                            {/* Submit action */}
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-md bg-accent text-on-accent text-sm font-medium hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading ? "Confirming enrollment…" : "Confirm enrollment"}
                                </button>
                            </div>

                            {/* Info footer */}
                            <div className="flex items-start text-[11px] text-muted">
                                <Info
                                    className="mr-1 h-5 w-5 mt-[1px]"
                                    aria-hidden="true"
                                />
                                <span>
                                    If this link no longer works or you did not expect this email,
                                    please contact your course coordinator for assistance.
                                </span>
                            </div>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
