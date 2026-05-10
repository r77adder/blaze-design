import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const GraduationCap = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
          d="M4.6284 9.30883L9.57344 12.2558C9.83627 12.4124 10.1638 12.4124 10.4267 12.2558L15.8333 9.1663M4.6284 9.30883L1.58679 7.49621C1.31564 7.33462 1.31563 6.94194 1.58679 6.78035L9.57344 2.0208C9.83628 1.86416 10.1638 1.86416 10.4267 2.0208L18.4133 6.78035C18.6845 6.94194 18.6845 7.33462 18.4133 7.49621L15.8333 9.1663M4.6284 9.30883V14.5116C4.6284 14.7967 4.77412 15.062 5.01469 15.2149L9.13804 17.836C9.66699 18.1722 10.3399 18.1832 10.8796 17.8645L15.3729 15.2112C15.6267 15.0613 15.7825 14.7885 15.7825 14.4937L15.8333 9.1663M18.613 7.08297V11.6663"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default GraduationCap
