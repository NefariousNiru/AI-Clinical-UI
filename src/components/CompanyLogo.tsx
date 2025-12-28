// file: src/components/CompanyLogo.tsx

import type { ImgHTMLAttributes } from "react";

type CompanyLogoProps = Omit<
	ImgHTMLAttributes<HTMLImageElement>,
	"width" | "height" | "src" | "alt" | "loading"
> & {
	/**
	 * Pixel size for both width and height.
	 * Using explicit dimensions prevents layout shift in the header.
	 */
	size?: number;

	/** Path under /public (Vite) by default. */
	src?: string;

	/**
	 * Use a meaningful alt if the logo communicates brand identity.
	 * If the logo is purely decorative because the title text already exists,
	 * consider alt="" and aria-hidden.
	 */
	alt?: string;

	/**
	 * Header logos should load ASAP. If you render this elsewhere,
	 * you can override loading="lazy" at call sites.
	 */
	loading?: "eager" | "lazy";
};

export default function CompanyLogo({
	size = 24,
	src = "/favicon.png",
	alt = "Company logo",
	className,
	loading = "eager",
	...imgProps
}: CompanyLogoProps) {
	const classes = ["shrink-0 object-contain", className].filter(Boolean).join(" ");

	return (
		<img
			src={src}
			alt={alt}
			width={size}
			height={size}
			className={classes}
			loading={loading}
			decoding="async"
			{...imgProps}
		/>
	);
}
