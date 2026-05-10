import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const TableView = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 20 }, forwardedRef) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      ref={forwardedRef}
    >
      <path
        d="M8.25 2.5C8.25 2.08579 7.91421 1.75 7.5 1.75C7.08579 1.75 6.75 2.08579 6.75 2.5H8.25ZM6.75 18.5C6.75 18.9142 7.08579 19.25 7.5 19.25C7.91421 19.25 8.25 18.9142 8.25 18.5H6.75ZM5 3.25H15V1.75H5V3.25ZM17.25 5.5V15.5H18.75V5.5H17.25ZM15 17.75H5V19.25H15V17.75ZM2.75 15.5V5.5H1.25V15.5H2.75ZM5 17.75C3.75736 17.75 2.75 16.7426 2.75 15.5H1.25C1.25 17.5711 2.92893 19.25 5 19.25V17.75ZM17.25 15.5C17.25 16.7426 16.2426 17.75 15 17.75V19.25C17.0711 19.25 18.75 17.5711 18.75 15.5H17.25ZM15 3.25C16.2426 3.25 17.25 4.25736 17.25 5.5H18.75C18.75 3.42893 17.0711 1.75 15 1.75V3.25ZM5 1.75C2.92893 1.75 1.25 3.42893 1.25 5.5H2.75C2.75 4.25736 3.75736 3.25 5 3.25V1.75ZM6.75 2.5V18.5H8.25V2.5H6.75ZM2.5 8.75H17.5V7.25H2.5V8.75Z"
        fill={color}
      />
    </svg>
  )
})

export default TableView
