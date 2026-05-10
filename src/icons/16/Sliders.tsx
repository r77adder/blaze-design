import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Sliders = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M8.23158 4.73317C8.23158 5.531 8.87835 6.17777 9.67618 6.17777C10.474 6.17777 11.1208 5.531 11.1208 4.73317C11.1208 3.93534 10.474 3.28857 9.67618 3.28857C8.87835 3.28857 8.23158 3.93534 8.23158 4.73317ZM8.23158 4.73317L2.6272 4.73325M12.7732 4.63969L11.5287 4.63969"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.16893 10.9065C7.16893 11.7043 6.52216 12.3511 5.72433 12.3511C4.9265 12.3511 4.27973 11.7043 4.27973 10.9065C4.27973 10.1087 4.9265 9.46191 5.72433 9.46191C6.52216 9.46191 7.16893 10.1087 7.16893 10.9065ZM7.16893 10.9065L12.7733 10.9066M2.62727 10.813L3.8718 10.813"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
})

export default Sliders
