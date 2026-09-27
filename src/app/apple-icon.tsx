import { ImageResponse } from "next/og";

// Home-screen icon for iOS ("Add to Home Screen") — same mark as icon.tsx,
// just at Apple's recommended larger size.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0f11",
          color: "#eaeaea",
          fontFamily: "sans-serif",
          fontSize: 92,
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
