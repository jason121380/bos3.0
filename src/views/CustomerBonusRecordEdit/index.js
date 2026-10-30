import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router'
import { useFetchGetCustomerBonusDepositRecord } from 'hooks/useFetchGetCustomerBonusDepositRecords'
import useFetchUpdateBonusDeposit from 'hooks/useFetchUpdateBonusDeposit'
import idx from 'idx'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutMerchantVendorCreate from './AboutCustomerBonusRecordEdit'
import QueryFailed from 'components/QueryFailed'

function CustomerBonusRecordCreate() {
  const { id } = useParams()
  const history = useHistory()
  const [isClick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    date: new Date().getTime(),
    designerId: '',
    customerId: '',
    bonus: 0,
    remark: ''
  })
  const { updateBonus } = useFetchUpdateBonusDeposit()
  const bonusDepositRecord = useFetchGetCustomerBonusDepositRecord({ bonusId: id })

  useEffect(() => {
    if (!bonusDepositRecord.loading) {
      const data = idx(bonusDepositRecord, _ => _.data.customerBonusDepositRecord)
      // 讀取失敗或查無紀錄時保留預設值（原本以 undefined 取代表單資料，整頁錯誤；Jason 2026/10/22 fix all）
      if (data) setSubmitData(data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [bonusDepositRecord.loading])

  const handleSubmitData = () => {
    setIsClick(true)
    if (!submitData.date) {
      openSnackbar({
        message: '日期格式有誤',
        variant: 'warning'
      })
      setIsClick(false)
    } else if (!submitData.designerId) {
      openSnackbar({
        message: '請選擇設計師',
        variant: 'warning'
      })
      setIsClick(false)
    } else if (!submitData.customerId) {
      openSnackbar({
        message: '請選擇顧客',
        variant: 'warning'
      })
      setIsClick(false)
    } else if (submitData.bonus === '') {
      openSnackbar({
        message: '請輸入點數',
        variant: 'warning'
      })
      setIsClick(false)
    } else {
      updateBonus({
        input: {
          bonusId: id,
          // 點數比照新增頁轉整數（輸入框改過後是字串；Jason 2026/10/22 fix all）
          bonusInput: { ...submitData, bonus: parseInt(submitData.bonus, 10) }
        }
      }).then(res => {
        if (res.data.updateBonusDeposit) {
          openSnackbar({
            message: '儲存成功',
            variant: 'success'
          })
          history.push('/customer-bonus-record')
        } else {
          openSnackbar({
            message: '儲存失敗',
            variant: 'error'
          })
          setIsClick(false)
        }
      }).catch(error => {
        setIsClick(false)
      })
    }
  }

  return (
    <Page className="ui-root" title="編輯紅利點數紀錄">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="編輯紅利點數紀錄" className="pb-0" />
        {bonusDepositRecord.error ? (
          <QueryFailed onRetry={() => bonusDepositRecord.refetch()} />
        ) : (
          <>
          <AboutMerchantVendorCreate
            submitData={submitData}
            setSubmitData={setSubmitData}
          />
          <div className="mt-6 flex justify-end">
            <Button
              disabled={isClick || bonusDepositRecord.loading}
              onClick={handleSubmitData}
              variant="primary"
            >
              儲存
            </Button>
          </div>
          </>
        )}
      </div>
    </Page>
  )
}

export default CustomerBonusRecordCreate