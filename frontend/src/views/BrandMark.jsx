function BrandMark({ className = '' }) {
  return (
    <span className={`brand-mark${className ? ` ${className}` : ''}`} aria-hidden="true">
      <svg
        className="brand-mark-svg"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft purple tile */}
        <rect width="32" height="32" rx="9" fill="currentColor" />
        {/* Document page */}
        <rect
          x="8.5"
          y="7.5"
          width="12"
          height="15"
          rx="2.2"
          stroke="#fff"
          strokeWidth="1.6"
        />
        {/* Folded corner */}
        <path
          d="M16.5 7.5V11.2C16.5 11.9 17.1 12.5 17.8 12.5H20.5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Clarity spark */}
        <path
          d="M23.2 18.2L23.85 20.1L25.75 20.75L23.85 21.4L23.2 23.3L22.55 21.4L20.65 20.75L22.55 20.1L23.2 18.2Z"
          fill="#fff"
        />
        {/* Summary lines */}
        <path
          d="M11.2 14.2H17.4M11.2 17.2H17.4M11.2 20.2H15.2"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default BrandMark;
