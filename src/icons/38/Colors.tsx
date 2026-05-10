import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Colors = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 38 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <g filter="url(#filter0_di_3420_62442)">
        <path
          d="M15.6812 24.7101C15.6812 19.1656 20.1759 14.6709 25.7203 14.6709V14.6709C31.2648 14.6709 35.7595 19.1656 35.7595 24.7101V24.7101C35.7595 30.2546 31.2648 34.7493 25.7203 34.7493V34.7493C20.1759 34.7493 15.6812 30.2546 15.6812 24.7101V24.7101Z"
          fill="url(#paint0_linear_3420_62442)"
        />
      </g>
      <g filter="url(#filter1_di_3420_62442)">
        <path
          d="M2.24023 24.7101C2.24023 19.1656 6.73494 14.6709 12.2794 14.6709V14.6709C17.8239 14.6709 22.3186 19.1656 22.3186 24.7101V24.7101C22.3186 30.2546 17.8239 34.7493 12.2794 34.7493V34.7493C6.73494 34.7493 2.24023 30.2546 2.24023 24.7101V24.7101Z"
          fill="url(#paint1_linear_3420_62442)"
        />
      </g>
      <g filter="url(#filter2_di_3420_62442)">
        <path
          d="M8.96045 12.2899C8.96045 6.74543 13.4551 2.25073 18.9996 2.25073V2.25073C24.5441 2.25073 29.0388 6.74543 29.0388 12.2899V12.2899C29.0388 17.8344 24.5441 22.3291 18.9996 22.3291V22.3291C13.4551 22.3291 8.96045 17.8344 8.96045 12.2899V12.2899Z"
          fill="url(#paint2_linear_3420_62442)"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_3420_62442"
          x="13.5375"
          y="13.5991"
          width="24.3658"
          height="24.3656"
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
          <feOffset dy="1.0718" />
          <feGaussianBlur stdDeviation="1.0718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3420_62442" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3420_62442" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.21436" dy="0.21436" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_3420_62442" />
        </filter>
        <filter
          id="filter1_di_3420_62442"
          x="0.0966301"
          y="13.5991"
          width="24.3658"
          height="24.3656"
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
          <feOffset dy="1.0718" />
          <feGaussianBlur stdDeviation="1.0718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3420_62442" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3420_62442" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.21436" dy="0.21436" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_3420_62442" />
        </filter>
        <filter
          id="filter2_di_3420_62442"
          x="6.81684"
          y="1.17893"
          width="24.3658"
          height="24.3656"
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
          <feOffset dy="1.0718" />
          <feGaussianBlur stdDeviation="1.0718" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.14 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3420_62442" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3420_62442" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.21436" dy="0.21436" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_3420_62442" />
        </filter>
        <linearGradient
          id="paint0_linear_3420_62442"
          x1="23.2105"
          y1="12.8301"
          x2="23.2105"
          y2="27.4101"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#83FFF3" />
          <stop offset="1" stopColor="#00AEFF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_3420_62442"
          x1="9.76963"
          y1="16.3401"
          x2="9.76963"
          y2="31.7301"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFB183" />
          <stop offset="1" stopColor="#F60000" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_3420_62442"
          x1="16.4898"
          y1="3.10995"
          x2="16.4898"
          y2="20.39"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F9E000" />
          <stop offset="1" stopColor="#F69800" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Colors
