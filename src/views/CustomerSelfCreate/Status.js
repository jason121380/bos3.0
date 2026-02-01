/** @jsxImportSource @emotion/react */
import Page from 'components/Page'
import { Typography } from '@mui/material'
import Check from '@mui/icons-material/CheckCircleOutlineRounded';
import Close from '@mui/icons-material/HighlightOffRounded';
import styles from './Styles'

const Status = ({ isSuccess = false }) => {
  return (
    <Page title='BeautyOS+'>
      <div css={styles.status}>
        {isSuccess ? <Check className='check' fontSize=''/> : <Close className='close' fontSize=''/>}
        <Typography align='center' variant='h3'>{isSuccess ? <>您已填寫完成<br/>謝謝</>: '該店未開放此功能'}</Typography>
      </div>
    </Page>
  )
}

export default Status