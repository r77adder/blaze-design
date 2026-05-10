import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HighDetailedImproveQuality = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="16.75" fill="url(#paint0_linear_2517_628)" />
        <g filter="url(#filter0_di_2517_628)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M29.453 10.0211C29.4443 9.53393 28.9529 9.20449 28.499 9.38143L21.1834 12.2327C20.6564 12.4381 20.578 13.1514 21.0478 13.4663L23.5171 15.1219L18.7228 21.8489L16.4487 20.1839C15.7871 19.6996 14.8592 19.8362 14.3653 20.4906L9.3653 27.1156C8.86625 27.7769 8.99773 28.7175 9.65897 29.2165C10.3202 29.7156 11.2608 29.5841 11.7599 28.9228L15.8693 23.4778L18.1765 25.167C18.5001 25.404 18.9053 25.5014 19.3013 25.4376C19.6973 25.3738 20.0513 25.154 20.2841 24.8273L26.01 16.7932L28.504 18.4653C28.9738 18.7803 29.6039 18.4369 29.5937 17.8714L29.453 10.0211Z"
            fill="white"
            fillOpacity="0.93"
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_di_2517_628"
            x="5.0625"
            y="9.33301"
            width="28.5312"
            height="28.1865"
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
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2517_628" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2517_628" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2517_628" />
          </filter>
          <linearGradient
            id="paint0_linear_2517_628"
            x1="20"
            y1="3.25"
            x2="20"
            y2="36.75"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00DC18" />
            <stop offset="1" stopColor="#00870E" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default HighDetailedImproveQuality
