// 表單控制項（日期、收支切換、科目／人員／收付方式 Autocomplete、備註快捷 Select、金額與備註 TextField）
// 使用正式 ui 元件：皆以 ref 串接 Enter 鍵焦點流程（樣式由正式 ui 元件提供）
import { Input, TextField, InputAdornment } from 'ui/text-field'
import { FormControl, MenuItem, InputLabel, Select } from 'ui/form-control'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import { Copy } from 'lucide-react'
import { MobileDatePicker } from 'ui/date-picker'
import AccountingSubjectsAutocomplete from 'components/AccountingSubjectsAutocomplete'
import useFetchAccountingType from 'hooks/useFetchAccountingType'
import idx from 'idx'
import React, { useState, Fragment, useEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchCreateMoneyFlow from 'hooks/useFetchCreateMoneyFlow'
import format from 'date-fns/format'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

import AccountingSubjectModal from './AccountingSubjectModal'
import { Autocomplete } from 'ui/combobox'

function Summary({ stayInCreateAccount, ...rest }) {
  const history = useHistory()

  const location = useLocation()
  const [date, setDate] = useState(new Date().getTime())
  const [openAccountingSubjectModal, setOpenAccountingSubjectModal] = useState(false)
  const [amount, setAmount] = useState(null)
  const [accountingSubject, setAccountingSubjects] = useState(null)
  const [inoutType, setInoutType] = useState(null)
  const [walletType, setWalletType] = useState({ title: '轉帳', value: '轉帳' })
  const [userId, setUserId] = useState(null)
  const [relationUserId, setRelationUserId] = useState(null)
  const [remark, setRemark] = useState('')
  const [accountingType, setAccountingType] = useState()
  const accountingTypeData = useFetchAccountingType({ input: 'MANAGER' })
  const [revenueSubjects, setRevenueSubjects] = useState([])
  const [expenditureSubjects, setExpenditureSubjects] = useState([])
  const accountingSubjects = useFetchAccountingSubjects()
  const users = useFetchUsersForCreatePicking()
  const { createMoneyFlow } = useFetchCreateMoneyFlow()

  const [focus, setFocus] = useState('')

  const type1Ref = useRef()
  const type2Ref = useRef()
  const accountRef = useRef()
  const priceRef = useRef()
  const relationRef = useRef()
  const designerRef = useRef()
  const payTypeRef = useRef()
  const remarkItemRef = useRef()
  const remarkRef = useRef()

  useEffect(() => {
    switch (focus) {
      case 'type1':
        type1Ref.current.focus()
        break;
      case 'type2':
        type2Ref.current.focus()
        break;
      case 'account':
        accountRef.current.focus()
        break;
      case 'price':
        priceRef.current.focus()
        priceRef.current.select()
        break;
      case 'relation':
        relationRef.current.focus()
        break;
      case 'designer':
        designerRef.current.focus()
        break;
      case 'payType':
        payTypeRef.current.focus()
        break;
      case 'remarkItem':
        remarkItemRef.current.focus()
        break;
      case 'remark':
        remarkRef.current.focus()
        break;
      default:
        break;
    }
  }, [focus])

  useEffect(() => {
    if (!accountingSubjects.loading) {
      const revenueInit = []
      const expenditureInit = []
      idx(accountingSubjects, _ =>
        _.data.accountingSubjects.map(d => {
          if (d.isUsing === true) {
            if (d.inoutType === 'REVENUE') {
              revenueInit.push({
                title: d.name,
                value: d.id,
                number: d.number,
                inoutType: d.inoutType,
              })
            } else {
              expenditureInit.push({
                title: d.name,
                value: d.id,
                number: d.number,
                inoutType: d.inoutType,
              })
            }
          }
          return undefined
        })
      )
      setRevenueSubjects(revenueInit)
      setExpenditureSubjects(expenditureInit)
    }
  }, [accountingSubjects.loading])
  const [isClick, setIsClick] = useState(false)
  var valid = !(amount !== null && amount !== '' && accountingSubject && inoutType && walletType)
  useEffect(() => {
    if (accountingTypeData.data && !accountingTypeData.loading) {
      const accountingType = idx(accountingTypeData, _ =>
        _.data.getAccountingType.length > 0
          ? _.data.getAccountingType.map(data => {
            return {
              title: data,
              value: data,
            }
          })
          : [
            {
              title: '請至收支科目設定中新增收付方式',
              value: '請至收支科目設定中新增收付方式',
            },
          ]
      )
      setAccountingType(accountingType)
    }
  }, [accountingTypeData.data, accountingTypeData.loading])

  const Submit = async () => {
    const variables = {
      date: new Date(date).getTime(),
      amount: +amount,
      walletType: walletType.value,
      remark: remark,
      accountingSubjectId: accountingSubject.value,
      accountingSubjectName: accountingSubject.title,
      relationUserId: relationUserId,
    }

    if (userId) {
      variables.userId = userId
    }
    setIsClick(true)
    window.removeEventListener('keydown', keyDownSubmit)

    try {
      const res = await createMoneyFlow(variables)
      if (res.data.createMoneyFlow) {
        openSnackbar({ message: '新增收借支成功', variant: 'success' })
        if (stayInCreateAccount) {
          if (location.search.split('=')[1] !== undefined) {
            window.location.href = `/accounting/create?date=${location.search.split('=')[1]}`
          } else {
            window.location.href = '/accounting/create'
          }
        } else {
          history.push('/accounting/records')
        }
      } else throw new Error('新增收借支失敗')
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      window.addEventListener('keydown', keyDownSubmit)
      setIsClick(false)
    }
  }

  const keyDownSubmit = event => {
    if (event.key === 'F8') {
      if (accountingSubject != null && amount && inoutType) {
        Submit()
      }
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', keyDownSubmit)
    return () => {
      window.removeEventListener('keydown', keyDownSubmit)
    }
    // F8 送出時要讀到最新的日期、登錄者、收付方式、關係人、備註：這些改變時也重新註冊（Jason 2026/10/22）
  }, [accountingSubject, amount, inoutType, date, walletType, userId, relationUserId, remark, stayInCreateAccount, location])

  const employeeOptions =
    idx(users, _ =>
      _.data.users.users.map(d => {
        return {
          title: d.name,
          value: d.id,
          designerNo: d.designerNo,
        }
      })
    ) || []

  const selectedEmployee =
    idx(users, _ => employeeOptions.find(d => d.value === userId)) || null
  const selectedrelationUser =
    idx(users, _ => employeeOptions.find(d => d.value === relationUserId)) || null
  const handleOpenModal = () => {
    setOpenAccountingSubjectModal(!openAccountingSubjectModal)
  }
  const handleCloseModal = () => {
    setOpenAccountingSubjectModal(false)
  }

  React.useEffect(() => {
    if (location.search.split('=')[1] !== undefined) {
      history.push(`/accounting/create?date=${location.search.split('=')[1]}`)
      setDate(Number(location.search.split('=')[1]))
    }
  }, [history])
  // 備註快捷

  const remarkItem = [
    { value: '員工自購管理處貨品', label: '員工自購管理處貨品' },
    { value: '廣告預收款', label: '廣告預收款' },
    { value: '龍豪', label: '龍豪' },
    { value: '學費-用具代墊', label: '學費-用具代墊' },
    { value: '勞退新制提撥', label: '勞退新制提撥' },
    { value: '勞健保費用', label: '勞健保費用' },
    { value: '九太-公播權', label: '九太-公播權' },
    { value: '管理處貨款', label: '管理處貨款' },
    { value: '聖馥月貨款', label: '聖馥月貨款' },
    { value: '漂粉貨款', label: '漂粉貨款' },
    { value: '補會議電費款', label: '補會議電費款' },
    { value: '國家月貨款', label: '國家月貨款' },
    { value: '芬達斯月貨款', label: '芬達斯月貨款' },
    { value: '保德順月貨款', label: '保德順月貨款' },
    { value: '玉岫月貨款', label: '玉岫月貨款' },
    { value: '鴻果月貨款', label: '鴻果月貨款' },
    { value: '二代健保', label: '二代健保' },
    { value: '員工借資(其他)', label: '員工借資(其他)' },
  ]
  const onChange = event => {
    setRemark(event.target.value)
  }

  const selectInoutType = completed => {
    if (completed === null) {
      openSnackbar({ message: '請選擇科目', variant: 'warning' })
    } else {
      setAccountingSubjects(completed)
      setInoutType(completed.inoutType)
    }
  }
  return (
    <div>
      <Card {...rest}>
        <CardHeader>
          <CardTitle>一般</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <MobileDatePicker
              closeOnSelect
              label='開單日期'
              value={date}
              onChange={value => {
                history.push(`/accounting/create?date=${new Date(value).getTime()}`)
                setDate(new Date(value).getTime())
              }}
              format="yyyy/MM/dd"
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'M月d日'
                }
              }}
              slots={{
                field: inputProps => (
                  <FormControl variant="filled">
                    <InputLabel htmlFor="date-picker">開單日期</InputLabel>
                    <Input
                      id="date-picker"
                      type='text'
                      onClick={inputProps.onClick}
                      onKeyDown={event => {
                        if (event.key === 'Enter') {
                          if (inoutType === null || inoutType === 'REVENUE') {
                            setFocus('type1')
                            type1Ref.current.focus()
                          } else if (inoutType === 'EXPENDITURE') {
                            setFocus('type2')
                            type2Ref.current.focus()
                          }
                        }
                      }}
                      endAdornment={
                        <InputAdornment position="end"><InsertInvitationIcon /></InputAdornment>
                      }
                      label="開單日期"
                      value={format(inputProps.value, inputProps.format)}
                    />
                  </FormControl>
                )
              }}
            />
          </div>
          <div>
            <ToggleGroup
              value={inoutType}
              exclusive
              aria-label="text alignment"
              onChange={(e, inoutType) => {
                inoutType !== null && setInoutType(inoutType)
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  setFocus('account')
                } else if (event.key === 'ArrowRight') {
                  setInoutType('EXPENDITURE')
                  setFocus('type2')
                } else if (event.key === 'ArrowLeft') {
                  setInoutType('REVENUE')
                  setFocus('type1')
                }
              }}
            >
              <ToggleGroupItem
                ref={type1Ref}
                value="REVENUE"
                aria-label="left aligned"
              >
                收入
              </ToggleGroupItem>
              <ToggleGroupItem
                ref={type2Ref}
                value="EXPENDITURE"
                aria-label="centered"
              >
                支出
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {inoutType !== null && (
            <Fragment>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-text-secondary"
                  aria-label="從科目列表選擇"
                  onClick={handleOpenModal}
                >
                  <Copy strokeWidth={1.75} />
                </Button>
                <AccountingSubjectsAutocomplete
                  value={accountingSubject}
                  ref={accountRef}
                  onFocus={event => setFocus('account')}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('price')
                    }
                  }}
                  onChange={(e, completed) => {
                    selectInoutType(completed)
                    setFocus('price')
                  }}
                  inoutType={inoutType}
                />
              </div>
              <div>
                <TextField
                  type="number"
                  variant="outlined"
                  label="金額"
                  fullWidth
                  value={amount || 0}
                  inputRef={priceRef}
                  onFocus={() => setFocus('price')}
                  onChange={e => {
                    setAmount(e.target.value)
                  }}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      if (accountingSubject !== null && accountingSubject.title === '員工借支') {
                        setFocus('relation')
                      } else {
                        setFocus('designer')
                      }
                    }
                  }}
                  onWheel={() => document.activeElement.blur()}
                />
              </div>
              {accountingSubject !== null && accountingSubject.title === '員工借支' && (
                <div>
                  <Autocomplete
                    autoHighlight
                    options={employeeOptions}
                    getOptionLabel={option =>
                      option.title +
                      '-' +
                      (option.designerNo ? option.designerNo : '(無代號)')
                    }
                    renderInput={params => (
                      <TextField
                        {...params}
                        label="關係人"
                        variant="outlined"
                        fullWidth
                        inputRef={relationRef}
                      />
                    )}
                    onFocus={() => setFocus('relation')}
                    onChange={(event, completed) => {
                      setRelationUserId(idx(completed, _ => _.value))
                      setFocus('designer')
                    }
                    }
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        setFocus('designer')
                      }
                    }}
                    value={selectedrelationUser}
                  />
                </div>
              )}
              <div>
                <Autocomplete
                  autoHighlight
                  options={employeeOptions}
                  getOptionLabel={option =>
                    option.title +
                    '-' +
                    (option.designerNo ? option.designerNo : '(無代號)')
                  }
                  renderInput={params => (
                    <TextField {...params} inputRef={designerRef} label="登錄者" variant="outlined" fullWidth />
                  )}
                  onFocus={() => setFocus('designer')}
                  onChange={(event, completed) => {
                    setUserId(idx(completed, _ => _.value))
                    setFocus('payType')
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('payType')
                    }
                  }}
                  value={selectedEmployee}
                />
              </div>
              <div>
                <Autocomplete
                  options={accountingType}
                  getOptionLabel={option => option.title}
                  renderInput={params => (
                    <TextField
                      inputRef={payTypeRef}
                      {...params}
                      label="收付方式"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  value={walletType}
                  onFocus={() => setFocus('payType')}
                  onChange={(_event, completed) => {
                    setWalletType(completed)
                    setFocus('remarkItem')
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('remarkItem')
                    }
                  }}
                />
              </div>
              <div>
                <FormControl
                  fullWidth
                  variant="outlined"
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('remark')
                    }
                  }}
                >
                  <InputLabel>備註快捷鍵</InputLabel>
                  <Select
                    inputRef={remarkItemRef}
                    label='備註快捷鍵'
                    onFocus={() => setFocus('remarkItem')}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        setFocus('remark')
                      }
                    }}
                    onChange={event => {
                      onChange(event)
                      setFocus('remark')
                      remarkRef.current.focus()
                    }}
                  >
                    {remarkItem.map((data, index) => (
                      <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div>
                <TextField
                  variant="outlined"
                  label="備註"
                  multiline
                  minRows="4"
                  fullWidth
                  value={remark}
                  onFocus={() => setFocus('remark')}
                  inputRef={remarkRef}
                  onChange={e => {
                    setRemark(e.target.value)
                  }}
                />
              </div>
            </Fragment>
          )}
        </CardContent>
      </Card>
      {openAccountingSubjectModal && (
        <AccountingSubjectModal
          openAccountingSubjectModal={openAccountingSubjectModal}
          accountingSubject={inoutType === 'REVENUE' ? revenueSubjects : expenditureSubjects}
          inoutType={inoutType}
          closeModal={handleCloseModal}
          setAccountingSubjects={setAccountingSubjects}
          setInoutType={setInoutType}
        />
      )}
      <div className="flex justify-end py-6">
        <Button
          variant="primary"
          disabled={valid || isClick}
          onClick={() => {
            Submit()
          }}
        // onDoubleClick={valid === false}
        >
          新增
        </Button>
      </div>
    </div>
  )
}

export default Summary
