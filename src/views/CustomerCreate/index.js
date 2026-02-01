/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import useFetchAddCustomer from 'hooks/useFetchAddCustomer'
import idx from 'idx'
import produce from 'immer'
import _ from 'lodash'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchGetLastCustomerNo from 'hooks/useFetchGetLastCustomerNo'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AboutCustomer from './AboutCustomer'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  about: css({
    marginTop: theme.spacing(3),
  }),
  actions: css({
    marginTop: theme.spacing(3),
  }),
}

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
        if (parseInt(e.target.value) <= 12 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, month: e.target.value })
        }
        break
      case 'day':
        if (parseInt(e.target.value) <= 31 || e.target.value === '') {
          setBirthdayObj({ ...birthdayObj, day: e.target.value })
        }
        break
      default:
        break
    }
  }

  const handleOnClick = () => {
    setDisableAfterSubmit(true)
    const _customer = _.cloneDeep(customer)
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
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setDisableAfterSubmit(false)
    })
  }

  useEffect(() => {
    if (!lastCustomerNo.loading) {
      const data = idx(lastCustomerNo, _ => _.data.getLastCustomerNo)
      setLastNo(data)
    }
  }, [lastCustomerNo.loading])

  return (
    <Page css={styles.root} title="新增客戶">
      <Container maxWidth="md">
        <PageTitle title='新增客戶' subTitle='Create Customer' />
        <AboutCustomer
          className={styles.about}
          onChange={handleOnChange}
          customer={customer}
          lastNo={lastNo}
          isLoading={lastCustomerNo.loading}
          birthdayObj={birthdayObj}
          handleOnClick={handleOnClick}
          handleBirthdayChange={handleBirthdayChange}
        />
        <div css={styles.actions}>
          <Button color="primary" variant="contained" onClick={handleOnClick} disabled={vaild || disableAfterSubmit}>
            新增
          </Button>
        </div>
      </Container>
    </Page>
  )
}
