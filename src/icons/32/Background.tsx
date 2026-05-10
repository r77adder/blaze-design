import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Background = forwardRef<SVGSVGElement, IconProps>(
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
        <g filter="url(#filter0_bd_7761_471680)">
          <mask id="path-1-inside-1_7761_471680" fill="white">
            <path d="M9.36523 8L29.362 10.3653L26.9968 30.3621L6.99995 27.9968L9.36523 8Z" />
          </mask>
          <path
            d="M9.36523 8L29.362 10.3653L26.9968 30.3621L6.99995 27.9968L9.36523 8Z"
            fill="white"
            shapeRendering="crispEdges"
          />
          <path
            d="M9.36523 8L9.54143 6.51038C8.71874 6.41307 7.97293 7.00111 7.87562 7.8238L9.36523 8ZM29.362 10.3653L30.8517 10.5415C30.949 9.71879 30.3609 8.97298 29.5382 8.87567L29.362 10.3653ZM26.9968 30.3621L26.8206 31.8517C27.6433 31.949 28.3891 31.361 28.4864 30.5383L26.9968 30.3621ZM6.99995 27.9968L5.51034 27.8206C5.41303 28.6433 6.00106 29.3891 6.82376 29.4864L6.99995 27.9968ZM9.18904 9.48962L29.1858 11.8549L29.5382 8.87567L9.54143 6.51038L9.18904 9.48962ZM27.8724 10.1891L25.5071 30.1859L28.4864 30.5383L30.8517 10.5415L27.8724 10.1891ZM27.173 28.8725L7.17615 26.5072L6.82376 29.4864L26.8206 31.8517L27.173 28.8725ZM8.48957 28.173L10.8549 8.1762L7.87562 7.8238L5.51034 27.8206L8.48957 28.173Z"
            fill="white"
            mask="url(#path-1-inside-1_7761_471680)"
          />
          <rect
            x="10.1665"
            y="9.0166"
            width="18.3056"
            height="18.3056"
            transform="rotate(6.74577 10.1665 9.0166)"
            fill="url(#paint0_linear_7761_471680)"
          />
        </g>
        <g filter="url(#filter1_bd_7761_471680)">
          <mask id="path-4-inside-2_7761_471680" fill="white">
            <path d="M2.27832 5.49658L22.6859 2.97983L25.2027 23.3874L4.79508 25.9042L2.27832 5.49658Z" />
          </mask>
          <path
            d="M2.27832 5.49658L22.6859 2.97983L25.2027 23.3874L4.79508 25.9042L2.27832 5.49658Z"
            fill="white"
            shapeRendering="crispEdges"
          />
          <path
            d="M2.27832 5.49658L2.09472 4.00786C1.27253 4.10926 0.688201 4.85798 0.789598 5.68018L2.27832 5.49658ZM22.6859 2.97983L24.1747 2.79623C24.0733 1.97403 23.3245 1.38971 22.5023 1.4911L22.6859 2.97983ZM25.2027 23.3874L25.3863 24.8762C26.2085 24.7748 26.7928 24.026 26.6914 23.2038L25.2027 23.3874ZM4.79508 25.9042L3.30636 26.0878C3.40775 26.91 4.15647 27.4943 4.97867 27.3929L4.79508 25.9042ZM2.46192 6.9853L22.8695 4.46855L22.5023 1.4911L2.09472 4.00786L2.46192 6.9853ZM21.1972 3.16342L23.714 23.571L26.6914 23.2038L24.1747 2.79623L21.1972 3.16342ZM25.0191 21.8987L4.61148 24.4155L4.97867 27.3929L25.3863 24.8762L25.0191 21.8987ZM6.2838 25.7206L3.76704 5.31299L0.789598 5.68018L3.30636 26.0878L6.2838 25.7206Z"
            fill="white"
            mask="url(#path-4-inside-2_7761_471680)"
          />
          <rect
            x="3.32031"
            y="6.30957"
            width="18.6929"
            height="18.6929"
            transform="rotate(-7.03047 3.32031 6.30957)"
            fill="url(#paint1_linear_7761_471680)"
          />
        </g>
        <g filter="url(#filter2_bd_7761_471680)">
          <mask id="path-7-inside-3_7761_471680" fill="white">
            <path d="M5.5 6.5H26.5V27.5H5.5V6.5Z" />
          </mask>
          <path d="M5.5 6.5H26.5V27.5H5.5V6.5Z" fill="white" shapeRendering="crispEdges" />
          <path
            d="M5.5 6.5V5C4.67157 5 4 5.67157 4 6.5H5.5ZM26.5 6.5H28C28 5.67157 27.3284 5 26.5 5V6.5ZM26.5 27.5V29C27.3284 29 28 28.3284 28 27.5H26.5ZM5.5 27.5H4C4 28.3284 4.67157 29 5.5 29V27.5ZM5.5 8H26.5V5H5.5V8ZM25 6.5V27.5H28V6.5H25ZM26.5 26H5.5V29H26.5V26ZM7 27.5V6.5H4V27.5H7Z"
            fill="white"
            mask="url(#path-7-inside-3_7761_471680)"
          />
          <path d="M6.5498 7.5498H25.4498V26.4498H6.5498V7.5498Z" fill="url(#paint2_linear_7761_471680)" />
        </g>
        <defs>
          <filter
            id="filter0_bd_7761_471680"
            x="1.80769"
            y="2.80769"
            width="32.7464"
            height="32.7469"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.59615" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_7761_471680" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_7761_471680" result="effect2_dropShadow_7761_471680" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7761_471680" result="shape" />
          </filter>
          <filter
            id="filter1_bd_7761_471680"
            x="-2.91399"
            y="-2.21233"
            width="33.3089"
            height="33.3089"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.59615" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_7761_471680" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_7761_471680" result="effect2_dropShadow_7761_471680" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7761_471680" result="shape" />
          </filter>
          <filter
            id="filter2_bd_7761_471680"
            x="0.307693"
            y="1.30769"
            width="31.3846"
            height="31.3846"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="2.59615" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_7761_471680" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
            <feBlend mode="normal" in2="effect1_backgroundBlur_7761_471680" result="effect2_dropShadow_7761_471680" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_7761_471680" result="shape" />
          </filter>
          <linearGradient
            id="paint0_linear_7761_471680"
            x1="11.0306"
            y1="27.1303"
            x2="10.8706"
            y2="9.72066"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#61E800" />
            <stop offset="1" stopColor="#00CDB9" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_7761_471680"
            x1="4.20273"
            y1="24.8065"
            x2="4.03927"
            y2="7.02853"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF4747" />
            <stop offset="1" stopColor="#FFB92C" />
          </linearGradient>
          <linearGradient
            id="paint2_linear_7761_471680"
            x1="25.3749"
            y1="26.3749"
            x2="9.24988"
            y2="9.12488"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF47FC" />
            <stop offset="1" stopColor="#642CFF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default Background
