import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Star2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 36 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M17.2425 4.57096C17.5524 3.94314 18.4476 3.94314 18.7575 4.57096L22.7685 12.6981C22.8915 12.9475 23.1293 13.1203 23.4045 13.1602L32.3734 14.4635C33.0662 14.5642 33.3428 15.4156 32.8415 15.9043L26.3516 22.2304C26.1525 22.4245 26.0616 22.7041 26.1086 22.9781L27.6407 31.9107C27.759 32.6008 27.0348 33.127 26.4151 32.8012L18.3931 28.5838C18.147 28.4544 17.853 28.4544 17.6069 28.5838L9.5849 32.8012C8.96521 33.127 8.24094 32.6008 8.35929 31.9107L9.89136 22.9781C9.93835 22.7041 9.84751 22.4245 9.64842 22.2304L3.15848 15.9043C2.65713 15.4156 2.93378 14.5642 3.62662 14.4635L12.5955 13.1602C12.8706 13.1203 13.1085 12.9475 13.2315 12.6981L17.2425 4.57096Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Star2
