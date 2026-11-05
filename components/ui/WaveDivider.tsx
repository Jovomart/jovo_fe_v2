interface Props {
  /** Colour of the section that comes next. */
  fill: string
  variant?: 'wave' | 'hill'
  className?: string
}

const paths: Record<'wave' | 'hill', string> = {
  wave: 'M0 46C156 46 216 8 372 8C528 8 596 60 752 60C908 60 972 12 1128 12C1258 12 1372 30 1440 40V100H0Z',
  hill: 'M0 6C214 6 296 90 548 90C800 90 888 16 1112 16C1276 16 1376 32 1440 42V100H0Z',
}

export default function WaveDivider({ fill, variant = 'wave', className = '' }: Props) {
  return (
    <div aria-hidden="true" className={`pointer-events-none w-full leading-[0] ${className}`}>
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        focusable="false"
        className="block h-[42px] w-full sm:h-[62px] lg:h-[78px]"
      >
        <path d={paths[variant]} fill={fill} />
      </svg>
    </div>
  )
}
