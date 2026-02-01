/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography } from '@mui/material'
import { format } from 'date-fns'
import idx from 'idx'
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

function Overview({ user }) {
  const gridMediumMedia = user.designerNo ? 2 : 3
  return (
    <Card css={styles.root}>
      <Grid alignItems="center" container justifyContent="space-between">
        <Grid css={styles.item} item md={gridMediumMedia} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            期別
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{idx(user, _ => format(_.salary.date, 'MM/yyyy'))}</Typography>
          </div>
        </Grid>
        {user.designerNo ? (
          <Grid css={styles.item} item md={gridMediumMedia} sm={12} xs={12}>
            <Typography component="h2" gutterBottom variant="overline">
              員工代號
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{user.designerNo}</Typography>
            </div>
          </Grid>
        ) : (
          ''
        )}
        <Grid css={styles.item} item md={gridMediumMedia} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            職稱
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{user.jobTitle}</Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={gridMediumMedia} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            員工姓名
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">{user.name}</Typography>
          </div>
        </Grid>
        <Grid css={styles.item} item md={gridMediumMedia} sm={12} xs={12}>
          <Typography component="h2" gutterBottom variant="overline">
            狀態
          </Typography>
          <div css={styles.valueContainer}>
            <Typography variant="h3">
              {idx(user, _ => (_.salary.status ? '可修改' : '不可修改'))}
            </Typography>
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default Overview
