import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const PaidAds = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 24 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g transform="scale(1.2)">
          <path
            d="M12.6551 8.15004C12.5448 7.83064 12.3434 7.55223 12.0768 7.35065C11.8102 7.14907 11.4907 7.03354 11.1592 7.01893H8.94325C8.50246 7.01893 8.07972 7.19769 7.76804 7.51587C7.45635 7.83406 7.28125 8.26562 7.28125 8.7156C7.28125 9.16558 7.45635 9.59714 7.76804 9.91532C8.07972 10.2335 8.50246 10.4123 8.94325 10.4123H11.1592C11.6 10.4123 12.0228 10.591 12.3345 10.9092C12.6461 11.2274 12.8212 11.6589 12.8212 12.1089C12.8212 12.5589 12.6461 12.9905 12.3345 13.3087C12.0228 13.6268 11.6 13.8056 11.1592 13.8056H8.94325C8.61182 13.791 8.29225 13.6755 8.02568 13.4739C7.7591 13.2723 7.55772 12.9939 7.44745 12.6745M10.0512 5.32227V7.01893M10.0512 13.8056V15.5023"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.9312 10.1062C18.9312 14.9802 14.9802 18.9312 10.1062 18.9312C5.23234 18.9312 1.28125 14.9802 1.28125 10.1062C1.28125 5.23234 5.23234 1.28125 10.1062 1.28125C14.9802 1.28125 18.9312 5.23234 18.9312 10.1062Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    )
  },
)

export default PaidAds
