/** @jsxImportSource @emotion/react */
import { Container } from '@mui/material'
import { CircularProgress } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import idx from 'idx'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import useFetchMerchantBankSettings from 'hooks/useFetchMerchantBankSettings'
import DateSelector from 'components/DateSelector'
import subMonths from 'date-fns/subMonths'
import useFetchGetUserSalaryTransferReport from 'hooks/useFetchGetUserSalaryTransferReport'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import TransferDetail from './TransferDetail'
import Results from './Results'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  results: css({
    marginTop: theme.spacing(3),
  }),
}

export default function MerchantBankTransferReport() {
  const [date, setDate] = useState({
    startDate: subMonths(new Date(), 1).getTime(),
  })

  const [merchantBankSettings, setMerchantBankSettings] = useState({
    remitterBankAccount: '',
    remitterBankBranchCode: '',
    remitterBankName: '',
    remitterBankBranchName: '',
    remitterName: '',
    trustorName: '',
    trustorPhone: '',
  })
  const [salaryData, setSalaryData] = useState([])
  const merchantBankSettingsData = useFetchMerchantBankSettings()
  const getUserSalaryTransferReport = useFetchGetUserSalaryTransferReport({ date: date.startDate })

  useEffect(() => {
    if (!getUserSalaryTransferReport.loading) {
      const data = idx(
        getUserSalaryTransferReport,
        _ => _.data.userSalaryTransferReport
      )
      setSalaryData(data)
    }
  }, [getUserSalaryTransferReport.loading])

  useEffect(() => {
    if (!merchantBankSettingsData.loading) {
      const merchantBankSettings = idx(
        merchantBankSettingsData,
        _ => _.data.getMerchantBankSettings
      )
      setMerchantBankSettings(merchantBankSettings)
    }
  }, [merchantBankSettingsData.loading])

  return (
    <Page css={styles.root} className='MerchantBankTransferReport' title="薪資轉帳明細">
      <Container maxWidth={false}>
        <div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
          <div className="merchantNamePrint">
            {JSON.parse(localStorage.getItem('userMerchant')).name +
              '   ' +
              format(new Date(date.startDate), 'yyyy-MM').toLocaleString() +
              '   ' +
              '薪資轉帳明細'}
          </div>
          <div className="merchantNamePrint">
            {'列印時間： ' +
              format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
          </div>
        </div>
        <PageTitle title='薪資轉帳明細' subTitle='Merchant Bank Transfer Report' />
        <DateSelector
          date={date}
          attributes={['lastmonth', 'thismonth', 'startDate']}
          dateChange={value => setDate(value)}
          onlyStart
          margin
          inputFormat='yyyy/MM'
          pickerOption={{
            views: ['month', 'year']
          }}
        />
        <TransferDetail merchantBankSettings={merchantBankSettings} />
        {getUserSalaryTransferReport.loading ? (
          <div style={{ textAlign: 'center', marginTop: 100 }}><CircularProgress /></div>
        ) : <Results salaryData={salaryData} />}
      </Container>
    </Page>
  )
}
