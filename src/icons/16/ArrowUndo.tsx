import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const ArrowUndo = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
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
        d="M1.92375 5.73679L1.92375 10.4338M1.92375 10.4338L6.62072 10.4338M1.92375 10.4338L5.53586 6.91044C8.65362 3.8693 13.8942 6.07832 13.8942 10.4337V10.4337"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default ArrowUndo
