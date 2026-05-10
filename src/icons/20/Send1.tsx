import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Send1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M18.0587 2.45304L9.17204 11.3397M3.22591 6.87444L17.0642 2.07342C17.9164 1.77776 18.734 2.59536 18.4383 3.44756L13.6373 17.2858C13.3084 18.2338 11.9771 18.2598 11.6115 17.3254L9.41407 11.7098C9.30432 11.4293 9.08243 11.2074 8.80196 11.0976L3.18636 8.90024C2.25191 8.53458 2.2779 7.20334 3.22591 6.87444Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Send1
