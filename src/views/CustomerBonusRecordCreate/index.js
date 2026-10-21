import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import useFetchAddCustomerBonus from 'hooks/useFetchAddCustomerBonus'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutCustomerBonusRecordCreate from './AboutCustomerBonusRecordCreate'

function CustomerBonusRecordCreate() {
  const { id } = useParams()
  const history = useHistory()
  const [isClick, setIsClick] = useState(false)
  const [submitData, setSubmitData] = useState({
    date: new Date().getTime(),
    designerId: '',
    customerId: id ? id : '',
    bonus: 0,
    remark: ''
  })
  const { AddCustomerBonus } = useFetchAddCustomerBonus()
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
      AddCustomerBonus({
        input: { ...submitData, bonus: parseInt(submitData.bonus, 10) }
      }).then(res => {
        if (res.data.addCustomerBonus) {
          openSnackbar({
            message: '新增成功',
            variant: 'success'
          })
          history.push('/customer-bonus-record')
        } else {
          openSnackbar({
            message: '新增失敗',
            variant: 'error'
          })
          setIsClick(false)
        }
      }).catch(error => {
        openSnackbar({
          message: error.message,
          variant: 'error',
        })
        setIsClick(false)
      })
    }
  }

  return (
    <Page className="ui-root" title="新增紅利點數">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="新增紅利點數" className="pb-0" />
        <AboutCustomerBonusRecordCreate
          submitData={submitData}
          setSubmitData={setSubmitData}
        />
        <div className="mt-6 flex justify-end">
          <Button
            disabled={isClick}
            onClick={handleSubmitData}
            variant="primary"
          >
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}

export default CustomerBonusRecordCreate
