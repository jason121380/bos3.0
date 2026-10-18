/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import PropTypes from 'prop-types'
import { Fragment } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  formControl: css({
    marginBottom: theme.spacing(3),
    width: '100%',
    '&:last-child': {
      marginBottom: 0,
    },
  }),
  cardHeader: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
}

function AboutAuthority({ className, roleName, setRoleName, ...rest }) {
  return (
    <Fragment>
      <Card {...rest}>
        <CardHeader>
          <CardTitle>一般資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <TextField
            css={styles.formControl}
            value={roleName}
            label="名稱"
            variant="outlined"
            fullWidth
            onChange={event => setRoleName(event.target.value)}
            inputProps={{
              'data-testid': 'name',
            }}
          />
        </CardContent>
      </Card>
      {/* <Card {...rest} style={{ marginTop: '20px' }}>
        <div className={classes.cardHeader}>
          <div>
            <CardHeader title="櫃檯作業" />
          </div>
          <div>
            <Button color="primary" variant="contained" style={{ marginRight: '20px' }}>
              全選/取消全選
            </Button>
          </div>
        </div>
        <Divider />
        <CardContent>
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="開單"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="帳單列表"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="收支"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="自購"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="日結"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="排班"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="打卡"
            // checked={dailyReportDisplayInput}
            // onChange={() => setDailyReportDisplayInput(!dailyReportDisplayInput)}
          />
        </CardContent>
      </Card> */}
    </Fragment>
  )
}

AboutAuthority.propTypes = {
  className: PropTypes.object,
}

export default AboutAuthority
