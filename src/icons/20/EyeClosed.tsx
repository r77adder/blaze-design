import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const EyeClosed = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M17 17.1227L4.5 4.62268M8.5 9.57399C8.18882 9.91706 8 10.3677 8 10.8613C8 11.9361 8.89543 12.8074 10 12.8074C10.5093 12.8074 10.9741 12.6222 11.3272 12.3172M17.0323 12.8074C17.7209 11.7767 18 10.9361 18 10.9361C18 10.9361 16.1795 5.12268 10 5.12268C9.65308 5.12268 9.31989 5.141 9 5.17559M14.5 15.3306C13.3521 16.0628 11.8744 16.5806 10 16.55C3.89744 16.4502 2 10.9361 2 10.9361C2 10.9361 2.88155 8.12108 5.5 6.40878"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default EyeClosed
