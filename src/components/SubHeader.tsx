// file: src/components/SubHeader.tsx

import type {ReactNode} from "react";

type SubHeaderProps = {
    title?: string;
    description?: string;
    left?: ReactNode;
    tabs?: ReactNode;
    right?: ReactNode;
    sticky?: boolean;
    className?: string;
};

export default function SubHeader({
                                      title,
                                      description,
                                      left,
                                      tabs,
                                      right,
                                      sticky = false,
                                      className = "",
                                  }: SubHeaderProps) {
    const rootClasses = [
        "app-bg",
        "px-2 md:px-2",
        sticky ? "sticky top-14 z-20" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <section className={rootClasses}>
            {/* Desktop: single row - left / center / right */}
            <div className="hidden md:flex w-full items-center gap-3 min-w-0">
                {/* Left: title or custom content */}
                <div className="flex items-center gap-2 min-w-0 flex-[0_0_auto]">
                    {left ? (
                        left
                    ) : title ? (
                        <div className="min-w-0">
                            <h1 className="text-sm font-semibold text-primary truncate">
                                {title}
                            </h1>
                            {description ? (
                                <p className="text-[11px] text-muted truncate">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                {/* Center: tabs */}
                {tabs ? (
                    <div className="flex-1 flex justify-center">
                        <div className="inline-flex">{tabs}</div>
                    </div>
                ) : (
                    <div className="flex-1"/>
                )}

                {/* Right: controls */}
                {right ? (
                    <div className="flex items-center gap-2 flex-[0_0_auto]">
                        {right}
                    </div>
                ) : null}
            </div>

            {/* Mobile: 3 rows -> title, then right controls, then tabs */}
            <div className="flex flex-col gap-2 md:hidden min-w-0">
                {/* Row 1: title / left */}
                <div className="min-w-0">
                    {left ? (
                        left
                    ) : title ? (
                        <>
                            <h1 className="text-sm font-semibold text-primary truncate">
                                {title}
                            </h1>
                            {description ? (
                                <p className="text-[11px] text-muted line-clamp-2">
                                    {description}
                                </p>
                            ) : null}
                        </>
                    ) : null}
                </div>

                {/* Row 2: right controls (semester dropdown, filters, etc.) */}
                {right ? (
                    <div className="flex justify-start">
                        <div className="inline-flex">{right}</div>
                    </div>
                ) : null}

                {/* Row 3: tabs, centered, full width with padding */}
                {tabs ? (
                    <div className="w-full flex justify-center">
                        <div className="w-full p-2">
                            {tabs}
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
