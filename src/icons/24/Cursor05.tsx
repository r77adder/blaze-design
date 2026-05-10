import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Cursor05 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.11917 12.4364L4.84103 13.7145M4.70747 9.02758H2.8999M4.84103 4.34147L6.11917 5.61962M9.52797 2.3999V4.20747M14.2141 4.34147L12.9359 5.61962M16.5175 15.9954L21.1198 14.3888C21.9824 14.0877 22.0158 12.8797 21.1708 12.5443L10.6413 8.87744C9.84974 8.56332 9.05383 9.33978 9.34805 10.139L12.7959 20.9618C13.1099 21.8146 14.3173 21.812 14.6404 20.9576L16.5175 15.9954Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Cursor05
