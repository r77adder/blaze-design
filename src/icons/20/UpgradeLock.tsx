import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const UpgradeLock = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <path
          d="M8.11805 3.03462C8.00005 2.03145 7.27502 0.979377 5.79079 1.16439C4.30656 1.3494 3.7813 2.51582 3.9317 3.55646L4.14722 5.28504M3.3 5.4002C2.805 5.4002 2.4 5.81163 2.4 6.31449V9.88591C2.4 10.3888 2.805 10.8002 3.3 10.8002H8.7C9.195 10.8002 9.6 10.3888 9.6 9.88591V6.31449C9.6 5.81163 9.195 5.4002 8.7 5.4002H3.3Z"
          stroke="url(#paint0_linear_5923_5284)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="paint0_linear_5923_5284"
            x1="6"
            y1="1.14307"
            x2="6"
            y2="10.8002"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9500FF" />
            <stop offset="1" stopColor="#6A00FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },
)

export default UpgradeLock
