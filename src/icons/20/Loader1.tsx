import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Loader1 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
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
        d="M10 6.42857V3M10 18V14.5714M14.0714 10.5H17.5M2.5 10.5H5.92857M12.8792 7.62121L15.3036 5.19685M4.69617 15.8034L7.12054 13.379M12.8792 13.3788L15.3036 15.8032M4.69617 5.19659L7.12054 7.62095"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Loader1
