/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { theme } from '../../theme/index.js'

const styles = {
  root: css({
    margin: theme.spacing(3, 0, 3, 0),
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

function Overview({ orderList, membershipDisplay, bonusDisplay }) {
  return (
    <div css={styles.overview}>
      <Card css={styles.root}>
        <Grid alignItems="center" container justifyContent="space-between">
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h3" gutterBottom variant="overline">
              服務消費
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{roundDecimal(orderList.service) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              店販消費
              {membershipDisplay && '/會員卡消費'}
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{`${roundDecimal(orderList.product) || 0}${membershipDisplay ? '/' + roundDecimal(orderList.membership) : ''}`}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券使用 (入業績)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{roundDecimal(orderList.usedTicket) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券販賣 (入業績)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {roundDecimal(orderList.ticketSellIntoPerformance) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              業績收入
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{roundDecimal(orderList.performanceIncome) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券販賣 (不入業績)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {roundDecimal(orderList.ticketSellNotIntoPerformance) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              卡券使用(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {roundDecimal(orderList.usedTicketForDecount) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              第三方卡券(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {roundDecimal(orderList.thirdPartTicketForDecount) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              其他付款方式(-)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {roundDecimal(orderList.otherPayWayForDecount) || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              入金使用(-)
              {bonusDisplay && '/點數折抵金額(-)'}
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {roundDecimal(orderList.walletUsedForDecount) || 0}
                {bonusDisplay && `/${roundDecimal(orderList.bonusDecountForReport)}`}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              入金儲值
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{roundDecimal(orderList.walletDeposit) || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={3} sm={2} item>
            <Typography component="h2" gutterBottom variant="overline">
              營業現金應收
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{roundDecimal(orderList.businessCash) || 0}</Typography>
            </div>
          </Grid>
        </Grid>
      </Card>
    </div>
  )
}

Overview.propTypes = {
  className: PropTypes.string,
}

export default Overview
