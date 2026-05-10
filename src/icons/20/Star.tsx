import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Star = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M12.9961 6.43867L11.1209 2.63907C10.6624 1.71001 9.3376 1.71001 8.87908 2.63907L7.00386 6.43867L2.81075 7.04797C1.78548 7.19695 1.37609 8.45691 2.11798 9.18008L5.15215 12.1377L4.43588 16.3138C4.26074 17.335 5.33253 18.1137 6.24957 17.6316L10 15.6598L13.7504 17.6316C14.6675 18.1137 15.7393 17.335 15.5641 16.3138L14.8479 12.1377L17.882 9.18008C18.6239 8.45692 18.2145 7.19695 17.1892 7.04797L12.9961 6.43867Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </svg>
  )
})

export default Star
