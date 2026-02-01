/** @jsxImportSource @emotion/react */
import { LinearProgress } from '@mui/material'
import { useEffect } from 'react'
import { css } from '@emotion/react'
const styles = {
  root: css({
    width: '100%',
    margin: '30px 0',
  }),
}

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
    <div css={styles.root}>
      <LinearProgress variant="determinate" value={progress} />
    </div>
  )
}

export default ProgressBar
