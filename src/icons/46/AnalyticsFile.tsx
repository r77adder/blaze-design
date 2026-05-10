import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AnalyticsFile = forwardRef<SVGSVGElement, IconProps>(({ size = 46 }, forwardedRef) => {
  return (
    <svg width={size} height={size + 1} viewBox="0 0 46 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_bd_2921_41831)">
        <mask id="path-2-inside-1_2921_41831" fill="white">
          <path d="M5.75 6.41626H40.25V40.9163H5.75V6.41626Z" />
        </mask>
        <path d="M5.75 6.41626H40.25V40.9163H5.75V6.41626Z" fill="white" shapeRendering="crispEdges" />
        <path
          d="M5.75 6.41626V4.91626C4.92157 4.91626 4.25 5.58783 4.25 6.41626H5.75ZM40.25 6.41626H41.75C41.75 5.58783 41.0784 4.91626 40.25 4.91626V6.41626ZM40.25 40.9163V42.4163C41.0784 42.4163 41.75 41.7447 41.75 40.9163H40.25ZM5.75 40.9163H4.25C4.25 41.7447 4.92157 42.4163 5.75 42.4163V40.9163ZM5.75 7.91626H40.25V4.91626H5.75V7.91626ZM38.75 6.41626V40.9163H41.75V6.41626H38.75ZM40.25 39.4163H5.75V42.4163H40.25V39.4163ZM7.25 40.9163V6.41626H4.25V40.9163H7.25Z"
          fill="white"
          mask="url(#path-2-inside-1_2921_41831)"
        />
        <path d="M38.3824 8.28394V39.0487H7.61768L38.3824 8.28394Z" fill="url(#paint0_linear_2921_41831)" />
        <path d="M7.61758 39.0486V8.28384H38.3823L7.61758 39.0486Z" fill="url(#paint1_linear_2921_41831)" />
      </g>
      <defs>
        <filter
          id="filter0_bd_2921_41831"
          x="0.557693"
          y="1.22395"
          width="44.8846"
          height="44.8846"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.59615" />
          <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2921_41831" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
          <feBlend mode="normal" in2="effect1_backgroundBlur_2921_41831" result="effect2_dropShadow_2921_41831" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_2921_41831" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2921_41831"
          x1="23.7692"
          y1="19.8906"
          x2="30.6912"
          y2="40.0276"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF6D00" />
          <stop offset="1" stopColor="#F8EF6F" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2921_41831"
          x1="7.61758"
          y1="16.7441"
          x2="24.4683"
          y2="22.1979"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#47FF65" />
          <stop offset="1" stopColor="#2C99FF" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default AnalyticsFile
