import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HighDetailedSnippet = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg width={size} height={size} viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_2860_429)">
          <rect
            x="8"
            y="7.85693"
            width="14.1429"
            height="12.8571"
            rx="1.40493"
            fill="white"
            shapeRendering="crispEdges"
          />
          <rect x="9.29224" y="12.9736" width="11.2595" height="1.15521" rx="0.577605" fill="#58AFFE" />
          <rect x="9.29224" y="15.4458" width="11.2595" height="1.15521" rx="0.577605" fill="#58AFFE" />
          <rect x="9.29224" y="17.918" width="7.96857" height="1.15521" rx="0.577605" fill="#58AFFE" />
          <rect x="9.29224" y="10.5015" width="7.96857" height="1.15521" rx="0.577605" fill="#58AFFE" />
        </g>
        <g filter="url(#filter1_bdi_2860_429)">
          <rect
            x="11.8572"
            y="4"
            width="14.1429"
            height="12.8571"
            rx="1.40493"
            fill="white"
            fillOpacity="0.67"
            shapeRendering="crispEdges"
          />
          <rect x="13.4482" y="8.63672" width="11.2595" height="1.15521" rx="0.577605" fill="#58AFFE" />
          <rect x="13.4482" y="11.1084" width="11.2595" height="1.15521" rx="0.577605" fill="#58AFFE" />
          <rect x="13.4482" y="13.5806" width="7.96857" height="1.15521" rx="0.577605" fill="#58AFFE" />
          <rect x="13.4482" y="6.16455" width="7.96857" height="1.15521" rx="0.577605" fill="#58AFFE" />
        </g>
        <defs>
          <filter
            id="filter0_d_2860_429"
            x="0.915714"
            y="0.772648"
            width="28.3114"
            height="27.0255"
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
            <feGaussianBlur stdDeviation="3.54214" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.19 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2860_429" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2860_429" result="shape" />
          </filter>
          <filter
            id="filter1_bdi_2860_429"
            x="6.23747"
            y="-1.61971"
            width="25.3822"
            height="24.0963"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.80985" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2860_429" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="1.95987" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.13 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_2860_429" result="effect2_dropShadow_2860_429" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_2860_429" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.280985" dy="0.280985" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect3_innerShadow_2860_429" />
          </filter>
        </defs>
      </svg>
    )
  },
)

export default HighDetailedSnippet
