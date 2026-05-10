import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const AddSquare02 = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', size = 20 }, forwardedRef) => {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={forwardedRef}
      >
        <g id="add-square-02" opacity="0.9">
          <path
            id="Icon"
            d="M12.8125 9.99954H10M10 9.99954H7.1875M10 9.99954V12.812M10 9.99954L10 7.18704M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
    )
  },
)

export default AddSquare02
