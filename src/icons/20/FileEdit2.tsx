import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FileEdit2 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M7.96436 17.9645H3.96435C2.85978 17.9645 1.96435 17.0691 1.96436 15.9645L1.96443 3.96453C1.96444 2.85996 2.85987 1.96454 3.96443 1.96454H12.9647C14.0692 1.96454 14.9647 2.85997 14.9647 3.96454V7.96454M5.46467 5.96454H11.4647M5.46467 8.96454H11.4647M5.46467 11.9645H8.46467M10.9645 15.2071L15.2072 10.9644L18.0356 13.7928L13.7929 18.0355H10.9645V15.2071Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default FileEdit2
