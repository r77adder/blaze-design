import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AI = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.6451 16.1834H2.19892C0.744347 16.1834 -0.156269 14.599 0.587839 13.3492L3.64044 8.22194C3.72095 8.08671 3.81817 7.96215 3.9298 7.85121L8.33267 3.4755C8.68388 3.12645 9.15891 2.9305 9.65407 2.93042L17.695 2.92908C18.8899 2.92888 19.7801 4.03143 19.5282 5.19945L17.478 14.7037C17.2917 15.5671 16.5283 16.1834 15.6451 16.1834ZM16.082 14.715H11.1781L11.1283 12.8599H8.09664L7.24175 14.715H4.42383L9.65711 4.39697H12.8893L13.7076 14.064L15.7936 4.39697H18.3085L16.082 14.715ZM11.0024 6.39862H10.9775C10.512 7.52858 9.99669 8.74624 9.46824 9.87619L9.1418 10.5862H11.0668L11.0419 9.87619C11.0038 8.74624 10.9921 7.52858 11.0038 6.39862H11.0024Z"
        fill={color}
      />
    </svg>
  )
})

export default AI
