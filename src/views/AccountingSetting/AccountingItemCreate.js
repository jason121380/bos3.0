/** @jsxImportSource @emotion/react */
import { Field, Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Fragment } from 'react'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import { css } from '@emotion/react'

const styles = {
  content: css({
    display: 'flex',
    alignItems: 'flex-end',
    margin: '20px 0px',
  }),
  icons: css({
    cursor: 'pointer',
    margin: '0 10px 8px',
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>收入科目設定</CardTitle>
            </CardHeader>
            <CardContent>
              {accountingRevenueSubjects.map((data, index) => (
                <div css={styles.content} key={index}>
                  <Field label="代號" htmlFor={`revenueNumber-${index}`} className="mx-2.5 w-[100px]">
                    <Input
                      id={`revenueNumber-${index}`}
                      type="text"
                      name="revenueNumber"
                      value={data.number}
                      onChange={e => handleRevenueInput(e, index)}
                    />
                  </Field>
                  <Field label="名稱" htmlFor={`revenueName-${index}`}>
                    <Input
                      id={`revenueName-${index}`}
                      type="text"
                      name="revenueName"
                      value={data.name}
                      onChange={e => handleRevenueInput(e, index)}
                    />
                  </Field>
                  <DeleteForeverIcon
                    css={styles.icons}
                    onClick={() => handleDeleteItem('revenue', index)}
                  />
                  <AddIcon css={styles.icons} onClick={() => handleAddItem('revenue')} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>支出科目設定</CardTitle>
            </CardHeader>
            <CardContent>
              {accountingExpenditureSubjects.map((data, index) => (
                <div css={styles.content} key={index}>
                  <Field label="代號" htmlFor={`expenditureNumber-${index}`} className="mx-2.5 w-[100px]">
                    <Input
                      id={`expenditureNumber-${index}`}
                      type="text"
                      name="expenditureNumber"
                      value={data.number}
                      onChange={e => handleExpenditureInput(e, index)}
                    />
                  </Field>
                  <Field label="名稱" htmlFor={`expenditureName-${index}`}>
                    <Input
                      id={`expenditureName-${index}`}
                      type="text"
                      name="expenditureName"
                      value={data.name}
                      onChange={e => handleExpenditureInput(e, index)}
                    />
                  </Field>
                  <DeleteForeverIcon
                    css={styles.icons}
                    onClick={() => handleDeleteItem('expenditure', index)}
                  />
                  <AddIcon css={styles.icons} onClick={() => handleAddItem('expenditure')} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>收付方式設定</CardTitle>
            </CardHeader>
            <CardContent>
              {accountingType.map((data, index) => (
                <div css={styles.content} key={index}>
                  <Field
                    label="收付方式"
                    htmlFor={`accountingTypeName-${index}`}
                    className="w-[700px] max-w-full"
                  >
                    <Input
                      id={`accountingTypeName-${index}`}
                      type="text"
                      name="accountingTypeName"
                      value={data.accountingTypeName}
                      onChange={e => handleAccountingTypeInput(e, index)}
                    />
                  </Field>
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
        </div>
      </div>
    </Fragment>
  )
}
