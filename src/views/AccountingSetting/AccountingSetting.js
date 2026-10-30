import Page from 'components/Page'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { memo, useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchSettingAccountingType from 'hooks/useFetchSettingAccountingType'
import useFetchAccountingType from 'hooks/useFetchAccountingType'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchSettingAccountingSubjects from 'hooks/useFetchSettingAccountingSubjects'

import { Tabs } from 'ui/tabs'
import { SettingsTabsList, SettingsTabsTrigger, SettingsSectionHeading } from 'ui/settings-nav'
import { CircleDollarSign, TrendingDown, TrendingUp } from 'lucide-react'

import AccountingItemCreate from './AccountingItemCreate'

function AccountingSetting() {
  const history = useHistory()
  // 設定頁樣板（STYLE §12）：本頁原無分頁、三區直疊；新增的 selectTab 只管呈現。
  // 三區以 hidden 保留掛載（見 AccountingItemCreate），全域儲存 handleSave 與存值一字未動。
  const [selectTab, setSelectTab] = useState('revenue')
  const handleTabsChange = (event, value) => setSelectTab(value)
  const tabs = [
    { value: 'revenue', label: '收入科目設定', icon: TrendingUp },
    { value: 'expenditure', label: '支出科目設定', icon: TrendingDown },
    { value: 'accountingType', label: '收付方式設定', icon: CircleDollarSign },
  ]
  const [accountingRevenueSubjects, setAccountingRevenueSubjects] = useState([
    {
      number: '',
      name: '',
    },
  ])
  const [accountingExpenditureSubjects, setAccountingExpenditureSubjects] = useState([
    {
      number: '',
      name: '',
    },
  ])
  const [accountingType, setAccountingType] = useState([
    {
      accountingTypeName: '',
    },
  ])

  const { setAccountSubjects } = useFetchSettingAccountingSubjects()
  const { setAccountType } = useFetchSettingAccountingType()
  const accountingTypeData = useFetchAccountingType({})
  const accountingSubjectsData = useFetchAccountingSubjects()

  useEffect(() => {
    if (!accountingTypeData.loading && !accountingSubjectsData.loading) {
      const accountingType = idx(accountingTypeData, _ =>
        _.data.getAccountingType.length > 0
          ? _.data.getAccountingType.map(data => {
            return {
              accountingTypeName: data,
            }
          })
          : [{ accountingTypeName: '' }]
      )

      const revenueSubjectsInit = []
      const expenditureSubjectsInit = []
      idx(accountingSubjectsData, _ =>
        _.data.accountingSubjects.length > 0
          ? _.data.accountingSubjects.map(data => {
            if (data.isUsing === true) {
              if (data.inoutType === 'REVENUE') {
                revenueSubjectsInit.push({
                  number: data.number,
                  name: data.name,
                })
              } else {
                expenditureSubjectsInit.push({
                  number: data.number,
                  name: data.name,
                })
              }
            }
            return undefined
          })
          : [{ number: '', name: '' }]
      )

      setAccountingRevenueSubjects(
        revenueSubjectsInit.length > 0 ? revenueSubjectsInit : [{ number: '', name: '' }]
      )
      setAccountingExpenditureSubjects(
        expenditureSubjectsInit.length > 0 ? expenditureSubjectsInit : [{ number: '', name: '' }]
      )
      // 收付方式查詢失敗時留一列空白（同科目查詢失敗），不整頁錯誤（Jason 2026/10/22）
      setAccountingType(accountingType || [{ accountingTypeName: '' }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [
    accountingTypeData.data,
    accountingTypeData.loading,
    accountingSubjectsData.data,
    accountingSubjectsData.loading,
  ])

  // 科目或收付方式查詢失敗時畫面只有空白列，此時儲存會把設定存成空白：停用儲存（Jason 2026/10/22「照建議」）
  const loadFailed = Boolean(accountingTypeData.error || accountingSubjectsData.error)

  const handleSave = () => {
    const accountSubjectsInputData = {
      revenue: accountingRevenueSubjects,
      expenditure: accountingExpenditureSubjects,
    }
    setAccountSubjects({ input: accountSubjectsInputData })
      .then(() => {
        accountingSubjectsData.refetch()
      })
      .catch(err => console.log(err.message))

    const accountTypeData = accountingType
      .map(data => data.accountingTypeName)
      .filter(data => data !== '')

    setAccountType({ typeList: accountTypeData })
      .then(() => accountingTypeData.refetch())
      .catch(err => console.log(err.message))
    openSnackbar({ message: '儲存成功!', variant: 'success' })
    history.push('/accountingSetting')
  }

  return (
    <Page className="ui-root" title="收支科目設定">
      <div className="mx-auto w-full max-w-6xl">
        <PageHeader title="收支科目設定" />
        <Tabs
          className="md:flex md:items-stretch"
          value={selectTab}
          onValueChange={value => handleTabsChange(null, value)}
          activationMode="manual"
        >
          <SettingsTabsList>
            {tabs.map((tab, index) => (
              <SettingsTabsTrigger key={index} value={tab.value} icon={tab.icon}>{tab.label}</SettingsTabsTrigger>
            ))}
          </SettingsTabsList>
          <div className="min-w-0 flex-1 md:bg-background md:px-6 md:py-6">
            <SettingsSectionHeading title={tabs.find(tab => tab.value === selectTab)?.label} />
            <AccountingItemCreate
              activeSection={selectTab}
              accountingRevenueSubjects={accountingRevenueSubjects}
              setAccountingRevenueSubjects={setAccountingRevenueSubjects}
              accountingExpenditureSubjects={accountingExpenditureSubjects}
              setAccountingExpenditureSubjects={setAccountingExpenditureSubjects}
              accountingType={accountingType}
              setAccountingType={setAccountingType}
            />
          </div>
        </Tabs>
        <div className="mt-6 flex items-center justify-end gap-3">
          {loadFailed && (
            <p className="m-0 text-label text-danger" role="alert">
              收支科目或收付方式讀取失敗，請重新整理後再設定
            </p>
          )}
          <Button variant="primary" disabled={loadFailed} onClick={handleSave}>
            儲存
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default memo(AccountingSetting)
