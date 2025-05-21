"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface VisibilityToggleProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export function VisibilityToggle({ isVisible, onToggle, className }: VisibilityToggleProps) {
  const svgColor = isVisible ? "#cd201f" : "currentColor";
  const { theme } = useTheme();

  return (
    <button
      onClick={onToggle}
      className={"cursor-pointer py-2 px-4 rounded-full hover:bg-white/10 dark:hover:bg-white/10 dark:bg-[rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"}
      style={{ backgroundColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" }}
      title="Toggle Binoculars Search"
      aria-label="Toggle Binoculars Search Panel"
    >
      <div className="yt-spec-button-shape-next__icon flex items-center justify-between"> {/* YouTube's icon container class */}
        <svg
          style={{ color: svgColor, marginRight: "8px" }}
          viewBox="0 0 24 24"
          width="22"
          height="22"
          stroke="currentColor"
          fill="currentColor"
        >
          {
            // SVG paths directly translated from the user's SolidJS example
            // Removed 'cls-1' class as it's likely not defined globally in this project
            // Using inline styles for stroke-width where specified, or relying on SVG defaults
          }
          <path
            d="m 9.1533778,20.670759 v 1.231971 l -0.031147,0.113036 -0.5349235,1.98354 H 7.2398415 C 7.1267627,23.73776 6.8403417,23.551972 6.5065226,23.551972 H 2.5772054 c-0.2180321,0 -0.4130422,0.07817 -0.5579455,0.203826 -0.076514,0.07035 -0.1361008,0.150914 -0.1753737,0.244109 H 0.56616398 L 0.0312405,22.015766 9.3058608e-5,21.90273 v -1.231971 z"
            style={{ strokeWidth: "0.0638061" }}
          />
          <polygon
            points="23.32,176.8 10.63,253 123.48,253 110.7,176.8"
            transform="matrix(0.06731363,0,0,0.06012885,0.11118316,2.9549201)"
          />
          <polygon
            points="123.49,134.99 28.07,134.99 24.98,165.18 123.49,165.18"
            transform="matrix(0.06731363,0,0,0.06012885,0,3.6438164)"
          />
          <rect
            x="5.1006513"
            y="3.5325372"
            width="3.171145"
            height="0.99693626"
            style={{ strokeWidth: "0.06362" }}
          />
          <rect
            x="4.9740596"
            width="4.4608736"
            height="1.6962347"
            y="0.68687135"
            style={{ strokeWidth: "0.06362" }}
          />
          <path
            d="m 23.999326,20.709893 v 1.23204 l -0.03096,0.113042 -0.531778,1.983651 H 22.16436 c -0.112413,-0.261561 -0.393784,-0.447359 -0.726314,-0.447359 h -3.909575 c -0.214057,0 -0.410613,0.07817 -0.551299,0.203837 -0.07606,0.07035 -0.1353,0.150923 -0.174342,0.244123 h -1.342234 l -0.531777,-1.983651 -0.03096,-0.113042 v -1.23204 H 24 Z"
            style={{ strokeWidth: "0.06362" }}
          />
          <polygon
            points="233.02,253 345.86,253 333.17,176.8 245.79,176.8"
            transform="matrix(0.06731363,0,0,0.06012885,0.0128839,2.9545978)"
          />
          <polygon
            points="233.03,165.18 331.5,165.18 328.41,134.99 233.03,134.99"
            transform="matrix(0.06731363,0,0,0.06012885,0.11447856,3.6438164)"
          />
          <rect
            x="15.427009"
            y="3.5322838"
            width="3.171145"
            height="0.99693626"
            style={{ strokeWidth: "0.06362" }}
          />
          <rect
            x="14.228337"
            width="4.4608736"
            height="1.6962347"
            y="0.68687135"
            style={{ strokeWidth: "0.06362" }}
          />
          <rect
            x="9.9409208"
            y="11.762672"
            width="4.3457675"
            height="1.8146886"
            style={{ strokeWidth: "0.06362" }}
          />
          <path
            d="m 15.623819,9.7924567 h 6.340943 v -0.010222 c 0,-0.4599857 -0.121165,-0.902534 -0.337914,-1.2999857 C 21.291626,7.8689349 20.723498,7.3662578 19.994493,7.077038 L 18.049802,6.3025784 C 17.866709,6.2298225 17.670153,6.1919413 17.466865,6.1919413 H 15.623146 V 8.4822491 H 13.17293 L 12.940024,6.9964654 H 10.930039 L 10.697134,8.4822491 H 8.2489378 V 6.1919413 H 6.4025254 c -0.1999215,0 -0.399843,0.037881 -0.582936,0.1106371 L 3.8748987,7.077038 C 3.1485847,7.3662578 2.580458,7.8689349 2.2452361,8.4822491 2.0284863,8.8797008 1.9073217,9.3216478 1.9073217,9.7822348 v 0.010222 H 15.622472 Z"
            style={{ strokeWidth: "0.06362" }}
          />
        </svg>
        <p style={{ fontSize: "16px", fontWeight: "bold", fontFamily: "var(--font-roboto)" }}>Binoculars</p>
      </div>
    </button>
  );
} 