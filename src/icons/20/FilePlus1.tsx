import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FilePlus1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <g id="icon">
        <path
          id="Vector"
          d="M7.49994 18.3808H3.99993C2.89536 18.3808 1.99993 17.4854 1.99994 16.3808L2.00002 4.38085C2.00002 3.27628 2.89545 2.38086 4.00002 2.38086H15.9999C17.1045 2.38086 17.9999 3.27629 17.9999 4.38086C17.9999 4.38086 17.9999 4.38086 17.9999 4.38086C17.9999 4.38086 17.9999 5.73295 17.9999 7.88084M14 18.3808L14 14.3808M14 14.3808L14 10.3808M14 14.3808L9.99998 14.3808M14 14.3808L18 14.3808"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
})

export default FilePlus1
