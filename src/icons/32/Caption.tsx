import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Caption = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 32 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <mask
        id="mask0_7761_471689"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="32"
        height="32"
      >
        <rect width="32" height="32" fill="url(#paint0_linear_7761_471689)" />
      </mask>
      <g mask="url(#mask0_7761_471689)">
        <g filter="url(#filter0_d_7761_471689)">
          <rect
            x="3.2002"
            y="0.799805"
            width="24.8"
            height="28"
            rx="1.28823"
            fill="white"
            shapeRendering="crispEdges"
          />
          <path
            d="M4.80029 25.5998C4.80029 25.158 5.15847 24.7998 5.60029 24.7998H18.4003C18.8421 24.7998 19.2003 25.158 19.2003 25.5998C19.2003 26.0416 18.8421 26.3998 18.4003 26.3998H5.60029C5.15847 26.3998 4.80029 26.0416 4.80029 25.5998Z"
            fill="#58AFFE"
          />
          <path
            d="M4.80029 22.3996C4.80029 21.9578 5.15847 21.5996 5.60029 21.5996H25.6003C26.0421 21.5996 26.4003 21.9578 26.4003 22.3996C26.4003 22.8414 26.0421 23.1996 25.6003 23.1996H5.6003C5.15847 23.1996 4.80029 22.8414 4.80029 22.3996Z"
            fill="#58AFFE"
          />
          <path
            d="M4.80029 19.1999C4.80029 18.7581 5.15847 18.3999 5.60029 18.3999H25.6003C26.0421 18.3999 26.4003 18.7581 26.4003 19.1999C26.4003 19.6417 26.0421 19.9999 25.6003 19.9999H5.6003C5.15847 19.9999 4.80029 19.6417 4.80029 19.1999Z"
            fill="#58AFFE"
          />
          <rect x="4.80029" y="-1.6001" width="21.6" height="17.6" rx="1" fill="url(#paint1_linear_7761_471689)" />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_7761_471689"
          x="-2.2998"
          y="-7.1001"
          width="35.7998"
          height="41.3999"
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
          <feOffset />
          <feGaussianBlur stdDeviation="2.75" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471689" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7761_471689" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_7761_471689"
          x1="21.6216"
          y1="16"
          x2="21.6216"
          y2="5.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="1" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_7761_471689"
          x1="16.1403"
          y1="5.0399"
          x2="19.4858"
          y2="16.9841"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#007AE8" />
          <stop offset="1" stopColor="#58AFFE" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Caption
