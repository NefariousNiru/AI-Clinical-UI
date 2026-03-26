// file: src/pages/auth/ProductInfo.tsx

import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion, useReducedMotion, type Variants} from "framer-motion";
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    GraduationCap,
    LineChart,
    MessageSquareText,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";
import {AUTH} from "../../routes.ts";

function cx(...xs: Array<string | false | null | undefined>) {
    return xs.filter(Boolean).join(" ");
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Trigger sooner (less “waiting”)
const INVIEW = {once: true, amount: 0.12, margin: "0px 0px -140px 0px"} as const;

const makeStagger = (delayChildren = 0.01, staggerChildren = 0.06): Variants => ({
    hidden: {},
    show: {transition: {delayChildren, staggerChildren}},
});

const fadeUp = (reduce: boolean): Variants => ({
    hidden: {opacity: 0, y: reduce ? 0 : 12},
    show: {
        opacity: 1,
        y: 0,
        transition: {duration: reduce ? 0 : 0.26, ease: EASE_OUT},
    },
});

const cardIn = (reduce: boolean): Variants => ({
    hidden: {opacity: 0, y: reduce ? 0 : 14, scale: reduce ? 1 : 0.99},
    show: reduce
        ? {opacity: 1, y: 0, scale: 1, transition: {duration: 0}}
        : {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {type: "spring", stiffness: 520, damping: 40, mass: 0.7},
        },
});

export default function ProductInfo() {
    const nav = useNavigate();
    const reduce = useReducedMotion();

    // Gate animations until after first paint.
    // This avoids fighting with JS/CSS parsing and initial layout on hard refresh.
    const [ready, setReady] = useState(false);
    useEffect(() => {
        let raf1 = 0;
        let raf2 = 0;
        raf1 = window.requestAnimationFrame(() => {
            raf2 = window.requestAnimationFrame(() => setReady(true));
        });
        return () => {
            window.cancelAnimationFrame(raf1);
            window.cancelAnimationFrame(raf2);
        };
    }, []);

    const pillars = useMemo(
        () => [
            {
                icon: Sparkles,
                title: "Faster, more useful feedback",
                body:
                    "Students get structured, rubric-aligned guidance that calls out strengths, omissions, and concrete improvements while the work is still fresh.",
            },
            {
                icon: LineChart,
                title: "Instructor insight at scale",
                body:
                    "Faculty see aggregated patterns by rubric element so they can target instruction, fix misunderstandings early, and track improvement over time.",
            },
            {
                icon: ShieldCheck,
                title: "Built for institutional deployment",
                body:
                    "Designed for university needs - controlled access, human oversight, and deployment options that support self-hosting and privacy requirements.",
            },
        ],
        []
    );

    const biDirectional = useMemo(
        () => [
            {
                title: "Students",
                points: [
                    "Individualized feedback that maps to the rubric and the student’s writing",
                    "Clear next steps to improve reasoning and communication on the next assignment",
                    "Consistent expectations across sections and instructors",
                ],
            },
            {
                title: "Instructors",
                points: [
                    "Class-level visibility into recurring gaps and underperformance",
                    "A faculty comment channel to add expert guidance where it matters",
                    "Less time spent on repetitive feedback - more time on higher-order teaching decisions",
                ],
            },
        ],
        []
    );

    const roadmap = useMemo(
        () => [
            {
                icon: Building2,
                title: "Pilot across disciplines",
                body:
                    "Recruit faculty from multiple departments and support authentic assignments with rubrics that fit each course’s learning goals.",
            },
            {
                icon: MessageSquareText,
                title: "Faculty-facing dashboard",
                body:
                    "Visualize class-level trends by rubric element so instructors can act on what students actually struggle with.",
            },
            {
                icon: BadgeCheck,
                title: "Rubric authoring + training",
                body:
                    "Provide guides and workshops so faculty can quickly build effective rubrics and adopt the workflow without extra overhead.",
            },
        ],
        []
    );

    return (
        <main id="main-content" role="main" className="min-h-screen app-bg text-primary">
            {/* Fixed gradient layer to reduce scroll paint + first-load repaint cost */}
            <div
                className="pointer-events-none fixed inset-0 -z-10"
                style={{
                    background:
                        "radial-gradient(700px 320px at 18% 12%, var(--color-secondary-soft-alt) 0%, transparent 60%)," +
                        "radial-gradient(700px 320px at 82% 18%, var(--color-accent-soft) 0%, transparent 55%)",
                }}
            />

            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-10 w-10 rounded-2xl border border-subtle bg-surface flex items-center justify-center shadow-sm">
                            <GraduationCap className="h-5 w-5"/>
                        </div>
                        <div className="leading-tight">
                            <div className="text-sm text-muted">AI Clinical</div>
                            <div className="text-lg font-semibold">Bi-directional feedback for students and instructors </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => nav(AUTH + "/login")}
                            className={cx(
                                "inline-flex items-center gap-2 rounded-xl px-4 py-2",
                                "bg-accent text-on-accent btn-hover",
                                "border border-accent shadow-sm"
                            )}
                        >
                            Log in
                            <ArrowRight className="h-4 w-4"/>
                        </button>
                    </div>
                </header>

                {/* HERO */}
                <section className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
                    <motion.div
                        className="lg:col-span-7 transform-gpu will-change-transform"
                        // key part: don't animate until ready (or if reduced motion)
                        initial="hidden"
                        animate={ready || !!reduce ? "show" : "hidden"}
                        variants={makeStagger(0.01, 0.06)}
                    >
                        <motion.div variants={fadeUp(!!reduce)}>
                            <div
                                className="inline-flex items-center gap-2 rounded-full border border-subtle bg-surface px-3 py-1 text-xs">
                                <Users className="h-4 w-4 text-secondary"/>
                                <span className="text-muted">
                                    Scaling formative feedback across UGA colleges and disciplines
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1 variants={fadeUp(!!reduce)}
                                   className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Turn written assignments into faster learning and stronger instruction
                        </motion.h1>

                        <motion.p variants={fadeUp(!!reduce)}
                                  className="mt-4 text-base text-muted leading-relaxed max-w-2xl">
                            Faculty rubrics define what “good” looks like. Students receive individualized, structured
                            feedback on strengths, omissions, and improvements. Instructors get student and cohort aggregated (across weeks, months and semesters) insights that reveal
                            where the class is struggling - early enough to teach to it.
                        </motion.p>

                        <motion.div variants={fadeUp(!!reduce)} className="mt-7 flex flex-wrap gap-3">
                            <div className="rounded-2xl border border-subtle bg-surface px-4 py-3 shadow-sm">
                                <div className="text-xs text-muted">Outcome</div>
                                <div className="text-sm font-medium">More timely, more actionable feedback</div>
                            </div>
                            <div className="rounded-2xl border border-subtle bg-surface px-4 py-3 shadow-sm">
                                <div className="text-xs text-muted">Faculty benefit</div>
                                <div className="text-sm font-medium">Trends by rubric element</div>
                            </div>
                            <div className="rounded-2xl border border-subtle bg-surface px-4 py-3 shadow-sm">
                                <div className="text-xs text-muted">Deployment</div>
                                <div className="text-sm font-medium">Self-hostable for universities</div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeUp(!!reduce)} className="mt-8 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => nav(AUTH + "/login")}
                                className={cx(
                                    "inline-flex items-center gap-2 rounded-xl px-5 py-2.5",
                                    "bg-secondary text-on-secondary btn-hover shadow-sm",
                                    "border border-secondary"
                                )}
                            >
                                Try it out
                                <ArrowRight className="h-4 w-4"/>
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* Right-side value card */}
                    <motion.div
                        className="lg:col-span-5 transform-gpu will-change-transform"
                        initial={{opacity: 0, y: reduce ? 0 : 10}}
                        animate={ready || !!reduce ? {opacity: 1, y: 0} : {opacity: 0, y: reduce ? 0 : 10}}
                        transition={reduce ? {duration: 0} : {duration: 0.24, ease: EASE_OUT, delay: 0.03}}
                    >
                        <div className="rounded-3xl border border-subtle bg-surface p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Sparkles className="h-4 w-4 text-secondary"/>
                                Why this matters
                            </div>

                            <div className="mt-4 space-y-3 text-sm text-muted leading-relaxed">
                                <div className="rounded-2xl border border-subtle bg-surface-subtle p-4">
                                    <div className="text-xs text-muted">Student impact</div>
                                    <div className="mt-1 text-sm font-medium text-primary">Faster iteration on reasoning
                                        and writing
                                    </div>
                                    <div className="mt-1">
                                        Students improve because the feedback is specific, structured, and delivered in
                                        time to use.
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-subtle bg-surface-subtle p-4">
                                    <div className="text-xs text-muted">Faculty impact</div>
                                    <div className="mt-1 text-sm font-medium text-primary">Teach to the gaps, not
                                        guesses
                                    </div>
                                    <div className="mt-1">
                                        Aggregated insights show common misunderstandings so instruction can be targeted
                                        and measurable.
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-subtle bg-surface-subtle p-4">
                                    <div className="text-xs text-muted">Institution impact</div>
                                    <div className="mt-1 text-sm font-medium text-primary">Sustainable feedback in
                                        high-enrollment courses
                                    </div>
                                    <div className="mt-1">
                                        Supports scaling without sacrificing quality - with human oversight where it
                                        counts.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* PILLARS */}
                <section className="mt-12">
                    <motion.div
                        className="transform-gpu will-change-transform"
                        initial="hidden"
                        whileInView="show"
                        viewport={INVIEW}
                        variants={makeStagger(0.01, 0.07)}
                    >
                        <motion.div variants={fadeUp(!!reduce)} className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-secondary"/>
                            <h2 className="text-lg font-semibold">What the platform delivers</h2>
                        </motion.div>

                        <motion.div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3"
                                    variants={makeStagger(0.03, 0.08)}>
                            {pillars.map((p) => {
                                const Icon = p.icon;
                                return (
                                    <motion.div
                                        key={p.title}
                                        variants={cardIn(!!reduce)}
                                        className="rounded-3xl border border-subtle bg-surface p-6 shadow-sm transform-gpu will-change-transform"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-10 w-10 rounded-2xl border border-subtle bg-surface-subtle flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-secondary"/>
                                            </div>
                                            <div className="text-base font-semibold">{p.title}</div>
                                        </div>
                                        <p className="mt-3 text-sm text-muted leading-relaxed">{p.body}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </section>

                {/* BI-DIRECTIONAL */}
                <section className="mt-12">
                    <motion.div
                        className="transform-gpu will-change-transform"
                        initial="hidden"
                        whileInView="show"
                        viewport={INVIEW}
                        variants={makeStagger(0.01, 0.07)}
                    >
                        <motion.div variants={fadeUp(!!reduce)} className="flex items-center gap-2">
                            <MessageSquareText className="h-5 w-5 text-secondary"/>
                            <h2 className="text-lg font-semibold">Bi-directional feedback</h2>
                        </motion.div>

                        <motion.div variants={makeStagger(0.03, 0.08)}
                                    className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {biDirectional.map((col) => (
                                <motion.div
                                    key={col.title}
                                    variants={cardIn(!!reduce)}
                                    className="rounded-3xl border border-subtle bg-surface p-6 shadow-sm transform-gpu will-change-transform"
                                >
                                    <div className="text-sm font-semibold">{col.title}</div>
                                    <ul className="mt-3 space-y-2 text-sm text-muted leading-relaxed">
                                        {col.points.map((pt) => (
                                            <li key={pt} className="flex gap-3">
                                                <span className="mt-2 h-2 w-2 rounded-full bg-secondary"/>
                                                <span>{pt}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={fadeUp(!!reduce)}
                            className="mt-6 rounded-3xl border border-subtle bg-surface-subtle p-6 shadow-sm transform-gpu will-change-transform"
                        >
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <BadgeCheck className="h-4 w-4 text-secondary"/>
                                Human oversight is a feature, not an afterthought
                            </div>
                            <p className="mt-2 text-sm text-muted leading-relaxed">
                                The system strengthens instructor capacity. Faculty can review trends, spot edge cases,
                                and add expert comments
                                without losing rubric consistency or redoing repetitive feedback.
                            </p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ROADMAP */}
                <section className="mt-12">
                    <motion.div
                        className="transform-gpu will-change-transform"
                        initial="hidden"
                        whileInView="show"
                        viewport={INVIEW}
                        variants={makeStagger(0.01, 0.07)}
                    >
                        <motion.div variants={fadeUp(!!reduce)} className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-secondary"/>
                            <h2 className="text-lg font-semibold">What we are scaling next</h2>
                        </motion.div>

                        <motion.div variants={makeStagger(0.03, 0.08)}
                                    className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                            {roadmap.map((r) => {
                                const Icon = r.icon;
                                return (
                                    <motion.div
                                        key={r.title}
                                        variants={cardIn(!!reduce)}
                                        className="rounded-3xl border border-subtle bg-surface p-6 shadow-sm transform-gpu will-change-transform"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-10 w-10 rounded-2xl border border-subtle bg-surface-subtle flex items-center justify-center">
                                                <Icon className="h-5 w-5 text-secondary"/>
                                            </div>
                                            <div className="text-base font-semibold">{r.title}</div>
                                        </div>
                                        <p className="mt-3 text-sm text-muted leading-relaxed">{r.body}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        <motion.div
                            variants={fadeUp(!!reduce)}
                            className="mt-6 rounded-3xl border border-subtle bg-surface p-6 shadow-sm transform-gpu will-change-transform"
                        >
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <ShieldCheck className="h-4 w-4 text-secondary"/>
                                Validation and trust
                            </div>
                            <p className="mt-2 text-sm text-muted leading-relaxed">
                                Outputs are evaluated with expert review and acceptable inter-rater reliability, paired
                                with student and faculty
                                feedback so the product improves in ways that matter in real courses.
                            </p>
                        </motion.div>
                    </motion.div>
                </section>

                {/* FOOTER */}
                <footer className="mt-12 flex flex-col items-center gap-3 pb-8">
                    <div className="text-xs text-muted text-center max-w-3xl">
                        Built at the University of Georgia - Instructional Innovation and Research, College of Pharmacy.
                        <span className="block mt-1">Designed to strengthen instruction and student learning across disciplines.</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => nav(AUTH + "/login")}
                        className={cx(
                            "inline-flex items-center gap-2 rounded-xl px-5 py-2.5",
                            "bg-accent text-on-accent btn-hover shadow-sm",
                            "border border-accent"
                        )}
                    >
                        Log in to continue
                        <ArrowRight className="h-4 w-4"/>
                    </button>
                </footer>
            </div>
        </main>
    );
}
