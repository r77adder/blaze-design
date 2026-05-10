import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Cursor04 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      style={{ width: size, height: size }}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M4.56098 12.7491L3.15501 14.155M3.0081 8.99954H1.01976M3.15501 3.84499L4.56098 5.2509M8.31069 1.70933L8.31069 3.69759M13.4654 3.84499L12.0595 5.2509M18.1867 17.0975L16.635 18.6492C16.4636 18.8206 16.1857 18.8206 16.0143 18.6492L13.568 16.2029C13.383 16.0179 13.0784 16.0348 12.9149 16.2391L11.2697 18.2957C11.047 18.574 10.6029 18.4848 10.5049 18.1421L7.85214 8.85721C7.75754 8.52613 8.06363 8.22004 8.39471 8.31463L17.6796 10.9674C18.0223 11.0654 18.1115 11.5095 17.8332 11.7322L15.7766 13.3774C15.5723 13.5409 15.5554 13.8455 15.7404 14.0305L18.1867 16.4768C18.3581 16.6482 18.3581 16.9261 18.1867 17.0975Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Cursor04
