import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AddMore = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      ref={forwardedRef}
    >
      <g filter="url(#filter0_d_5325_84034)">
        <circle cx="14.05" cy="12.05" r="10.05" fill="url(#paint0_linear_5325_84034)" />
      </g>
      <g filter="url(#filter1_di_5325_84034)">
        <path
          d="M12.8498 16.8501V13.2501H9.2498C8.58706 13.2501 8.0498 12.7129 8.0498 12.0501C8.0498 11.3874 8.58706 10.8501 9.2498 10.8501H12.8498V7.25011C12.8498 6.58737 13.3871 6.05011 14.0498 6.05011C14.7125 6.05011 15.2498 6.58737 15.2498 7.25011V10.8501H18.8498C19.5125 10.8501 20.0498 11.3874 20.0498 12.0501C20.0498 12.7129 19.5125 13.2501 18.8498 13.2501H15.2498V16.8501C15.2498 17.5129 14.7125 18.0501 14.0498 18.0501C13.3871 18.0501 12.8498 17.5129 12.8498 16.8501Z"
          fill="white"
          fillOpacity="0.87"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_5325_84034"
          x="0"
          y="0"
          width="28.1001"
          height="28.1"
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
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.0196078 0 0 0 0 0.658824 0 0 0 0 0.00392157 0 0 0 0.21 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5325_84034" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5325_84034" result="shape" />
        </filter>
        <filter
          id="filter1_di_5325_84034"
          x="4.0498"
          y="6.05011"
          width="20"
          height="20"
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
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.17 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_5325_84034" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_5325_84034" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.1" dy="0.1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_5325_84034" />
        </filter>
        <linearGradient
          id="paint0_linear_5325_84034"
          x1="14.05"
          y1="2"
          x2="14.05"
          y2="22.1"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00CF5D" />
          <stop offset="1" stopColor="#00A63A" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default AddMore
