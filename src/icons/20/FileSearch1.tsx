import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const FileSearch1 = forwardRef<SVGSVGElement, IconProps>(
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
        <path
          d="M7.50006 18.9809H4.74981C3.64524 18.9809 2.74981 18.0855 2.74982 16.9809L2.74989 4.98095C2.7499 3.87638 3.64533 2.98096 4.74989 2.98096H13.7501C14.8547 2.98096 15.7501 3.87639 15.7501 4.98096V6.48093M16 16.9809L18 18.9809M17 12.9809C17 15.7424 14.7614 17.9809 12 17.9809C9.23855 17.9809 6.99997 15.7424 6.99997 12.9809C6.99997 10.2195 9.23855 7.98093 12 7.98093C14.7614 7.98093 17 10.2195 17 12.9809Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default FileSearch1
