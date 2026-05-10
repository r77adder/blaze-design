import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ContentPlan = forwardRef<SVGSVGElement, IconProps>(({ size = 36 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g filter="url(#filter0_d_2540_18219)">
        <rect x="4.60938" y="3.60938" width="27.7812" height="27.7812" rx="3" fill="white" />
      </g>
      <path
        d="M5.375 6.375C5.375 5.27043 6.27043 4.375 7.375 4.375H29.625C30.7296 4.375 31.625 5.27043 31.625 6.375V10.5H5.375V6.375Z"
        fill="#EC1E28"
      />
      <rect x="5.89453" y="12.2039" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="5.89453" y="18.7117" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="5.89453" y="25.1101" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="12.5996" y="12.2039" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="12.5996" y="25.1101" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="19.3049" y="12.2039" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="19.3049" y="18.7117" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="19.3049" y="25.1101" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="26.0095" y="12.2039" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="26.0095" y="18.7117" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <rect x="26.0095" y="25.1101" width="4.98656" height="4.98656" rx="1" fill="black" fillOpacity="0.04" />
      <path
        d="M20.3047 21.1278C20.3047 24.0061 17.9714 26.3394 15.0931 26.3394C12.2149 26.3394 9.88159 24.0061 9.88159 21.1278C9.88159 18.2495 12.2149 15.9163 15.0931 15.9163C17.9714 15.9163 20.3047 18.2495 20.3047 21.1278Z"
        fill="#EC1E28"
      />
      <path
        d="M12.8672 21.4648L14.8086 23.3789L17.707 19.0859"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <filter
          id="filter0_d_2540_18219"
          x="0.609375"
          y="0.609375"
          width="35.7812"
          height="35.7812"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2540_18219" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2540_18219" result="shape" />
        </filter>
      </defs>
    </svg>
  )
})

export default ContentPlan
