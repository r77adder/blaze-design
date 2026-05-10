import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Approved = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.2743 3.48073L12.3793 3.65988L12.5747 3.58956L13.115 3.3951C14.7499 2.80666 16.4065 4.21473 16.0891 5.92312L16.0035 6.38366L15.9644 6.59451L16.1668 6.66531L16.5916 6.81387C18.2548 7.39551 18.6344 9.57659 17.2654 10.6859L16.9441 10.9462L16.7756 11.0828L16.887 11.2689L17.1032 11.6301C18.0033 13.1337 16.9149 15.0436 15.1625 15.0357L14.6489 15.0334L14.4381 15.0324L14.4016 15.2401L14.309 15.7658C14.0101 17.4641 11.9903 18.2087 10.6605 17.1108L10.1955 16.7268L10.0363 16.5953L9.87711 16.7268L9.41202 17.1108C8.08227 18.2087 6.06243 17.4641 5.76353 15.7658L5.671 15.2401L5.63446 15.0324L5.42366 15.0334L4.91002 15.0357C3.15763 15.0436 2.06927 13.1337 2.96934 11.6301L3.18557 11.2689L3.29696 11.0828L3.12845 10.9462L2.80714 10.6859C1.43819 9.57659 1.81774 7.39551 3.48094 6.81387L3.90576 6.66531L4.1082 6.59451L4.06903 6.38366L3.98347 5.92312C3.66609 4.21473 5.32263 2.80666 6.95757 3.3951L7.49789 3.58956L7.69327 3.65988L7.79825 3.48073L8.095 2.9743C8.96417 1.49099 11.1084 1.49099 11.9776 2.97429L12.2743 3.48073Z"
        fill="url(#paint0_radial_2312_41410)"
        stroke="#028B10"
        strokeWidth="0.5"
      />
      <g filter="url(#filter0_di_2312_41410)">
        <path
          d="M6.74048 10.327L9.58346 12.9165L12.9168 6.6665"
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
          id="filter0_di_2312_41410"
          x="2.99048"
          y="4.9165"
          width="13.6765"
          height="13.75"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2312_41410" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2312_41410" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="0.1" dy="0.1" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.95 0" />
          <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2312_41410" />
        </filter>
        <radialGradient
          id="paint0_radial_2312_41410"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(5.36031 2.16132) rotate(57.8969) scale(16.4508 16.6388)"
        >
          <stop stopColor="#11EA27" />
          <stop offset="1" stopColor="#018F10" />
        </radialGradient>
      </defs>
    </svg>
  )
})

export default Approved
