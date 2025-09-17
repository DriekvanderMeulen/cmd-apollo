interface SpinnerProps {
  size?: number;
  className?: string;
}

function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
      }}
    >
      <div className="absolute animate-spin-fast">
        <svg
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <path d="M10 1C10 0.447715 10.4488 -0.00518079 10.9984 0.0499558C12.4922 0.199838 13.9376 0.684699 15.225 1.4736C16.7974 2.4372 18.0728 3.81688 18.9101 5.46009C19.7473 7.10331 20.1139 8.94605 19.9692 10.7846C19.8507 12.2898 19.3934 13.7442 18.6366 15.0408C18.3582 15.5178 17.728 15.6147 17.2812 15.2901V15.2901C16.8343 14.9654 16.7415 14.3425 17.0079 13.8587C17.5545 12.866 17.8858 11.765 17.9753 10.6277C18.0911 9.15684 17.7979 7.68265 17.1281 6.36808C16.4582 5.0535 15.438 3.94976 14.18 3.17888C13.2073 2.58281 12.1218 2.2037 10.9974 2.06242C10.4494 1.99356 10 1.55228 10 1V1Z" />
        </svg>
      </div>
    </div>
  );
}

export default Spinner;
