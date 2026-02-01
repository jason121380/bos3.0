/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography } from '@mui/material'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  root: css({
    margin: theme.spacing(1.5, 0),
  }),
  content: css({
    padding: 0,
  }),
  item: css({
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.up('sm')]: {
      '&:not(:last-of-type)': {
        borderRight: `none`,
      },
    },
    // [theme.breakpoints.down('sm')]: {
    //   '&:not(:last-of-type)': {
    //     borderBottom: `1px solid #424242`,
    //   },
    // },
  }),
  valueContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  label: css({
    marginLeft: theme.spacing(1),
  }),
  title: css({
    textAlign: 'center',
  }),
  overview: css({
    margin: '20px 0',
  }),
}

function Overview({ overview, membershipDisplay }) {
  return (
    <div css={styles.overview}>
      <Card css={styles.root}>
        <Grid alignItems="center" container justifyContent="space-between">
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h3" gutterBottom variant="overline">
              服務消費
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{Math.round(overview.service) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              店販消費
              {membershipDisplay && '/會員卡消費'}
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{`${overview.product || 0}${membershipDisplay ? '/' + overview.membership : ''}`}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券使用 (入業績)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{Math.round(overview.usedTicket) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券販賣 (入業績)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {Math.round(overview.ticketSellIntoPerformance) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              業績收入
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{Math.round(overview.performanceIncome) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券販賣 (不入業績)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {Math.round(overview.ticketSellNotIntoPerformance) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券使用(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{Math.round(overview.usedTicketForDecount) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              第三方卡券(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {Math.round(overview.thirdPartTicketForDecount) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              其他付款方式(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {Math.round(overview.otherPayWayForDecount) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              入金使用(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{overview.walletUsedForDecount || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              入金儲值
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{overview.walletDeposit || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              營業現金應收
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{Math.round(overview.businessCash) || 0}</Typography>
            </div>
          </Grid>
        </Grid>
      </Card>
    </div>
  )
}

export default Overview
