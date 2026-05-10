import { forwardRef } from 'react'
import { IconProps } from '../Types'

// Faithful port of prod's
//   apps/blaze/src/almanac-ui/icons/12/ChevronRight.tsx
// This is the chevron prod's SectionHeader uses (filled, not stroked). Our
// existing 12/ChevronRightSmall is a different visual (stroked outline) — we
// add this one rather than alter ChevronRightSmall to keep both available.
export const ChevronRight = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 12 }, forwardedRef) => {
    return (
      <svg
        data-testid={'chevron-right-icon'}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          fill={color}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.54036 9.45964C4.28652 9.2058 4.28652 8.79425 4.54036 8.54041L7.08074 6.00002L4.54036 3.45964C4.28652 3.2058 4.28652 2.79425 4.54036 2.5404C4.7942 2.28656 5.20575 2.28656 5.4596 2.5404L8.45959 5.54041C8.71344 5.79425 8.71344 6.2058 8.45959 6.45964L5.45959 9.45964C5.20575 9.71348 4.7942 9.71348 4.54036 9.45964Z"
        />
      </svg>
    )
  },
)

export default ChevronRight
