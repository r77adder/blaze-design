import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Star2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M7.57495 0.575195L9.46559 5.68456L14.575 7.5752L9.46559 9.46583L7.57495 14.5752L5.68432 9.46583L0.574951 7.5752L5.68432 5.68456L7.57495 0.575195Z"
        stroke={color}
        strokeOpacity="0.9"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Star2
