import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowLeft = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
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
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.35356 12.3536C6.1583 12.5488 5.84171 12.5488 5.64645 12.3536L1.64645 8.35355C1.45119 8.15829 1.45119 7.84171 1.64645 7.64645L5.64645 3.64645C5.84172 3.45118 6.1583 3.45118 6.35356 3.64645C6.54882 3.84171 6.54882 4.15829 6.35356 4.35355L3.20711 7.5L13.6667 7.5C13.9428 7.5 14.1667 7.72386 14.1667 8C14.1667 8.27614 13.9428 8.5 13.6667 8.5L3.20711 8.5L6.35356 11.6464C6.54882 11.8417 6.54882 12.1583 6.35356 12.3536Z"
      />
    </svg>
  )
})

export default ArrowLeft
