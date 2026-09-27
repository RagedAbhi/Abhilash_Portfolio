import { ImageResponse } from "next/og";

// Browser-tab favicon, generated at build time from code (Next's `icon`
// file convention) rather than a static image file — keeps it in sync with
// the site's own colors below instead of a separately hand-made asset, and
// mirrors the "AK" monogram already shown on the loading screen.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0f11", // --bg (dark theme)
          color: "#eaeaea", // --fg (dark theme)
          fontFamily: "sans-serif",
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        AK
      </div>
    ),
    { ...size },
  );
}
