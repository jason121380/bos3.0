import { Typography } from '@mui/material'
import Check from '@mui/icons-material/CheckCircleOutlineRounded';
import Error from '@mui/icons-material/ErrorOutlineRounded';

const Status = ({ open = false, isComment }) => {
  const handleDisplayMessage = () => {
    switch (isComment) {
      case 'isCommented':
        return (
          <>
            <Check style={{ color: '#66bb6a', fontSize: 100 }} />
            <Typography align='center' variant='h5'>本次服務已完成評論，可關閉本視窗。</Typography>
          </>
        )
      case 'complete':
        return (
          <>
            <Check style={{ color: '#66bb6a', fontSize: 100 }} />
            <Typography align='center' variant='h5'>感謝您的評論，可關閉本視窗。</Typography>
          </>
        )
      case 'error':
        return (
          <>
            <Error style={{ color: 'red', fontSize: 100 }} />
            <Typography align='center' variant='h5'>連結有誤</Typography>
          </>
        )
      case null:
        return null
    }
  }
  return (
    <>
      {open && (
        <div style={{ textAlign: 'center', marginTop: 80 }}>
          {handleDisplayMessage()}
        </div>
      )}
    </>
  )
}

export default Status