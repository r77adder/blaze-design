import { forwardRef } from 'react'
import { IconProps } from '../Types'

export const EditContained = forwardRef<SVGSVGElement, IconProps>(
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
          d="M9.24866 3.16974H4.50991C2.93963 3.16974 1.66667 4.44267 1.66667 6.0129V15.4902C1.66667 17.0604 2.93963 18.3333 4.50991 18.3333H13.9874C15.5577 18.3333 16.8307 17.0604 16.8307 15.4902L16.8307 10.7515M6.40541 13.5947L9.85363 12.8999C10.0367 12.863 10.2048 12.7729 10.3368 12.6408L18.0559 4.91764C18.426 4.54735 18.4258 3.94714 18.0554 3.57716L16.4202 1.94387C16.0499 1.57405 15.45 1.5743 15.08 1.94443L7.36008 9.66838C7.22833 9.8002 7.13838 9.96793 7.10146 10.1506L6.40541 13.5947Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  },
)

export default EditContained
