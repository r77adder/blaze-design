import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Target5 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
      <g clipPath="url(#clip0_4448_43163)">
        <path
          d="M9.99984 18.3332C14.6022 18.3332 18.3332 14.6022 18.3332 9.99984C18.3332 5.39746 14.6022 1.6665 9.99984 1.6665C5.39746 1.6665 1.6665 5.39746 1.6665 9.99984C1.6665 14.6022 5.39746 18.3332 9.99984 18.3332Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5C7.23858 5 5 7.23858 5 10C5 12.7614 7.23858 15 10 15Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.0002 11.6668C10.9206 11.6668 11.6668 10.9206 11.6668 10.0002C11.6668 9.07969 10.9206 8.3335 10.0002 8.3335C9.07969 8.3335 8.3335 9.07969 8.3335 10.0002C8.3335 10.9206 9.07969 11.6668 10.0002 11.6668Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_4448_43163">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export default Target5
