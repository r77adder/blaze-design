import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Edit3 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M11.5 16.293H16.5M3.50003 16.293L7.13835 15.5599C7.33149 15.521 7.50884 15.4259 7.64812 15.2865L15.7929 7.13731C16.1834 6.7466 16.1831 6.11328 15.7923 5.72289L14.0669 3.9995C13.6762 3.60927 13.0432 3.60954 12.6529 4.00009L4.50733 12.1501C4.36832 12.2892 4.2734 12.4662 4.23445 12.659L3.50003 16.293Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Edit3
