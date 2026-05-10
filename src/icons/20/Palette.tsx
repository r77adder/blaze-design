import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Palette = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M10.0002 5.5V5.52769M5.02769 10.5002H5M13.5358 6.96462L13.5162 6.9842M6.48431 14.0161L6.46473 14.0357M6.48431 6.98389L6.46473 6.96431M10 18.5C5.58172 18.5 2 14.9183 2 10.5C2 6.08172 5.58172 2.5 10 2.5C14.4183 2.5 18 6.08172 18 10.5C18 11.845 16.7572 12.74 15.4121 12.74H14.89C14.6204 12.74 14.3545 12.8028 14.1133 12.9233C13.2554 13.3523 12.9077 14.3954 13.3367 15.2533C13.4572 15.4945 13.52 15.7604 13.52 16.03V16.1876C13.52 17.1048 13.0053 17.9733 12.1208 18.2158C11.4454 18.4011 10.7342 18.5 10 18.5Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Palette
