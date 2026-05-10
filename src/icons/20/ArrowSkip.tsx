import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowSkip = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M17.6272 7.22224L17.6272 13.4849M17.6272 13.4849L11.3646 13.4849M17.6272 13.4849L12.811 8.78709C8.65403 4.73224 1.66656 7.6776 1.66656 13.4847V13.4847"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default ArrowSkip
