const UserProfileCircle = ({ size = 16, color = 'currentColor', className = '', ...rest }) => {
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
      <path
        d="M3.33301 12C4.0389 10.8209 5.586 10.0139 7.99967 10.0139C10.4134 10.0139 11.9604 10.8209 12.6663 12M14.3996 7.99997C14.3996 11.5346 11.5342 14.4 7.99961 14.4C4.46499 14.4 1.59961 11.5346 1.59961 7.99997C1.59961 4.46535 4.46499 1.59998 7.99961 1.59998C11.5342 1.59998 14.3996 4.46535 14.3996 7.99997ZM9.91698 5.91996C9.91698 6.98035 9.05858 7.83996 7.99967 7.83996C6.94077 7.83996 6.08236 6.98035 6.08236 5.91996C6.08236 4.85957 6.94077 3.99996 7.99967 3.99996C9.05858 3.99996 9.91698 4.85957 9.91698 5.91996Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default UserProfileCircle
