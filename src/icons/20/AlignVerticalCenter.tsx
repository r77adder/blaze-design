import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AlignVerticalCenter = forwardRef<SVGSVGElement, IconProps>(
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
          d="M9.99974 18L9.99974 2M5.32884 7.81818L7.59557 10M7.59557 10L5.32884 12.1818M7.59557 10H2M14.6712 12.1818L12.4044 10M12.4044 10L14.6712 7.81818M12.4044 10L18 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default AlignVerticalCenter
