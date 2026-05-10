import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Font01 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      ref={forwardedRef}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.40039 20.471H5.78863M13.6945 20.471H21.6004M5.67568 14.8239H13.4686M9.40274 4.99804L15.9533 20.471M3.5298 20.471L10.3063 2.40039H12.5651L20.471 20.471"
        stroke={color}
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Font01
