import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Check02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 16"
      fill="none"
      ref={forwardedRef}
    >
      <path
        d="M1 8.82353C2.58559 9.92157 5.75676 12.9412 7.05405 15C8.63964 11.7059 12.6757 4.29412 17 1"
        stroke={color}
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Check02
