import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Help = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 16 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.7784 8.45162C14.953 8.36891 15.0643 8.19298 15.0643 7.99975C15.0643 7.80653 14.953 7.6306 14.7784 7.54788L3.26265 2.09306C3.08163 2.00732 2.86691 2.03787 2.717 2.17071C2.56709 2.30355 2.51092 2.51303 2.57426 2.70304L4.33983 7.99975L2.57426 13.2965C2.51092 13.4865 2.56709 13.696 2.717 13.8288C2.86691 13.9616 3.08163 13.9922 3.26265 13.9064L14.7784 8.45162ZM5.22726 7.49975L3.89347 3.49839L13.3964 7.99975L3.89347 12.5011L5.22726 8.49975H8.50004C8.77618 8.49975 9.00004 8.27589 9.00004 7.99975C9.00004 7.72361 8.77618 7.49975 8.50004 7.49975H5.22726Z"
          fill={color}
        />
      </svg>
    </svg>
  )
})

export default Help
