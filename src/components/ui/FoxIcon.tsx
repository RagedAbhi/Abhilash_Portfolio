interface FoxIconProps {
  className?: string;
}

// A small running fox, side-on — the character that leads the Formation/Proof
// timeline line and makes cameo appearances in later sections. A bold solid
// silhouette (no facial line-work) with two light "socks" and a light
// tail-tip, in the style of a flat trotting-fox icon — reads clearly at a
// glance and at small size, unlike a heavily detailed line drawing. Faces +x
// (rightward) by convention; the line-guide animation rotates the whole
// group to face its actual direction of travel. Split into two named
// sub-groups so the animation can layer a subtle idle "trot" (data-fox-body)
// and tail wag (data-fox-tail) independent of the outer group's own
// scroll-driven position/scale/rotation — two different writers on two
// different elements, never the same property on the same node. Meant to be
// embedded directly inside a parent <svg>, not used as a standalone icon.
export function FoxIcon({ className }: FoxIconProps) {
  return (
    <g className={className}>
      {/* tail — bushy, curving up and back from the hip; swings from its base */}
      <g data-fox-tail>
        <path
          d="M -9 -2 Q -18 -3 -18.6 -10 Q -18.8 -15 -13 -16 Q -15.8 -12.5 -15.3 -8.5 Q -14.5 -3 -8 -1 Z"
          fill="currentColor"
        />
        <path d="M -18.6 -10 Q -18.8 -15 -13 -16 Q -15.6 -12.8 -15.4 -9.3 Z" fill="var(--fox-marking, #f3ede0)" />
      </g>

      <g data-fox-body>
        {/* legs — simple tapered strokes with a light "sock" at each paw */}
        <path d="M 4 3.4 L 3 9.2" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <ellipse cx="3" cy="9.7" rx="1.5" ry="1" fill="var(--fox-marking, #f3ede0)" />
        <path d="M -6 3.4 L -7 9.2" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <ellipse cx="-7" cy="9.7" rx="1.5" ry="1" fill="var(--fox-marking, #f3ede0)" />

        {/* body */}
        <ellipse cx="-2" cy="-1" rx="9" ry="5.5" fill="currentColor" />
        {/* chest / belly patch */}
        <ellipse cx="-1" cy="2" rx="5" ry="2.4" fill="var(--fox-marking, #f3ede0)" />

        {/* head + snout, overlapping the body to read as one connected mass */}
        <circle cx="8" cy="-6" r="4.3" fill="currentColor" />
        <path d="M 10.8 -7.4 Q 15.6 -6 14.3 -4 Q 11.5 -5.3 9.3 -6.8 Z" fill="currentColor" />
        {/* ear */}
        <path d="M 6.2 -9.6 L 5 -15.2 L 9.3 -10.6 Z" fill="currentColor" />
      </g>
    </g>
  );
}
