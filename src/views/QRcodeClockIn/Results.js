/** @jsxImportSource @emotion/react */
import { Card, Container, CircularProgress, ToggleButton, ToggleButtonGroup, Typography, Box } from '@mui/material'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import format from 'date-fns/format'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    marginTop: 24,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: theme.spacing(4, 3),
    borderRadius: '16px',
    boxShadow: '0px 10px 40px rgba(26, 115, 232, 0.08)',
    border: 'none !important',
  }),
  timerContainer: css({
    backgroundColor: 'rgba(26, 115, 232, 0.04)',
    padding: '12px 24px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  }),
  timerLabel: css({
    color: 'rgb(var(--text-secondary))',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }),
  timerValue: css({
    color: 'rgb(var(--accent))',
    fontSize: '32px',
    fontWeight: '800',
    fontFamily: "'Inter', 'Roboto Mono', monospace",
  }),
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
        <Box css={styles.timerContainer}>
          <Typography css={styles.timerLabel}>
            <TimerOutlinedIcon sx={{ fontSize: 16 }} />
            有效時間
          </Typography>
          <Typography css={styles.timerValue}>
            {format(countDownTime, 'mm:ss')}
          </Typography>
        </Box>
        {isLoading ? (
          <div style={{ width: 250, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <CircularProgress />
          </div>
        ) : (
          <img src={url} alt="" style={{ width: 250, height: 250, marginBottom: '24px' }} />
        )}
        <ToggleButtonGroup
          size="small"
          exclusive
          disabled={isLoading}
          value={clockInType}
          onChange={(event, value) => value && setClockInType(value)}
          sx={{
            backgroundColor: 'rgb(var(--surface))',
            borderRadius: '24px',
            padding: '4px',
            border: 'none',
            '& .MuiToggleButtonGroup-grouped': {
              border: 'none',
              borderRadius: '20px !important',
              margin: '0 2px',
            },
          }}
        >
          {clockInOptions.map((data, idx) => (
            <ToggleButton
              key={`${data.label}-${idx}`}
              value={data.value}
              name={data.label}
              sx={{
                padding: '6px 20px',
                color: 'rgb(var(--text-secondary))',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'none',
                border: 'none !important',
                '&.Mui-selected': {
                  backgroundColor: 'rgb(var(--background)) !important',
                  color: 'rgb(var(--accent)) !important',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                },
              }}
            >
              {data.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Card>
    </Container>
  )
}
export default Results
