import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Shadow = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g filter="url(#filter0_f_4_126)">
        <path
          d="M17.6875 13.4999C17.6875 14.3979 17.0859 15.334 15.851 16.0852C14.6295 16.8283 12.8942 17.3123 10.9375 17.3123C8.98082 17.3123 7.24548 16.8283 6.02398 16.0852C4.78912 15.334 4.1875 14.3979 4.1875 13.4999C4.1875 12.6019 4.78912 11.6657 6.02398 10.9145C7.24548 10.1715 8.98082 9.6875 10.9375 9.6875C12.8942 9.6875 14.6295 10.1715 15.851 10.9145C17.0859 11.6657 17.6875 12.6019 17.6875 13.4999Z"
          stroke="black"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
      </g>
      <rect x="1.5" y="2.68737" width="14.625" height="14.625" rx="7.3125" stroke={color} strokeWidth="1.5" />
      <defs>
        <filter
          id="filter0_f_4_126"
          x="1.9375"
          y="7.4375"
          width="18"
          height="12.1248"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.75" result="effect1_foregroundBlur_4_126" />
        </filter>
      </defs>
    </svg>
  )
})

export default Shadow
