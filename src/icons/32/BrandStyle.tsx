import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const BrandStyle = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 32 }, forwardedRef) => {
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
        <g filter="url(#filter0_dd_7761_471682)">
          <path
            d="M7.9095 19.195L13.0567 5.65569C13.3787 4.80868 14.2299 4.284 15.1313 4.37695L21.3948 5.02286C22.2308 5.10907 22.9237 5.70868 23.129 6.5236L24.8422 13.322C24.9636 13.8038 24.9013 14.3135 24.6675 14.7519L19.2153 24.9741C18.6941 25.9511 17.4783 26.3188 16.5031 25.7941L8.83143 21.667C7.94713 21.1913 7.55267 20.1336 7.9095 19.195Z"
            fill="url(#paint0_linear_7761_471682)"
          />
        </g>
        <g filter="url(#filter1_di_7761_471682)">
          <path
            d="M2.0263 13.0718L12.191 2.82356C12.5665 2.44495 13.0777 2.23199 13.611 2.23198L21.9135 2.23184C23.0181 2.23182 23.9135 3.12725 23.9135 4.23184L23.9135 12.5441C23.9135 13.0717 23.705 13.5779 23.3335 13.9525L13.1735 24.1959C12.3935 24.9824 11.1227 24.985 10.3394 24.2017L2.03207 15.8944C1.25327 15.1156 1.25069 13.8537 2.0263 13.0718Z"
            fill="url(#paint1_linear_7761_471682)"
          />
        </g>
        <g filter="url(#filter2_d_7761_471682)">
          <path
            d="M12.9288 8.85326C12.8094 8.53081 12.3534 8.53081 12.2341 8.85326L11.4329 11.0185C11.1327 11.8295 10.4933 12.4689 9.68229 12.7691L7.51706 13.5703C7.19461 13.6896 7.19461 14.1456 7.51706 14.265L9.68229 15.0662C10.4933 15.3663 11.1327 16.0057 11.4329 16.8167L12.2341 18.982C12.3534 19.3044 12.8094 19.3044 12.9288 18.982L13.73 16.8167C14.0301 16.0057 14.6695 15.3663 15.4805 15.0662L17.6458 14.265C17.9682 14.1456 17.9682 13.6896 17.6458 13.5703L15.4805 12.7691C14.6695 12.4689 14.0301 11.8295 13.73 11.0185L12.9288 8.85326Z"
            fill="url(#paint2_linear_7761_471682)"
            fillOpacity="0.91"
            shapeRendering="crispEdges"
          />
        </g>
        <g filter="url(#filter3_di_7761_471682)">
          <path
            d="M20.5629 7.36008C20.5629 8.39411 19.7247 9.23236 18.6906 9.23236C17.6566 9.23236 16.8184 8.39411 16.8184 7.36008C16.8184 6.32604 17.6566 5.48779 18.6906 5.48779C19.7247 5.48779 20.5629 6.32604 20.5629 7.36008Z"
            fill="#5E178A"
          />
        </g>
        <defs>
          <filter
            id="filter0_dd_7761_471682"
            x="3.29553"
            y="1.07847"
            width="26.0906"
            height="30.6336"
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
            <feOffset dy="1.19554" />
            <feGaussianBlur stdDeviation="2.24164" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471682" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="0.597771" />
            <feGaussianBlur stdDeviation="0.597771" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="effect1_dropShadow_7761_471682" result="effect2_dropShadow_7761_471682" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7761_471682" result="shape" />
          </filter>
          <filter
            id="filter1_di_7761_471682"
            x="1.44629"
            y="2.23193"
            width="23.9617"
            height="24.0501"
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
            <feOffset dx="0.896656" dy="0.896656" />
            <feGaussianBlur stdDeviation="0.298885" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471682" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7761_471682" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.149443" dy="0.298885" />
            <feGaussianBlur stdDeviation="0.056041" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_7761_471682" />
          </filter>
          <filter
            id="filter2_d_7761_471682"
            x="4.27539"
            y="7.61133"
            width="16.6123"
            height="16.6123"
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
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.32 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471682" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7761_471682" result="shape" />
          </filter>
          <filter
            id="filter3_di_7761_471682"
            x="16.5568"
            y="5.07683"
            width="4.00615"
            height="4.75337"
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
            <feOffset dx="-0.149443" dy="-0.298885" />
            <feGaussianBlur stdDeviation="0.056041" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_7761_471682" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_7761_471682" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1.19554" />
            <feGaussianBlur stdDeviation="0.298885" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.45 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_7761_471682" />
          </filter>
          <linearGradient
            id="paint0_linear_7761_471682"
            x1="28.2691"
            y1="8.3325"
            x2="12.871"
            y2="8.09096"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.337213" stopColor="#841DC4" />
            <stop offset="1" stopColor="#451265" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_7761_471682"
            x1="23.9385"
            y1="2.25688"
            x2="6.16654"
            y2="20.0289"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#D899FF" />
            <stop offset="1" stopColor="#841DC4" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_7761_471682"
            x1="13.7609"
            y1="16.3436"
            x2="11.1658"
            y2="13.1875"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF88E5" />
            <stop offset="1" stopColor="#F8ECFF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default BrandStyle
