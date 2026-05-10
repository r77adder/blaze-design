import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Shadow2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
      <g clipPath="url(#clip0_3755_25323)">
        <g opacity="0.5" filter="url(#filter0_f_3755_25323)">
          <path
            d="M6.08972 17.4735C7.16167 18.3923 9.89804 19.005 11.4192 19.005C15.0948 19.005 17.637 16.2482 18.2802 13.0627C18.9168 9.91023 17.0948 5.99514 15.0948 4.97656C17.9675 11.5935 13.5633 17.4735 8.8463 17.4735H6.08972Z"
            fill={color}
          />
        </g>
        <rect x="1.5" y="2.6875" width="14.625" height="14.625" rx="7.3125" stroke={color} strokeWidth="1.5" />
      </g>
      <defs>
        <filter
          id="filter0_f_3755_25323"
          x="5.08972"
          y="3.97656"
          width="14.3196"
          height="16.0293"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.5" result="effect1_foregroundBlur_3755_25323" />
        </filter>
        <clipPath id="clip0_3755_25323">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
})

export default Shadow2
