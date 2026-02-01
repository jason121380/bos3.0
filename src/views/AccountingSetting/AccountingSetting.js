/** @jsxImportSource @emotion/react */
import { Button, Container } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { openSnackbar } from 'elements/snackbars'
import idx from 'idx'
import { memo, useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import useFetchSettingAccountingType from 'hooks/useFetchSettingAccountingType'
import useFetchAccountingType from 'hooks/useFetchAccountingType'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchSettingAccountingSubjects from 'hooks/useFetchSettingAccountingSubjects'
import { theme } from '../../theme'
import { css } from '@emotion/react'

import AccountingItemCreate from './AccountingItemCreate'

const styles = {
  page: css({
    padding: theme.spacing(3),
  }),
  card: css({
    marginTop: theme.spacing(3),
  }),
  saveBtn: css({
    textAlign: 'right',
    marginTop: '20px',
  }),
}

function AccountingSetting() {
  const history = useHistory()
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
          })
          : [{ number: '', name: '' }]
      )

      setAccountingRevenueSubjects(
        revenueSubjectsInit.length > 0 ? revenueSubjectsInit : [{ number: '', name: '' }]
      )
      setAccountingExpenditureSubjects(
        expenditureSubjectsInit.length > 0 ? expenditureSubjectsInit : [{ number: '', name: '' }]
      )
      setAccountingType(accountingType)
    }
  }, [
    accountingTypeData.data,
    accountingTypeData.loading,
    accountingSubjectsData.data,
    accountingSubjectsData.loading,
  ])

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
    <Page css={styles.page} title="收支科目設定">
      <Container maxWidth="md">
        <PageTitle title='收支科目設定' subTitle='Accounting Setting' />
        <AccountingItemCreate
          accountingRevenueSubjects={accountingRevenueSubjects}
          setAccountingRevenueSubjects={setAccountingRevenueSubjects}
          accountingExpenditureSubjects={accountingExpenditureSubjects}
          setAccountingExpenditureSubjects={setAccountingExpenditureSubjects}
          accountingType={accountingType}
          setAccountingType={setAccountingType}
        />
        <div css={styles.saveBtn}>
          <Button color="primary" variant="contained" onClick={handleSave}>
            儲存
          </Button>
        </div>
      </Container>
    </Page>
  )
}

export default memo(AccountingSetting)
