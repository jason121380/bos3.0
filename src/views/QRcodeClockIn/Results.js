/** @jsxImportSource @emotion/react */
import { Card, Container, CircularProgress, ToggleButton, ToggleButtonGroup, } from '@mui/material'
import format from 'date-fns/format'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: 24,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  })
}

const clockInOptions = [
  { label: '上班', value: 'CLOCKIN' },
  { label: '下班', value: 'CLOCKOUT' },
  { label: '休息開始', value: 'BREAKSTART' },
  { label: '休息結束', value: 'BREAKEND' },
]

function Results({ clockInType, setClockInType, isLoading, url, countDownTime }) {

  return (
    <Container maxWidth='md' >
      <Card css={styles.root}>
        有效時間{format(countDownTime, 'mm:ss')}
        {isLoading ? (
          <div style={{ width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </div>
        ) : (
          <img src={url} alt="" style={{ width: 250, height: 250 }} />
        )}
        <ToggleButtonGroup
          size="small"
          exclusive
          disabled={isLoading}
          value={clockInType}
          onChange={(event, value) => value && setClockInType(value)}
        >
          {clockInOptions.map((data, idx) => (
            <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
              {data.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Card>
    </Container>
  )
}
export default Results
