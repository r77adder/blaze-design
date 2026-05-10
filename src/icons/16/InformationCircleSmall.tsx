import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const InformationCircleSmall = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 16 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <rect
          x="0.958984"
          y="0.625"
          width="12.75"
          height="12.75"
          rx="6.375"
          stroke="black"
          strokeOpacity="0.4"
          strokeWidth="1.25"
        />
        <path
          d="M6.69232 4.74012V3.44012H8.12232V4.74012H6.69232ZM8.11232 5.36012V10.6201H6.71232V5.36012H8.11232Z"
          fill={color}
        />
      </svg>
    )
  },
)

export default InformationCircleSmall
