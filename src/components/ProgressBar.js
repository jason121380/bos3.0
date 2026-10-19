import { LinearProgress } from '@mui/material'
import { useEffect } from 'react'
const ProgressBar = ({ dataLoading, setProgress, progress }) => {
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        const diff = dataLoading ? Math.random() * 2 : Math.random() * 15
        return Math.min(oldProgress + diff, 100)
      })
    }, 300)

    return () => {
      clearInterval(timer)
    }
  }, [dataLoading])

  return (
    <div className="w-full my-[30px]">
      <LinearProgress variant="determinate" value={progress} />
    </div>
  )
}

export default ProgressBar
