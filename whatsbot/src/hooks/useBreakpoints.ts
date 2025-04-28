import { useMediaQuery } from 'react-responsive'

export function useBreakpoints() {
  const xs = useMediaQuery({ maxWidth: 639 })
  const sm = useMediaQuery({ minWidth: 640, maxWidth: 767 })
  const md = useMediaQuery({ minWidth: 768, maxWidth: 1023 })
  const lg = useMediaQuery({ minWidth: 1024, maxWidth: 1279 })
  const xl = useMediaQuery({ minWidth: 1280, maxWidth: 1535 })
  const twoXl = useMediaQuery({ minWidth: 1536 })

  return { xs, sm, md, lg, xl, '2xl': twoXl }
}
