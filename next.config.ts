import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Portrait/project cover images get a `?v=<mtime>` cache-busting query string
    // appended server-side (see src/lib/keystatic/content.ts) so a re-uploaded
    // Keystatic image — which reuses the same file path — actually gets a fresh
    // URL instead of serving stale cached bytes. The value is always server-
    // generated from trusted content data, never user input, so allowing any
    // search string here (rather than one fixed value) is safe.
    localPatterns: [
      {
        pathname: "/images/**",
        // search intentionally omitted — allows any query string (the docs note
        // this is only a concern for user-controlled URLs; ours are always
        // server-generated from trusted content data, never user input).
      },
    ],
  },
};

export default nextConfig;
