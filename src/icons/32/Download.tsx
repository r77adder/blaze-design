import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Download = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 32 }, forwardedRef) => {
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
      <g filter="url(#filter0_d_2888_245)">
        <rect x="4.09375" y="6.375" width="23.8125" height="20.5312" rx="3" fill="url(#paint0_linear_2888_245)" />
        <rect x="4.59375" y="6.875" width="22.8125" height="19.5312" rx="2.5" stroke="white" />
      </g>
      <g filter="url(#filter1_d_2888_245)">
        <path
          d="M4.09375 18.0938H8.125C9.18642 18.0938 10.0469 18.9542 10.0469 20.0156V20.0156C10.0469 21.077 10.9073 21.9375 11.9688 21.9375H19.7969C20.8583 21.9375 21.7188 21.077 21.7188 20.0156V20.0156C21.7188 18.9542 22.5792 18.0938 23.6406 18.0938H27.9062V23.9062C27.9062 25.5631 26.5631 26.9062 24.9063 26.9062H7.09375C5.4369 26.9062 4.09375 25.5631 4.09375 23.9063V18.0938Z"
          fill="white"
        />
      </g>
      <g filter="url(#filter2_dd_2888_245)">
        <path
          d="M8.2449 11.3866L15.8378 19.418L23.4967 11.3866L19.3352 11.4098C18.8629 5.91607 18.8168 1.29073 22.1318 2.77358C20.5235 -0.349766 17.7154 0.0851235 16.3857 0.811433C12.5259 2.91976 11.9453 8.8125 12.0625 11.3653L8.2449 11.3866Z"
          fill="url(#paint1_linear_2888_245)"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_2888_245"
          x="0.09375"
          y="3.375"
          width="31.8125"
          height="28.5312"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2888_245" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2888_245" result="shape" />
        </filter>
        <filter
          id="filter1_d_2888_245"
          x="1.09375"
          y="13.0938"
          width="29.8125"
          height="14.8125"
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
          <feOffset dy="-2" />
          <feGaussianBlur stdDeviation="1.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2888_245" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2888_245" result="shape" />
        </filter>
        <filter
          id="filter2_dd_2888_245"
          x="6.24487"
          y="0.288574"
          width="19.2517"
          height="23.1294"
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
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2888_245" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_2888_245" result="effect2_dropShadow_2888_245" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_2888_245" result="shape" />
        </filter>
        <linearGradient
          id="paint0_linear_2888_245"
          x1="16"
          y1="6.375"
          x2="16"
          y2="26.9062"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1F6F7" />
          <stop offset="1" stopColor="#D1E3E7" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2888_245"
          x1="12.572"
          y1="0.889322"
          x2="15.5278"
          y2="18.8435"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0057BE" />
          <stop offset="1" stopColor="#3CBB00" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Download
