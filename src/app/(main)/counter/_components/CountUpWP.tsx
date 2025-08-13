'use client'

import { Button } from '@/components/ui/button'
import useCountUp from '@/hooks/use-count-up'

const CountUpWP = () => {
  const [elementRef] = useCountUp(99999999999, {})

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/count-up.js'
    link.download = 'count-up.js'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='stats-container'>
      <div className='stat-card flex justify-center flex-col items-center'>
        <div ref={elementRef} className='count-up text-5xl font-bold text-red-500' data-target='99999999999'></div>
        <Button className='mt-8' onClick={handleDownload}>
          Download
        </Button>
      </div>
    </div>
  )
}
export default CountUpWP

export const CountUpWPCode = `
<!DOCTYPE html>
<html>

<head>
  <style>
    .stats-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100dvh;
    }

    .stat-card {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .count-up {
      font-size: 3rem;
      font-weight: bold;
      color: #007cba;
    }

    .stat-label {
      font-size: 1.1rem;
      color: #666;
    }
  </style>
</head>

<body>
  <div class="stats-container">
    <div class="stat-card">
      <div class="count-up" data-target="99999999999"></div>
      <div class="stat-label">Dự án hoàn thành</div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <script src="count-up.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      new CountUp({
        duration: 3,
        ease: 'power3.out',
        stagger: 0.1,
      })
    })
  </script>
</body>

</html>
`
