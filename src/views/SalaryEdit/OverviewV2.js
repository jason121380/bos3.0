/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import idx from 'idx'
import { css } from '@emotion/react'
import { theme } from '../../theme'

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
  subTitle: css({
    fontSize: '16px !important',
    lineHeight: '19px !important',
  }),
}

function OverviewV2({ designer, actualTransferFun, memberActive }) {
  const [salaryCheckoutRecord, setSalaryCheckoutRecord] = useState()
  const [isHelperRetrireveAutoSet, setIsHelperRetrireveAutoSet] = useState(false)
  const [membershipDisplay, setMembershipDisplay] = useState(false)

  useEffect(() => {
    const tmp = idx(designer, _ => _.salaryMonthlyCheckoutRecord)
    const autoSet = idx(designer, _ => _.isHelperRetrireveAutoSet)
    setSalaryCheckoutRecord(tmp)
    setIsHelperRetrireveAutoSet(autoSet)
    setMembershipDisplay(memberActive || tmp.membershipPerformance !== 0 || tmp.membershipRake !== 0)
  }, [designer, memberActive])
  return (
    <div css={styles.overview}>
      <Card css={styles.root}>
        <Grid alignItems="center" container justifyContent="space-between">
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography
              component="h3"
              gutterBottom
              variant="overline"
              style={{
                color: 'red',
                fontSize: '16px',
              }}
            >
              實際匯款金額
            </Typography>
            <Typography variant="body2" gutterBottom></Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">{Math.round(actualTransferFun * 10) / 10 || 0}</Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h3" gutterBottom variant="overline" css={styles.subTitle}>
              總實業績
            </Typography>
            <Typography variant="body2" gutterBottom></Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.totalTruthPerformance * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              指定實業績
            </Typography>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              不指定實業績
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.designateTruthPerformance * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.nonDesignateTruthPerformance * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              指定抽成
            </Typography>
            <Typography variant="body2" gutterBottom></Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.designateRake * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              不指定抽成
            </Typography>
            <Typography variant="body2" gutterBottom></Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.nonDesignateRake * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              特殊業績
            </Typography>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              特殊抽成
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {' '}
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.specialTruthPerformance * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.specialRake * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              店販實業績
            </Typography>
            {membershipDisplay && (
              <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
                會員卡實業績
              </Typography>
            )}
            <Typography variant="body2" gutterBottom></Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.productPerformance * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
            {membershipDisplay && (
              <div css={styles.valueContainer}>
                <Typography variant="h3">
                  {salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.membershipPerformance * 10) / 10 || 0
                    : 0}
                </Typography>
              </div>
            )}
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              店販抽成
            </Typography>
            {membershipDisplay && (
              <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
                會員卡抽成
              </Typography>
            )}
            <Typography variant="body2" gutterBottom></Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.productRake * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
            {membershipDisplay && (
              <div css={styles.valueContainer}>
                <Typography variant="h3">
                  {salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.membershipRake * 10) / 10 || 0
                    : 0}
                </Typography>
              </div>
            )}
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              服務/卡券扣項
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              style={{
                color: 'red',
                fontWeight: 'bold',
              }}
            >
              (扣薪水)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.deductionItemOnSalary * 10) / 10 || 0
                  : 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              互助使用總金額
            </Typography>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              (包含的點數)
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              style={{
                color: 'red',
                fontWeight: 'bold',
              }}
            >
              (扣薪水)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {`${salaryCheckoutRecord != undefined
                    ? Math.round(salaryCheckoutRecord.helperPaidPriceOnSalary * 10) / 10
                    : 0
                  }(${salaryCheckoutRecord != undefined
                    ? Math.round(salaryCheckoutRecord.helperPaidPointOnSalary * 10) / 10
                    : 0
                  })` || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item}
            xs={6}
            sm={3}
            md={2}
            style={{
              padding: '24px 14px',
            }}
            item
          >
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              互助獲得總金額
            </Typography>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              (包含的點數)
            </Typography>
            {!isHelperRetrireveAutoSet && (
              <Typography
                variant="body2"
                gutterBottom
                style={{
                  color: 'red',
                  fontWeight: 'bold',
                }}
              >
                (未自動帶入下方)
              </Typography>
            )}
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {`${salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.helperRetrievePrice * 10) / 10
                    : 0
                  }(${salaryCheckoutRecord !== undefined
                    ? Math.round(salaryCheckoutRecord.helperRetrievePoint * 10) / 10
                    : 0
                  })` || 0}
              </Typography>
            </div>
          </Grid>
          <Grid css={styles.item} xs={6} sm={3} md={2} item>
            <Typography component="h2" gutterBottom variant="overline" css={styles.subTitle}>
              手續費
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              style={{
                color: 'red',
                fontWeight: 'bold',
              }}
            >
              (其他付款方式/入金)
            </Typography>
            <div css={styles.valueContainer}>
              <Typography variant="h3">
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.otherPayHandlingFeeOnSalary * 10) / 10
                  : 0 || 0}
                /{' '}
                {salaryCheckoutRecord !== undefined
                  ? Math.round(salaryCheckoutRecord.walletDepositHandlingFee * 10) / 10
                  : 0 || 0}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Card>
    </div>
  )
}

OverviewV2.propTypes = {
  className: PropTypes.string,
}

export default OverviewV2
