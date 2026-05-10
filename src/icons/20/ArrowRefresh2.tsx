import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowRefresh2 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20, strokeWidth = 1.5 }, forwardedRef) => {
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
          d="M16.1851 6.67824C15.0268 4.67865 12.8619 3.33333 10.3823 3.33333C7.57094 3.33333 5.16405 5.06279 4.17028 7.51447M14.1505 7.51447H17.5V4.16956M4.64823 13.3681C5.80651 15.3676 7.97144 16.713 10.451 16.713C13.2624 16.713 15.6693 14.9835 16.6631 12.5318M6.68283 12.5318H3.33333V15.8767"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ArrowRefresh2
