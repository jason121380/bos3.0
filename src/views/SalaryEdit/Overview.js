/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography } from '@mui/material'
import formatMoney from 'helper/formatMoney'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({}),
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

export default function Overview({ salary, config }) {
  return (
    <Card css={styles.root}>
      <Grid alignItems="center" container justifyContent="space-between">
        <Grid css={styles.item} item md={2} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            指定薪資
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{formatMoney(salary.designateSales)}</Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={2} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            不指定薪資
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{formatMoney(salary.notDesignateSales)}</Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={2} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            點數換算金額
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{salary.points}</Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={2} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            加扣項小計
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">
              {formatMoney(
                config.increase.reduce((total, item) => total + item.value, 0) -
                config.decrease.reduce((total, item) => total + item.value, 0)
              )}
            </Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={2} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            本月實領現金
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">
              {formatMoney(
                salary.points +
                config.increase.reduce((total, item) => total + item.value, 0) -
                config.decrease.reduce((total, item) => total + item.value, 0) +
                salary.notDesignateSales +
                salary.designateSales
              )}
            </Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={2} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            非現金薪資
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{formatMoney(0)}</Typography>
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}
