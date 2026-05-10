import { forwardRef } from 'react'
import { IconProps } from '../Types'

// Star icon for the credits badge in the H2 topbar. Path matches Ivan's
// `Blaze H2 Features/index.html` `.credits svg` exactly (viewBox 0 0 24 24
// with a 5-point star). Default size 14 matches the spec in
// prototypes/h2-index/GAPS.md ("Star (size 14, for credits badge)").
const Star = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 14, ...rest }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...rest}
    >
      <path d="m12 2 1.6 4.6L18 8.2l-3.4 2.5L16 15l-4-2.7L8 15l1.4-4.3L6 8.2l4.4-1.6z" />
    </svg>
  ),
)
Star.displayName = 'Star'
export default Star
