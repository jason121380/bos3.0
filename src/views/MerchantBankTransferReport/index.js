import Page from 'components/Page'
import AdminPageHeader from 'components/AdminPageHeader'
import idx from 'idx'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import useFetchMerchantBankSettings from 'hooks/useFetchMerchantBankSettings'
import DateSelector from 'components/DateSelector'
import subMonths from 'date-fns/subMonths'
import useFetchGetUserSalaryTransferReport from 'hooks/useFetchGetUserSalaryTransferReport'

import { Skeleton } from 'ui/skeleton'
import { Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Toolbar } from 'ui/page-header'
// 本頁以 window.print() 列印整頁：TransferDetail（.TransferDetailpPrint）與 Results（.MerchantBankTransferReportTable）為列印內容，依列印範本規則保留
import TransferDetail from './TransferDetail'
import Results from './Results'

// 銀行設定尚未建立（null）或查詢失敗時的空白設定（申請書欄位留白，不讓整頁拋錯；Jason 2026/10/22）
const EMPTY_BANK_SETTINGS = {
  remitterBankAccount: '',
  remitterBankBranchCode: '',
  remitterBankName: '',
  remitterBankBranchName: '',
  remitterName: '',
  trustorName: '',
  trustorPhone: '',
}

export default function MerchantBankTransferReport() {
  const [date, setDate] = useState({
    startDate: subMonths(new Date(), 1).getTime(),
  })

  const [merchantBankSettings, setMerchantBankSettings] = useState(EMPTY_BANK_SETTINGS)
  const [salaryData, setSalaryData] = useState([])
  const merchantBankSettingsData = useFetchMerchantBankSettings()
  const getUserSalaryTransferReport = useFetchGetUserSalaryTransferReport({ date: date.startDate })

  useEffect(() => {
    if (!getUserSalaryTransferReport.loading) {
      const data = idx(
        getUserSalaryTransferReport,
        _ => _.data.userSalaryTransferReport
      )
      setSalaryData(data || [])
    }
  }, [getUserSalaryTransferReport.loading])

  useEffect(() => {
    if (!merchantBankSettingsData.loading) {
      const merchantBankSettings = idx(
        merchantBankSettingsData,
        _ => _.data.getMerchantBankSettings
      )
      setMerchantBankSettings(merchantBankSettings || EMPTY_BANK_SETTINGS)
    }
  }, [merchantBankSettingsData.loading])

  return (
    <Page className='MerchantBankTransferReport min-h-full' title="薪資轉帳明細">
      <div>
        <AdminPageHeader title='薪資轉帳明細'>
          <Button
            variant="secondary"
            className="noprint"
            onClick={() => window.print()}
          >
            <Printer strokeWidth={1.75} />
            列印
          </Button>
        </AdminPageHeader>
        <Toolbar>
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
        </Toolbar>

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
