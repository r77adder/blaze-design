import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowUp = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M4.1665 8.88856L9.99984 3.33301M9.99984 3.33301L15.8332 8.88856M9.99984 3.33301V16.6663"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default ArrowUp
