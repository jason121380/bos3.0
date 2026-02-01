/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography } from '@mui/material'
import formatMoney from 'helper/formatMoney'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    margin: theme.spacing(3, 0, 3, 0),
    width: 150,
  }),
  item: css({
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      '&:not(:last-of-type)': {
        borderRight: `none`,
      },
    },
    [theme.breakpoints.down('sm')]: {
      '&:not(:last-of-type)': {
        borderBottom: `1px solid #424242`,
      },
    },
  }),
  valueContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
}

function Overview({ usersSalary }) {
  const usersSalarySummary = usersSalary.reduce((accu, curVal) => {
    let returnedValie = accu
    const thisUserSalary = curVal.increaseItem - curVal.decreaseItem
    if (thisUserSalary > 0) returnedValie += thisUserSalary
    return returnedValie
  }, 0)
  return (
    <Card css={styles.root}>
      <Grid alignItems="center" container justifyContent="space-between">
        <Grid css={styles.item} item md={12} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            實際匯款金額合計
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{formatMoney(usersSalarySummary)}</Typography>
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Overview
