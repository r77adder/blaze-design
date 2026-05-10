import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const HighDetailedEngagement = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 46 47"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g filter="url(#filter0_bd_2305_75592)">
          <path
            d="M22.2942 41.1327C22.6792 41.5512 23.3352 41.5648 23.7373 41.1628L26.5356 38.3644C27.4733 37.4267 28.7451 36.9 30.0712 36.9H36.8001C39.3406 36.9 41.4001 34.8405 41.4001 32.3V14.3C41.4001 11.7594 39.3406 9.69995 36.8001 9.69995H9.2001C6.65959 9.69995 4.6001 11.7594 4.6001 14.3V32.3C4.6001 34.8405 6.65959 36.9 9.2001 36.9H16.206C17.6044 36.9 18.9389 37.4856 19.8856 38.5147L22.2942 41.1327Z"
            fill="url(#paint0_linear_2305_75592)"
            fillOpacity="0.88"
            shapeRendering="crispEdges"
          />
        </g>
        <g filter="url(#filter1_di_2305_75592)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.1426 17.9321C16.0026 17.1141 17.1689 16.6546 18.385 16.6546C19.6011 16.6546 20.7674 17.1141 21.6274 17.9321L22.9711 19.2093L24.3149 17.9321C24.7379 17.5154 25.244 17.183 25.8035 16.9543C26.3631 16.7257 26.9649 16.6053 27.5738 16.6003C28.1827 16.5952 28.7866 16.7056 29.3503 16.925C29.9139 17.1444 30.4259 17.4683 30.8566 17.878C31.2872 18.2876 31.6277 18.7748 31.8583 19.311C32.0889 19.8472 32.2049 20.4217 32.1996 21.001C32.1943 21.5803 32.0678 22.1528 31.8275 22.6851C31.5871 23.2175 31.2377 23.6989 30.7997 24.1014L22.9711 31.5501L15.1426 24.1014C14.2828 23.2832 13.7998 22.1736 13.7998 21.0167C13.7998 19.8598 14.2828 18.7503 15.1426 17.9321Z"
            fill="white"
            fillOpacity="0.89"
            shapeRendering="crispEdges"
          />
        </g>
        <defs>
          <filter
            id="filter0_bd_2305_75592"
            x="0.600098"
            y="5.69995"
            width="44.7998"
            height="40.7556"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_2305_75592" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_2305_75592" result="effect2_dropShadow_2305_75592" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_2305_75592" result="shape" />
          </filter>
          <filter
            id="filter1_di_2305_75592"
            x="9.7998"
            y="16.6001"
            width="26.3999"
            height="22.95"
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
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2305_75592" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2305_75592" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="0.5" dy="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2305_75592" />
          </filter>
          <linearGradient
            id="paint0_linear_2305_75592"
            x1="23.0001"
            y1="18.325"
            x2="23.0001"
            y2="41.9"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF244B" />
            <stop offset="1" stopColor="#CD000A" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default HighDetailedEngagement
