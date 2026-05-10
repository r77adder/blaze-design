import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Document = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M7.00007 6.5H13.0001M7.00007 9.5H13.0001M7.00007 12.5H10.0001M5.49983 2.5H14.5C15.6046 2.5 16.5 3.39545 16.5 4.50004L16.4998 16.5C16.4998 17.6046 15.6043 18.5 14.4998 18.5L5.49975 18.5C4.39518 18.5 3.49975 17.6045 3.49976 16.4999L3.49983 4.49999C3.49984 3.39542 4.39527 2.5 5.49983 2.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Document
