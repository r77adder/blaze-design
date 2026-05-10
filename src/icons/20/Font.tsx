import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Font = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M2 17.0588H4.82353M11.4118 17.0588H18M4.72941 12.3529H11.2235M7.83529 4.16471L13.2941 17.0588M2.94118 17.0588L8.58823 2H10.4706L17.0588 17.0588"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Font
