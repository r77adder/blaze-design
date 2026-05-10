import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Viewed = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0.833252"
        y="0.833496"
        width="18.3333"
        height="18.3333"
        rx="9.16667"
        fill="url(#paint0_linear_2713_31765)"
      />
      <rect x="1.33325" y="1.3335" width="17.3333" height="17.3333" rx="8.66667" stroke="black" strokeOpacity="0.08" />
      <g filter="url(#filter0_di_2713_31765)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.45266 8.98359C6.2111 7.96272 7.59946 6.75 10 6.75C12.4178 6.75 13.8093 7.98041 14.5641 9.00622C15.0304 9.63988 15.0224 10.4815 14.5447 11.1043C13.7789 12.1028 12.3858 13.2854 10.0115 13.2492C7.65683 13.2132 6.26152 12.0688 5.48804 11.1032C4.9902 10.4817 4.97551 9.62584 5.45266 8.98359ZM10 5.25C6.9972 5.25 5.20405 6.80298 4.24859 8.08904C3.36705 9.2756 3.3908 10.8843 4.31733 12.0409C5.29386 13.26 7.07708 14.7046 9.98857 14.749C12.9667 14.7945 14.7694 13.2761 15.7349 12.0172C16.62 10.8632 16.6331 9.28719 15.7723 8.11724C14.8223 6.82613 13.0253 5.25 10 5.25ZM10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89545 8 8.00002 8.89543 8.00002 10C8.00002 11.1046 8.89545 12 10 12Z"
          fill="white"
          fillOpacity="0.8"
          shapeRendering="crispEdges"
        />
      </g>
      <defs>
        <filter
          id="filter0_di_2713_31765"
          x="1.60449"
          y="4.25"
          width="16.804"
          height="13.5"
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
          <feGaussianBlur stdDeviation="1" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2713_31765" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2713_31765" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.1" dy="0.1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2713_31765" />
        </filter>
        <linearGradient
          id="paint0_linear_2713_31765"
          x1="9.99992"
          y1="0.833496"
          x2="9.99992"
          y2="19.1668"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00589B" stopOpacity="0.7" />
          <stop offset="1" stopColor="#00589B" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
})

export default Viewed
