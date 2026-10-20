/** @jsxImportSource @emotion/react */
import { Grid } from 'ui/grid-compat'
import { TextField } from 'ui/text-field'
import { CircularProgress } from '@mui/material'
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
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Subject from './Subject'
import { Autocomplete } from 'ui/combobox'

const styles = {
  container: css({
    display: 'flex',
    alignItems: 'center',
    margin: theme.spacing(1, 0, 0, 0),
  }),
  search: css({
    flexGrow: 1,
    maxWidth: 480,
    flexBasis: 480,
  }),
  field: css({
    minWidth: '180px',
    maxWidth: 180 * 1.5 + 'px',
    // marginLeft: theme.spacing(2),
  }),
  filterButton: css({
    marginLeft: 'auto',
  }),
  filterIcon: css({
    marginRight: theme.spacing(1),
  }),
  fieldCustomer: css({
    minWidth: '180px',
    maxWidth: 180 * 1.5 + 'px',
    // marginLeft: theme.spacing(2),
  }),
  fieldSources: {
    minWidth: '180px'
  },
}

export default function ({
  outside,
  values,
  onChange,
  initial,
  visible,
  multiple,
  relationUserId,
  useInDecreaseDetailReport,
  getThirdPartyName
}) {
  const Outter = outside ? Grid : React.Fragment
  const [payType, setPayType] = useState([])
  const [getReferenceLazy, referenceLazyData] = useFetchGetCustomerReferenceLazy()
  const [sourceOption, setSourceOption] = useState([])
  const accountingTypeData = useFetchAccountingType({ input: 'GENERAL' })

  useEffect(() => {
    if (visible.includes('source') && sourceOption.length === 0) {
      getReferenceLazy()
    }
  }, [visible])

  useEffect(() => {
    if (!referenceLazyData.loading && referenceLazyData.data) {
      const data = idx(referenceLazyData, _ => _.data.getCustomerReference)
      setSourceOption(data)
    }
  }, [referenceLazyData.loading])

  useEffect(() => {
    if (!accountingTypeData.loading) {
      const payType = idx(accountingTypeData, _ => _.data.getAccountingType)
      setPayType(payType)
    }
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
          className={styles.field}
          initFirst={initial.employee}
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
          className={styles.fieldCustomer}
        />
      )
    },
    subject: function () {
      return (
        <Subject
          className={styles.field}
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
          css={styles.field}
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
          className={styles.field}
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
          css={styles.field}
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
                      <CircularProgress color="inherit" size={20} />
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
          className={styles.field}
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
          className={styles.field}
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
          className={styles.fieldCustomer}
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
          className={styles.fieldCustomer}
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
          css={styles.field}
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
              label="訂單來源"
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
          className={styles.fieldSources}
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
          className={styles.fieldSources}
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

  const rest = outside
    ? {
      item: true,
    }
    : null

  return visible.map((item, index) => {
    if (item === 'datePicker') return null
    return (
      <Outter {...rest} key={'component' + index}>
        {input[item]()}
      </Outter>
    )
  })
}
