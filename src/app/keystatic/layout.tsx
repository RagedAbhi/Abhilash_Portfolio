import type { ReactNode } from "react";
import KeystaticApp from "./keystatic";

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
        {children}
      </body>
    </html>
  );
}
