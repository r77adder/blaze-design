import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Rejected = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.16666" y="2.16669" width="15.6667" height="15.6667" rx="3.5" fill="#EC1E28" stroke="#BC010B" />
      <g filter="url(#filter0_di_2796_28918)">
        <path
          d="M8.10246 5.83335L5 8.93581M5 8.93581L8.10246 12.0383M5 8.93581L12.3845 8.93581C13.7829 8.93581 14.9166 10.0695 14.9166 11.4679V11.4679C14.9166 12.8664 13.7829 14.0001 12.3845 14.0001L12.0833 14.0001"
          stroke="white"
          strokeOpacity="0.87"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_2796_28918"
          x="1.25"
          y="4.08337"
          width="17.4166"
          height="15.6667"
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
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2796_28918" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2796_28918" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.1" dy="0.1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2796_28918" />
        </filter>
      </defs>
    </svg>
  )
})

export default Rejected
