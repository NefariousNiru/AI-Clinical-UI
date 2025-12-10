// file: src/components/CompanyLogo.tsx

import React from "react";

interface CompanyLogoProps {
    size?: number; // optional size override
    className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ size = 24, className = "" }) => {
    return (
        <img
            src="/favicon.png"
            alt="Company Logo"
            width={size}
            height={size}
            className={`shrink-0 object-contain ${className}`}
        />
    );
};

export default CompanyLogo;
