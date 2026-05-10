import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TurnDocsIntoContent = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 24 24`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g filter="url(#filter0_d_4895_104454)">
          <path
            d="M2.30869 5C2.30869 3.34315 3.65183 2 5.30869 2H19.3087C20.9655 2 22.3087 3.34315 22.3087 5V19C22.3087 20.6569 20.9655 22 19.3087 22H5.30869C3.65183 22 2.30869 20.6569 2.30869 19V5Z"
            fill="white"
          />
        </g>
        <path
          d="M5.49619 7.87895C5.49619 7.60281 5.72004 7.37895 5.99619 7.37895H18.6212C18.8973 7.37895 19.1212 7.60281 19.1212 7.87895C19.1212 8.15509 18.8973 8.37895 18.6212 8.37895H5.99619C5.72004 8.37895 5.49619 8.15509 5.49619 7.87895Z"
          fill="black"
          fillOpacity="0.4"
        />
        <path
          d="M5.49619 16.3081C5.49619 16.032 5.72004 15.8081 5.99619 15.8081H18.6212C18.8973 15.8081 19.1212 16.032 19.1212 16.3081C19.1212 16.5842 18.8973 16.8081 18.6212 16.8081H5.99619C5.72004 16.8081 5.49619 16.5842 5.49619 16.3081Z"
          fill="black"
          fillOpacity="0.4"
        />
        <path
          d="M5.49619 18.4312C5.49619 18.155 5.72004 17.9312 5.99619 17.9312H18.6212C18.8973 17.9312 19.1212 18.155 19.1212 18.4312C19.1212 18.7073 18.8973 18.9312 18.6212 18.9312H5.99619C5.72004 18.9312 5.49619 18.7073 5.49619 18.4312Z"
          fill="black"
          fillOpacity="0.4"
        />
        <path
          d="M5.49619 10.8135C5.49619 10.2612 5.9439 9.81348 6.49619 9.81348H18.1212C18.6735 9.81348 19.1212 10.2612 19.1212 10.8135V13.685C19.1212 14.2373 18.6735 14.685 18.1212 14.685H6.49619C5.9439 14.685 5.49619 14.2373 5.49619 13.685V10.8135Z"
          fill="#B4B4B4"
        />
        <path
          d="M5.49619 5.75613C5.49619 5.47999 5.72004 5.25613 5.99619 5.25613H15.2149C15.4911 5.25613 15.7149 5.47999 15.7149 5.75613C15.7149 6.03228 15.4911 6.25613 15.2149 6.25613H5.99619C5.72004 6.25613 5.49619 6.03228 5.49619 5.75613Z"
          fill="black"
          fillOpacity="0.4"
        />
        <defs>
          <filter
            id="filter0_d_4895_104454"
            x="0.308685"
            y="1"
            width="24"
            height="24"
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
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4895_104454" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4895_104454" result="shape" />
          </filter>
        </defs>
      </svg>
    )
  },
)

export default TurnDocsIntoContent
