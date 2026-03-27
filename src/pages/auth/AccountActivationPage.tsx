// file: src/pages/auth/AccountActivationPage.tsx

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Bot, Check, CheckCircle2, Eye, EyeOff, Info, KeyRound, Lock, TriangleAlert, } from "lucide-react";
import { useAccountActivation, useBootstrapUserRole } from "./hooks/auth";
import { PasswordSchema, UserActivationRequest } from "../../lib/types/auth";
import { ADMIN, STUDENT } from "../../routes.ts";

type FieldErrors = {
	password?: string;
	confirmPassword?: string;
	form?: string;
};

export default function AccountActivationPage() {
	const nav = useNavigate();
	const loc = useLocation();

	const searchParams = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<FieldErrors>({});

	// 1) If already signed in, route by role (shared hook with AutoHome)
	const { status: bootstrapStatus, role: bootstrapRole } = useBootstrapUserRole();

	useEffect(() => {
		if (bootstrapStatus === "success" && bootstrapRole) {
			const dest = bootstrapRole === "admin" ? ADMIN : STUDENT;
			nav(dest, { replace: true });
		}
		// On "error" we do nothing: user stays on login page.
	}, [bootstrapStatus, bootstrapRole, nav]);

	const { loading, error: apiError, success, activate } = useAccountActivation();

	const tokenMissing = !token || !token.trim();

	function clearFieldError(field: keyof FieldErrors) {
		setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setErrors({});

		if (tokenMissing) {
			setErrors({
				form: "Activation link is invalid or missing the token. Please request a new activation email.",
			});
			return;
		}

		// 1) Validate password with same rules as login
		const pwdResult = PasswordSchema.safeParse(password);
		const newErrors: FieldErrors = {};

		if (!pwdResult.success) {
			newErrors.password = pwdResult.error.issues[0]?.message ?? "Invalid password.";
		}

		// 2) Confirm password match
		if (!confirmPassword.trim()) {
			newErrors.confirmPassword = "Please confirm your password.";
		} else if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match.";
		}

		if (newErrors.password || newErrors.confirmPassword) {
			setErrors(newErrors);
			return;
		}

		// 3) Validate full payload using activation schema
		const payloadResult = UserActivationRequest.safeParse({
			token,
			password,
		});

		if (!payloadResult.success) {
			const formMsg =
				payloadResult.error.issues[0]?.message ?? "Failed to validate activation request.";
			setErrors({ form: formMsg });
			return;
		}

		try {
			await activate(payloadResult.data);
			// success flag handled by hook
		} catch {
			// hook already set apiError; nothing to do here
		}
	}

	const effectiveFormError = errors.form || apiError || null;

	return (
		<div className="min-h-screen app-bg text-primary flex flex-col">
			<Header title="Activate your AI Clinical Account" />

			<main
				id="main-content"
				role="main"
				aria-label="Account activation form"
				className="px-4 py-10 grid place-items-center flex-1"
			>
				{/* Missing token case: show a clear error */}
				{tokenMissing && !success && (
					<section className="w-full max-w-[440px] rounded-2xl border border-danger bg-danger-soft text-danger px-5 py-4">
						<p className="text-sm font-semibold mb-1">Activation link is invalid</p>
						<p className="text-xs">
							The activation link is missing a token or has been corrupted. Please use
							the latest link from your email or ask your course coordinator to send a
							new one.
						</p>
					</section>
				)}

				{/* Success state: hide the form, show next-steps card */}
				{success && !tokenMissing && (
					<section className="w-full max-w-[480px] rounded-2xl border border-accent bg-accent-soft px-5 py-4 text-sm text-primary">
						<div className="flex items-center gap-2 mb-2">
							<CheckCircle2 className="h-5 w-5 text-accent" />
							<p className="font-semibold text-lg">Account activated</p>
						</div>
						<p className="text-s mb-2">
							Your AI Clinical account has been activated successfully.
						</p>
						<p className="text-s mb-1">
							Next steps: you will receive an onboarding email with details on how to
							access the platform, course-specific instructions, and any additional
							steps required by your instructor.
						</p>
						<p className="text-xs text-muted">
							Keep an eye on your UGA inbox over the next few days. If you do not see
							an email, check your spam folder or contact your course coordinator.
						</p>
					</section>
				)}

				{/* Form (only if we have a token and not yet successful) */}
				{!tokenMissing && !success && (
					<form
						onSubmit={onSubmit}
						noValidate
						className="w-full max-w-[480px] rounded-2xl border border-subtle bg-surface-subtle shadow-sm"
					>
						{/* Top chips */}
						<div className="px-5 py-3 text-base font-semibold flex items-center gap-2">
							<Bot className="h-4 w-4" />
							<span>Welcome to AI Clinical</span>
						</div>

						<div className="border-t border-subtle px-5 py-3 text-base font-light flex items-center gap-2">
							<KeyRound className="h-4 w-4" />
							<span>Set your password to activate your account</span>
						</div>

						<div className="px-5 py-3 flex items-start gap-2 text-muted-foreground">
							<TriangleAlert className="h-8 w-8 text-amber-500" />

							<div>
								<p className="text-base font-semibold text-foreground">
									Save your password
								</p>
								<p className="text-sm">
									We currently <strong>do not support password resets</strong>. If
									you lose it, you may permanently lose access to your account.
								</p>
							</div>
						</div>

						<div className="p-5 space-y-4">
							{/* Form / API errors */}
							{effectiveFormError && (
								<div className="rounded-md border border-danger bg-danger-soft px-3 py-2 text-sm text-danger">
									{effectiveFormError}
								</div>
							)}

							{/* Password field */}
							<div className="space-y-1">
								<label
									htmlFor="password"
									className="flex items-center gap-1 text-sm text-primary"
								>
									<Lock className="h-4 w-4" aria-hidden="true" />
									<span>New password</span>
								</label>
								<div className="relative">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(ev) => {
											setPassword(ev.target.value);
											if (errors.password) clearFieldError("password");
										}}
										className={[
											"w-full rounded-md border bg-input px-3 py-2 pr-10 text-base",
											"focus:outline-none focus:ring-1",
											errors.password ? "border-danger" : "border-subtle",
										].join(" ")}
										placeholder="Create a strong password"
										aria-invalid={!!errors.password}
										aria-describedby={
											errors.password ? "password-error" : undefined
										}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-primary"
										aria-label={
											showPassword ? "Hide password" : "Show password"
										}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" aria-hidden="true" />
										) : (
											<Eye className="h-4 w-4" aria-hidden="true" />
										)}
									</button>
								</div>
								{errors.password && (
									<p id="password-error" className="text-xs text-danger">
										{errors.password}
									</p>
								)}
							</div>

							{/* Confirm password field */}
							<div className="space-y-1">
								<label
									htmlFor="confirm-password"
									className="flex items-center gap-1 text-sm text-primary"
								>
									<Check className="h-4 w-4" aria-hidden="true" />
									<span>Confirm password</span>
								</label>
								<div className="relative">
									<input
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={(ev) => {
											setConfirmPassword(ev.target.value);
											if (errors.confirmPassword)
												clearFieldError("confirmPassword");
										}}
										className={[
											"w-full rounded-md border bg-input px-3 py-2 pr-10 text-base",
											"focus:outline-none focus:ring-1",
											errors.confirmPassword
												? "border-danger"
												: "border-subtle",
										].join(" ")}
										placeholder="Re-enter password"
										aria-invalid={!!errors.confirmPassword}
										aria-describedby={
											errors.confirmPassword
												? "confirm-password-error"
												: undefined
										}
										required
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((v) => !v)}
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-primary"
										aria-label={
											showConfirmPassword ? "Hide password" : "Show password"
										}
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" aria-hidden="true" />
										) : (
											<Eye className="h-4 w-4" aria-hidden="true" />
										)}
									</button>
								</div>
								{errors.confirmPassword && (
									<p id="confirm-password-error" className="text-xs text-danger">
										{errors.confirmPassword}
									</p>
								)}
							</div>

							{/* Submit action */}
							<div className="flex flex-col gap-3 pt-2">
								<button
									type="submit"
									disabled={loading}
									className="w-full h-10 rounded-md bg-accent text-on-accent text-sm font-medium hover:opacity-90 disabled:opacity-60"
								>
									{loading ? "Activating…" : "Activate account"}
								</button>
							</div>

							{/* Info footer */}
							<div className="flex items-start text-[11px] text-muted">
								<Info className="mr-1 h-5 w-5 mt-[1px]" aria-hidden="true" />
								<span>
									This activation link may expire after a short time. If it no
									longer works, please request a new email from your course
									coordinator.
								</span>
							</div>
						</div>
					</form>
				)}
			</main>
		</div>
	);
}
