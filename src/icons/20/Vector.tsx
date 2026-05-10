import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Vector = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 17 17" fill="none">
      <path
        d="M6.54687 5.7981H11.2344M11.2344 5.7981V10.4856M11.2344 5.7981L6.15625 10.8763M13.1875 16L3.81248 16C2.25919 16 1 14.7408 1 13.1875L1 3.8125C1 2.2592 2.25919 1 3.81248 1L13.1875 1C14.7408 1 16 2.2592 16 3.8125V13.1875C16 14.7408 14.7408 16 13.1875 16Z"
        stroke={color}
        strokeOpacity="0.8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Vector
