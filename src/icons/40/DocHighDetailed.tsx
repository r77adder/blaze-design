import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const DocHighDetailed = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 41 49" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_2707_235)">
          <rect x="7" y="7" width="27.0529" height="34.7823" rx="1.28823" fill="white" shapeRendering="crispEdges" />
          <rect x="9.57666" y="28.8965" width="21.8999" height="1.76543" rx="0.882714" fill="#58AFFE" />
          <rect x="9.57666" y="32.6743" width="21.8999" height="1.76543" rx="0.882714" fill="#58AFFE" />
          <rect x="9.57666" y="36.4521" width="15.499" height="1.76543" rx="0.882714" fill="#58AFFE" />
          <rect x="9.57666" y="25.1187" width="15.499" height="1.76543" rx="0.882714" fill="#58AFFE" />
          <g clipPath="url(#clip0_2707_235)">
            <path d="M31.7264 9.28857V22.2567H9.3269L31.7264 9.28857Z" fill="url(#paint0_linear_2707_235)" />
            <path d="M9.32682 22.2568V9.2887H31.7263L9.32682 22.2568Z" fill="url(#paint1_linear_2707_235)" />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_d_2707_235"
            x="0.504145"
            y="0.504145"
            width="40.0447"
            height="47.7739"
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
            <feGaussianBlur stdDeviation="3.24793" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2707_235" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2707_235" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_2707_235"
            x1="21.0866"
            y1="14.1811"
            x2="22.9036"
            y2="23.3107"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF6D00" />
            <stop offset="1" stopColor="#F8EF6F" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_2707_235"
            x1="9.32682"
            y1="12.8549"
            x2="19.6535"
            y2="18.6279"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#47FF65" />
            <stop offset="1" stopColor="#2C99FF" />
          </linearGradient>
          <clipPath id="clip0_2707_235">
            <rect x="9.3269" y="9.28857" width="22.3995" height="12.9681" rx="1.17892" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  },
)

export default DocHighDetailed
