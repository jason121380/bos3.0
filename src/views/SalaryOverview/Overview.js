/** @jsxImportSource @emotion/react */
import { Card, Grid, Typography, TextField, Box } from '@mui/material'
import formatMoney from 'helper/formatMoney'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import idx from 'idx'
import useFetchMerchantMonthlyCheckoutRemark from 'hooks/useFetchMerchantMonthlyCheckoutRemark'
import useFetchSettingMerchantMonthlyCheckoutRemark from 'hooks/useFetchSettingMerchantMonthlyCheckoutRemark'

const styles = {
  container: css({
    display: 'flex',
    gap: theme.spacing(3),
    height: '100%',
    alignItems: 'stretch',
  }),
  card: css({
    width: 240,
    borderRadius: '12px',
    border: '1px solid rgb(var(--border))',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: 'rgb(var(--background))',
  }),
  remarkCard: css({
    flex: 1,
    minWidth: 300,
    borderRadius: '12px',
    border: '1px solid rgb(var(--border))',
    boxShadow: 'none',
    padding: theme.spacing(2, 3),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'rgb(var(--background))',
  }),
  item: css({
    padding: theme.spacing(3, 3),
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  }),
  label: css({
    fontSize: '14.5px !important', // 稍微增大字體
    fontWeight: '700 !important',
    color: 'rgb(var(--text))',
    marginBottom: theme.spacing(1),
    letterSpacing: '0.05em',
  }),
  value: css({
    fontSize: '32px !important',
    fontWeight: '700 !important',
    color: theme.palette.primary.main,
  }),
  valueContainer: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  titleInput: css({
    width: '100%',
    flex: 1, // 填滿高度
    '& .MuiInputBase-root': {
      height: '100%',
      fontSize: '14.5px', // 統一字體大小
      backgroundColor: 'rgb(var(--surface))',
      borderRadius: '8px',
      padding: '12px',
      alignItems: 'flex-start', // 文字從頂部開始
    },
    '& .MuiInputBase-input': {
      padding: '0px !important'
    },
    '& fieldset': {
      borderColor: 'rgb(var(--border)) !important',
    }
  }),
}

function Overview({ usersSalary, date }) {
  const usersSalarySummary = (usersSalary || []).reduce((accu, curVal) => {
    const actualSalary = curVal.actualSalary || (curVal.increaseItem - curVal.decreaseItem) || 0;
    return accu + actualSalary;
  }, 0)

  const [titleRemark, setTitleRemark] = useState('')
  const merchantMonthlyCheckoutRemarkData = useFetchMerchantMonthlyCheckoutRemark({ date: date })
  const {
    setMerchantMerchantMonthlyCheckoutRemark,
  } = useFetchSettingMerchantMonthlyCheckoutRemark()

  useEffect(() => {
    if (!merchantMonthlyCheckoutRemarkData.loading) {
      const remark = idx(
        merchantMonthlyCheckoutRemarkData,
        _ => _.data.merchantMonthlyCheckoutRemark
      )
      setTitleRemark(remark || '')
    }
  }, [merchantMonthlyCheckoutRemarkData.loading, merchantMonthlyCheckoutRemarkData])

  const handelTitleRemarkOnChange = e => {
    setTitleRemark(e.target.value)
    setMerchantMerchantMonthlyCheckoutRemark({ date: date, remark: e.target.value })
  }

  return (
    <div css={styles.container}>
      {/* 實際匯款金額合計 */}
      <Card css={styles.card}>
        <Grid container>
          <Grid css={styles.item} item xs={12}>
            <Typography component="h2" css={styles.label} variant="overline">
              實際匯款金額合計
            </Typography>
            <div css={styles.valueContainer}>
              <Typography css={styles.value} variant="h3">
                {formatMoney(Math.round(usersSalarySummary))}
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Card>

      {/* 職務備註 */}
      <Card css={styles.remarkCard}>
        <Typography component="h2" css={styles.label} variant="overline" sx={{ mb: 1.5, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <span style={{ backgroundColor: theme.palette.primary.main, width: '4px', height: '16px', display: 'inline-block', marginRight: '8px', borderRadius: '2px' }}></span>
          {format(new Date(date), 'yyyy/M')} 月結備註
        </Typography>
        <TextField
          variant="outlined"
          placeholder="請輸入本次月結備註..."
          css={styles.titleInput}
          onChange={handelTitleRemarkOnChange}
          value={titleRemark}
          multiline
          rows={3}
        />
      </Card>
    </div>
  )
}

export default Overview
