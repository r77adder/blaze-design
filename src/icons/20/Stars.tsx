import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Stars = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M12.3529 2L13.8782 6.12184L18 7.64706L13.8782 9.17228L12.3529 13.2941L10.8277 9.17228L6.70588 7.64706L10.8277 6.12184L12.3529 2Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5.29412 11.4118L6.62647 13.3735L8.58823 14.7059L6.62647 16.0382L5.29412 18L3.96176 16.0382L2 14.7059L3.96176 13.3735L5.29412 11.4118Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Stars
