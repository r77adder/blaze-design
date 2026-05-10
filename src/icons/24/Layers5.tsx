import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Layers5 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
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
      <path
        d="M21.5999 11.975L11.9999 16.8958L2.3999 11.975M21.5999 16.6792L11.9999 21.5999L2.3999 16.6792M11.9999 2.3999L21.5999 7.32065L11.9999 12.2414L2.3999 7.32065L11.9999 2.3999Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Layers5
