import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const Pencil02 = forwardRef<SVGSVGElement, IconProps>(({ color = 'currentColor', size = 24 }, forwardedRef) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.4999 22.1999H22.0999M15.4999 4.7999L19.6999 8.3999M4.6999 15.5999L16.5313 3.35533C17.8052 2.08143 19.8706 2.08143 21.1445 3.35533C22.4184 4.62923 22.4184 6.69463 21.1445 7.96853L8.8999 19.7999L2.8999 21.5999L4.6999 15.5999Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

export default Pencil02
