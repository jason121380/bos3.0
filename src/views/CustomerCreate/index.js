import Page from 'components/Page'
import { openSnackbar } from 'elements/snackbars'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import idx from 'idx'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchGetLastCustomerNo from 'hooks/useFetchGetLastCustomerNo'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

import AboutCustomer from './AboutCustomer'


export default function Customer() {
  const history = useHistory()
  const { addCustomer } = useFetchAddCustomer()
  const lastCustomerNo = useFetchGetLastCustomerNo()
  const [lastNo, setLastNo] = React.useState(null)
  const [birthdayObj, setBirthdayObj] = React.useState({
    year: '',
    month: '',
    day: '',
  })
  const [customer, setCustomer] = React.useState({
    category: '',
    no: '',
    name: '',
    nickName: '',
    cellphone: '',
    birthday: null,
    PreferDesignerId: '',
    OfficialBrandMerchantId: localStorage.getItem('userMerchant')
      ? JSON.parse(localStorage.getItem('userMerchant')).id
      : null,
    email: '',
    address: '',
    gender: 'MALE',
    lineId: '',
    source: '',
    remark: ''
  })
  const [disableAfterSubmit, setDisableAfterSubmit] = useState(false)
  const vaild = !customer.cellphone

  const handleOnChange = ({ key, event }) => {
    if (event && event.persist) event.persist()
    switch (key) {
      case 'birthday':
        setCustomer(
          produce(draft => {
            draft[key] = new Date(event).getTime()
          })
        )
        break
      default:
        setCustomer(
          produce(draft => {
            draft[key] = idx(event, _ => _.target.value)
          })
        )
        break
    }
  }

  const handleBirthdayChange = e => {
    switch (e.target.name) {
      case 'year':
        if (e.target.value.length <= 3) {
          setBirthdayObj({ ...birthdayObj, year: e.target.value })
        }
        break
      case 'month':
        if (parseInt(e.target.value, 10) <= 12 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, month: e.target.value })
        }
        break
      case 'day':
        if (parseInt(e.target.value, 10) <= 31 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, day: e.target.value })
        }
        break
      default:
        break
    }
  }

  const handleOnClick = () => {
    setDisableAfterSubmit(true)
    const _customer = cloneDeep(customer)
    const newCustomer = { ..._customer, birthday: birthdayObj }
    addCustomer({
      input: newCustomer.DesignerId
        ? newCustomer
        : delete newCustomer.DesignerId
          ? newCustomer
          : newCustomer,
    }).then(() => {
      openSnackbar({
        message: '成功新增客戶',
        variant: 'success',
      })
      history.push('/management/customers')
      setDisableAfterSubmit(false)
    }).catch((error) => {
      setDisableAfterSubmit(false)
    })
  }

  useEffect(() => {
    if (!lastCustomerNo.loading) {
      const data = idx(lastCustomerNo, _ => _.data.getLastCustomerNo)
      setLastNo(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [lastCustomerNo.loading])

  return (
    <Page className="ui-root" title="新增客戶">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="新增客戶" />
        <AboutCustomer
          onChange={handleOnChange}
          customer={customer}
          lastNo={lastNo}
          isLoading={lastCustomerNo.loading}
          submitting={disableAfterSubmit}
          birthdayObj={birthdayObj}
          handleOnClick={handleOnClick}
          handleBirthdayChange={handleBirthdayChange}
        />
        <div className="flex justify-end pt-6">
          <Button variant="primary" onClick={handleOnClick} disabled={vaild || disableAfterSubmit}>
            新增
          </Button>
        </div>
      </div>
    </Page>
  )
}
