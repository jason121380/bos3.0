import { Field, Input } from 'ui/input'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { Fragment } from 'react'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'


export default function AccountingItemCreate({
  activeSection,
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
      {/* 設定頁樣板（STYLE §12）：三區以 hidden 保留掛載不卸載，切換不重置編輯中欄位；卡片內欄位與 handler 原樣 */}
      <div className={activeSection && activeSection !== 'revenue' ? 'hidden' : ''}>
          <Card>
            <CardHeader>
              <CardTitle>收入科目設定</CardTitle>
            </CardHeader>
            <CardContent>
              {accountingRevenueSubjects.map((data, index) => (
                <div className="my-[20px] flex items-end" key={index}>
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
                    className="mx-[10px] mb-[8px] cursor-pointer"
                    onClick={() => handleDeleteItem('revenue', index)}
                  />
                  <AddIcon className="mx-[10px] mb-[8px] cursor-pointer" onClick={() => handleAddItem('revenue')} />
                </div>
              ))}
            </CardContent>
          </Card>
      </div>
      <div className={activeSection === 'expenditure' ? '' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>支出科目設定</CardTitle>
            </CardHeader>
            <CardContent>
              {accountingExpenditureSubjects.map((data, index) => (
                <div className="my-[20px] flex items-end" key={index}>
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
                    className="mx-[10px] mb-[8px] cursor-pointer"
                    onClick={() => handleDeleteItem('expenditure', index)}
                  />
                  <AddIcon className="mx-[10px] mb-[8px] cursor-pointer" onClick={() => handleAddItem('expenditure')} />
                </div>
              ))}
            </CardContent>
          </Card>
      </div>
      <div className={activeSection === 'accountingType' ? '' : 'hidden'}>
          <Card>
            <CardHeader>
              <CardTitle>收付方式設定</CardTitle>
            </CardHeader>
            <CardContent>
              {accountingType.map((data, index) => (
                <div className="my-[20px] flex items-end" key={index}>
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
                    className="mx-[10px] mb-[8px] cursor-pointer"
                    onClick={() => handleDeleteItem('accountingType', index)}
                  />
                  <AddIcon
                    className="mx-[10px] mb-[8px] cursor-pointer"
                    onClick={() => handleAddItem('accountingType')}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
      </div>
    </Fragment>
  )
}
