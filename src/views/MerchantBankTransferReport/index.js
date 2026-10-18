/** @jsxImportSource @emotion/react */
import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import useFetchMerchantBankSettings from 'hooks/useFetchMerchantBankSettings'
import DateSelector from 'components/DateSelector'
import subMonths from 'date-fns/subMonths'
import useFetchGetUserSalaryTransferReport from 'hooks/useFetchGetUserSalaryTransferReport'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import { Skeleton } from 'ui/skeleton'
// 本頁以 window.print() 列印整頁：TransferDetail（.TransferDetailpPrint）與 Results（.MerchantBankTransferReportTable）為列印內容，依列印範本規則保留
import TransferDetail from './TransferDetail'
import Results from './Results'

const styles = {
  root: css({
    minHeight: '100%',
  }),
  container: css({
    padding: theme.spacing(1.5),
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
      <div>
        <AdminPageHeader
          title='薪資轉帳明細'
          secondaryActions={[
            {
              label: '列印',
              onClick: () => window.print(),
              className: "noprint"
            }
          ]}
        >
          <DateSelector
            date={date}
            attributes={['lastmonth', 'thismonth', 'startDate']}
            dateChange={value => setDate(value)}
            onlyStart
            inputFormat='yyyy/MM'
            pickerOption={{
              views: ['month', 'year']
            }}
          />
        </AdminPageHeader>

        <div className="mt-6">
          <TransferDetail merchantBankSettings={merchantBankSettings} />
        </div>

        {getUserSalaryTransferReport.loading ? (
          <Skeleton className="h-64 w-full" />
        ) : <Results salaryData={salaryData} />}
      </div>
    </Page>
  )
}
