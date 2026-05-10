import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ImageArrows = forwardRef<SVGSVGElement, IconProps>(
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
          d="M13 17.5L8.5 12.5L3.5 16.5M8.5 2.5H5.3125C3.7592 2.5 2.5 3.7592 2.5 5.3125V14.6875C2.5 16.2408 3.7592 17.5 5.3125 17.5H14.6875C16.2408 17.5 17.5 16.2408 17.5 14.6875V13"
          stroke={color}
          strokeOpacity="0.8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.4426 7L11 9.55653M11 9.55653L13.3322 12M11 9.55653L17.5 9.55653"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.5574 1L18 3.55653M18 3.55653L15.6678 6M18 3.55653L11.5 3.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.74988 7.25C8.74988 8.2165 7.96638 9 6.99988 9C6.03338 9 5.24988 8.2165 5.24988 7.25C5.24988 6.2835 6.03338 5.5 6.99988 5.5C7.96638 5.5 8.74988 6.2835 8.74988 7.25Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default ImageArrows
