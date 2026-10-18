/** @jsxImportSource @emotion/react */
import { Card, CardContent, CardHeader, Divider, Grid, TextField } from '@mui/material'
import { Fragment } from 'react'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import { css } from '@emotion/react'

const styles = {
  content: css({
    display: 'flex',
    alignItems: 'center',
    margin: '20px 0px',
  }),
  numberInput: css({
    width: '100px',
    margin: '0px 10px',
  }),
  accountingTypeInput: css({
    width: '700px',
  }),
  icons: css({
    cursor: 'pointer',
    margin: '0 10px',
  }),
}

export default function AccountingItemCreate({
  accountingRevenueSubjects,
  setAccountingRevenueSubjects,
  accountingExpenditureSubjects,
  setAccountingExpenditureSubjects,
  accountingType,
  setAccountingType,
}) {
  const handleAddItem = type => {
    switch (type) {
      case 'revenue':
        const newAccountingRevenueSubjects = _.cloneDeep(accountingRevenueSubjects)
        newAccountingRevenueSubjects.push({
          number: '',
          name: '',
        })
        setAccountingRevenueSubjects(newAccountingRevenueSubjects)
        break
      case 'expenditure':
        const newAccountingExpenditureSubjects = _.cloneDeep(accountingExpenditureSubjects)
        newAccountingExpenditureSubjects.push({
          number: '',
          name: '',
        })
        setAccountingExpenditureSubjects(newAccountingExpenditureSubjects)
        break
      case 'accountingType':
        const newAccountingType = _.cloneDeep(accountingType)
        newAccountingType.push({
          accountingTypeName: '',
        })
        setAccountingType(newAccountingType)
        break
      default:
        console.log(type)
        break
    }
  }

  const handleDeleteItem = (type, index) => {
    switch (type) {
      case 'revenue':
        const newAccountingRevenueSubjects = _.cloneDeep(accountingRevenueSubjects)
        newAccountingRevenueSubjects.splice(index, 1)
        setAccountingRevenueSubjects(newAccountingRevenueSubjects)
        break
      case 'expenditure':
        const newAccountingExpenditureSubjects = _.cloneDeep(accountingExpenditureSubjects)
        newAccountingExpenditureSubjects.splice(index, 1)
        setAccountingExpenditureSubjects(newAccountingExpenditureSubjects)
        break
      case 'accountingType':
        const newAccountingType = _.cloneDeep(accountingType)
        newAccountingType.splice(index, 1)
        setAccountingType(newAccountingType)
        break
      default:
        console.log(type)
        break
    }
  }

  const handleRevenueInput = (e, index) => {
    const newAccountingRevenueSubjects = _.cloneDeep(accountingRevenueSubjects)
    switch (e.target.name) {
      case 'revenueNumber':
        newAccountingRevenueSubjects.map((data, index2) => {
          if (index === index2) {
            data.number = e.target.value
          }
        })
        setAccountingRevenueSubjects(newAccountingRevenueSubjects)
        break
      case 'revenueName':
        newAccountingRevenueSubjects.map((data, index2) => {
          if (index === index2) {
            data.name = e.target.value
          }
        })
        setAccountingRevenueSubjects(newAccountingRevenueSubjects)
        break
      default:
        console.log(e.target)
        break
    }
  }

  const handleExpenditureInput = (e, index) => {
    const newAccountingExpenditureSubjects = _.cloneDeep(accountingExpenditureSubjects)
    switch (e.target.name) {
      case 'expenditureNumber':
        newAccountingExpenditureSubjects.map((data, index2) => {
          if (index === index2) {
            data.number = e.target.value
          }
        })
        setAccountingExpenditureSubjects(newAccountingExpenditureSubjects)
        break
      case 'expenditureName':
        newAccountingExpenditureSubjects.map((data, index2) => {
          if (index === index2) {
            data.name = e.target.value
          }
        })
        setAccountingExpenditureSubjects(newAccountingExpenditureSubjects)
        break
      default:
        console.log(e.target)
        break
    }
  }

  const handleAccountingTypeInput = (e, index) => {
    const newAccountingType = _.cloneDeep(accountingType)
    newAccountingType.map((data, index2) => {
      if (index === index2) {
        data.accountingTypeName = e.target.value
      }
    })
    setAccountingType(newAccountingType)
  }

  return (
    <Fragment>
      <Grid container spacing={3} style={{ marginTop: '8px' }}>
        <Grid item md={6} xs={12}>
          <Card>
            <CardHeader title="收入科目設定" />
            <Divider />
            <CardContent>
              {accountingRevenueSubjects.map((data, index) => (
                <div css={styles.content} key={index}>
                  <TextField
                    label="代號"
                    variant="outlined"
                    type="text"
                    name="revenueNumber"
                    css={styles.numberInput}
                    value={data.number}
                    onChange={e => handleRevenueInput(e, index)}
                  />
                  <TextField
                    label="名稱"
                    variant="outlined"
                    type="text"
                    name="revenueName"
                    value={data.name}
                    onChange={e => handleRevenueInput(e, index)}
                  />
                  <DeleteForeverIcon
                    css={styles.icons}
                    onClick={() => handleDeleteItem('revenue', index)}
                  />
                  <AddIcon css={styles.icons} onClick={() => handleAddItem('revenue')} />
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={6} xs={12}>
          <Card>
            <CardHeader title="支出科目設定" />
            <Divider />
            <CardContent>
              {accountingExpenditureSubjects.map((data, index) => (
                <div css={styles.content} key={index}>
                  <TextField
                    label="代號"
                    variant="outlined"
                    type="text"
                    name="expenditureNumber"
                    css={styles.numberInput}
                    value={data.number}
                    onChange={e => handleExpenditureInput(e, index)}
                  />
                  <TextField
                    label="名稱"
                    variant="outlined"
                    type="text"
                    name="expenditureName"
                    value={data.name}
                    onChange={e => handleExpenditureInput(e, index)}
                  />
                  <DeleteForeverIcon
                    css={styles.icons}
                    onClick={() => handleDeleteItem('expenditure', index)}
                  />
                  <AddIcon css={styles.icons} onClick={() => handleAddItem('expenditure')} />
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title="收付方式設定" />
            <Divider />
            <CardContent>
              {accountingType.map((data, index) => (
                <div css={styles.content} key={index}>
                  <TextField
                    css={styles.accountingTypeInput}
                    label="收付方式"
                    variant="outlined"
                    type="text"
                    name="accountingTypeName"
                    fullWidth
                    value={data.accountingTypeName}
                    onChange={e => handleAccountingTypeInput(e, index)}
                  />
                  <DeleteForeverIcon
                    css={styles.icons}
                    onClick={() => handleDeleteItem('accountingType', index)}
                  />
                  <AddIcon
                    css={styles.icons}
                    onClick={() => handleAddItem('accountingType')}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  )
}
