import { LoaderCircle } from 'lucide-react'
import { TextField } from 'ui/text-field'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import PaymentAutoComplete from 'components/PaymentAutoComplete'
import ThirdPartyAutoComplete from 'components/ThirdPartyAutoComplete'
import ServicesAutoComplete from 'components/ServicesAutoComplete'
import ProductAutoComplete from 'components/ProductAutoComplete'
import SourcesAutocomplete from 'components/SourcesAutocomplete'
import MemberShipCardAutoComplete from 'components/MemberShipCardAutoComplete'
import { useFetchGetCustomerReferenceLazy } from 'hooks/useFetchGetCustomerReference'
import useFetchAccountingType from 'hooks/useFetchAccountingType'
import idx from 'idx'
import React, { useState, useEffect, Fragment } from 'react'

import Subject from './Subject'
import { Autocomplete } from 'ui/combobox'

// 欄寬（原 emotion styles.field／fieldCustomer：min 180、max 180×1.5；fieldSources：min 180）。各 AutoComplete 以 className 套在根節點
const FIELD = 'min-w-[180px] max-w-[270px]'
const FIELD_SOURCES = 'min-w-[180px]'

export default function ({
  outside,
  values,
  onChange,
  visible,
  multiple,
  relationUserId,
  useInDecreaseDetailReport,
  getThirdPartyName
}) {
  // outside：每個條件各包一層 div（原格線 item，無欄寬、無間距）；否則直接放進 MerchantSearchBar 的 flex 列
  const Outter = outside ? 'div' : React.Fragment
  const [payType, setPayType] = useState([])
  const [getReferenceLazy, referenceLazyData] = useFetchGetCustomerReferenceLazy()
  const [sourceOption, setSourceOption] = useState([])
  const accountingTypeData = useFetchAccountingType({ input: 'GENERAL' })

  useEffect(() => {
    if (visible.includes('source') && sourceOption.length === 0) {
      getReferenceLazy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 刻意只在 [visible] 變動時執行；getReferenceLazy、sourceOption.length 只取觸發當下的值，補上會改變觸發時機或每次 render 重跑
  }, [visible])

  useEffect(() => {
    if (!referenceLazyData.loading && referenceLazyData.data) {
      // 後端回 null（沒有來源）時以空清單顯示，Autocomplete 拿到 null 會整頁壞（2026/10/22）
      const data = idx(referenceLazyData, _ => _.data.getCustomerReference) || []
      setSourceOption(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [referenceLazyData.loading])

  useEffect(() => {
    if (!accountingTypeData.loading) {
      // 查詢失敗或回 null 時以空清單顯示（同上）
      const payType = idx(accountingTypeData, _ => _.data.getAccountingType) || []
      setPayType(payType)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [accountingTypeData.loading])

  const input = {
    employee: function () {
      return (
        <EmployeeAutoComplete
          label={
            relationUserId
              ? '關係人編號/姓名'
              : useInDecreaseDetailReport
                ? '互助人編號/姓名'
                : '設計師編號/姓名'
          }
          value={multiple.employee ? values.designers : values.employeeId || values.relationUserId}
          onChange={value =>
            onChange({
              target: multiple.employee
                ? 'designers'
                : `${relationUserId ? 'relationUserId' : 'employeeId'}`,
              value: multiple.employee ? value : idx(value, _ => _.userId) || '',
            })
          }
          className={FIELD}
          multiple={multiple.employee}
        />
      )
    },
    customer: function () {
      return (
        <CustomerAutoComplete
          label="顧客編號/姓名"
          value={values.customerId}
          onChange={value => onChange({ target: 'customerId', value: idx(value, _ => _.id) })}
          className={FIELD}
        />
      )
    },
    subject: function () {
      return (
        <Subject
          className={FIELD}
          onChange={(event, option) => {
            onChange({
              target: 'accountingSubjectName',
              value: option?.name || '',
            })
          }}
          value={values.accountingSubjectName}
        />
      )
    },
    date: function () {
      return (
        <TextField
          label="日期"
          type="date"
          // defaultValue={format(new Date(values.date), 'yyyy-MM-dd')}
          // value={format(new Date(values.date), 'yyyy-MM-dd')}
          className={FIELD}
          fullWidth
          onChange={event =>
            onChange({
              target: 'date',
              value: idx(event, _ => new Date(_.target.value).getTime()) || new Date().getTime(),
            })
          }
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
      )
    },
    payment: function () {
      return (
        <PaymentAutoComplete
          label="其他付款方式"
          className={FIELD}
          value={values.payWay}
          name="payWay"
          onChange={value => {
            onChange({
              target: 'payWay',
              value: idx(value, _ => _.name) || [],
            })
          }}
        />
      )
    },
    payType: function () {
      return (
        <Autocomplete
          freeSolo
          className={FIELD}
          onChange={(event, values) => {
            onChange({
              target: 'payTypeKeyWord',
              value: values,
            })
          }}
          options={payType}
          autoHighlight
          getOptionLabel={option => option}
          renderOption={(props, option) => (
            <li {...props}>
              {option}
            </li>
          )}
          renderInput={params => (
            <TextField
              {...params}
              label="收付方式"
              fullWidth
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {accountingTypeData.loading ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" strokeWidth={1.75} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </Fragment>
                ),
              }}
            />
          )}
        />
      )
    },
    thirdPartyCoupon: function () {
      return (
        <ThirdPartyAutoComplete
          label="第三方卡券"
          className={FIELD}
          value={values.thirdPartTicketId}
          name="thirdPartyCoupon"
          onChange={value => {
            getThirdPartyName && onChange({
              target: 'thirdPartTicketName',
              value: idx(value, _ => _.name),
            })
            onChange({
              target: 'thirdPartTicketId',
              value: idx(value, _ => _.id),
            })
          }}
        />
      )
    },
    services: function () {
      return (
        <ServicesAutoComplete
          label="服務名稱/代號"
          className={FIELD}
          value={values.serviceIds}
          name="services"
          onFieldChange={() => {
            onChange({
              target: 'serviceIds',
              value: [],
            })
          }}
          onChange={value => {
            onChange({
              target: 'serviceIds',
              value: idx(value, _ => _.id),
            })
          }}
        />
      )
    },
    service: function () {
      return (
        <ServicesAutoComplete
          label="服務名稱/代號"
          className={FIELD}
          value={values.serviceId}
          name="service"
          onFieldChange={() => {
            onChange({
              target: 'serviceId',
              value: '',
            })
          }}
          onChange={value => {
            onChange({
              target: 'serviceId',
              value: idx(value, _ => _.id),
            })
          }}
        />
      )
    },
    product: function () {
      return (
        <ProductAutoComplete
          label="商品名稱"
          className={FIELD}
          value={values.productId}
          onChange={value => {
            onChange({
              target: 'productId',
              value: idx(value, _ => _.id),
            })
          }}
        />
      )
    },
    source: function () {
      return (
        <Autocomplete
          freeSolo
          className={FIELD}
          value={values.source || ''}
          disabled={referenceLazyData.loading}
          onChange={(event, values) => {
            onChange({
              target: 'source',
              value: values,
            })
          }}
          options={sourceOption}
          autoHighlight
          getOptionLabel={option => option}
          renderOption={(props, option) => <span {...props}>{option}</span>}
          renderInput={params => (
            <TextField
              {...params}
              label="帳單來源"
              fullWidth
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {params.InputProps.endAdornment}
                  </Fragment>
                ),
              }}
            />
          )}
        />
      )
    },
    sources: function () {
      return (
        <SourcesAutocomplete
          className={FIELD_SOURCES}
          value={values.source}
          onChange={value => {
            onChange({
              target: 'source',
              value: value,
            })
          }}
        />
      )
    },
    membershipcard: function () {
      return (
        <MemberShipCardAutoComplete
          className={FIELD_SOURCES}
          label="會員卡名稱/代號"
          value={values.membershipId}
          onChange={value => {
            onChange({
              target: 'membershipId',
              value: value ? value.uuid : null,
            })
          }}
        />
      )
    },
  }

  return visible.map((item, index) => {
    if (item === 'datePicker') return null
    return (
      <Outter key={'component' + index}>
        {input[item]()}
      </Outter>
    )
  })
}
