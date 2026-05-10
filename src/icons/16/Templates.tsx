const Templates = ({ size = 16, color = 'currentColor', className = '', ...rest }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      {...rest}
    >
      <path d="M13.6006 9.61365V13.3627H9.85156V9.61365H13.6006Z" stroke={color} strokeWidth="1.5" />
      <path
        d="M4.42676 1.91833C5.68482 1.91845 6.70508 2.93857 6.70508 4.19666C6.70496 5.45464 5.68474 6.47486 4.42676 6.47498C3.16867 6.47498 2.14856 5.45471 2.14844 4.19666C2.14844 2.9385 3.1686 1.91833 4.42676 1.91833Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M5.56152 10.317L5.57227 10.3278L6.78516 11.5172L5.57227 12.7067L5.56641 12.7115L5.56152 12.7174L4.37207 13.9303L3.18262 12.7174L3.17188 12.7067L1.95801 11.5172L3.17188 10.3278L3.17676 10.3219L3.18262 10.317L4.37207 9.10315L5.56152 10.317Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path d="M13.8379 6.27295H9.54883L11.6934 2.48779L13.8379 6.27295Z" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export default Templates
