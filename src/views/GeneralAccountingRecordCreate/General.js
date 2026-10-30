// 表單控制項（日期、收支切換、科目／人員 Autocomplete、備註快捷 Select、金額與備註 TextField）
// 使用正式 ui 元件：皆以 ref 串接 Enter 鍵焦點流程（樣式由正式 ui 元件提供）
import { FormControl } from 'ui/form-control'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import { TextField } from 'ui/text-field'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { DatePicker } from 'ui/date-picker'
import AccountingSubjectsAutocomplete from 'components/AccountingSubjectsAutocomplete'
import idx from 'idx'
import React, { useState, Fragment, useEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import { Copy } from 'lucide-react'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchCreateMoneyFlow from 'hooks/useFetchCreateMoneyFlow'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'

import AccountingSubjectModal from 'views/AccountingShared/AccountingSubjectModal'
import { Autocomplete } from 'ui/combobox'

function Summary({ stayInCreateAccount, ...rest }) {
  const history = useHistory()
  const location = useLocation()
  const [date, setDate] = useState(new Date())
  const [openAccountingSubjectModal, setOpenAccountingSubjectModal] = useState(false)
  const [amount, setAmount] = useState(null)
  const [accountingSubject, setAccountingSubjects] = useState(null)
  const [inoutType, setInoutType] = useState(null)
  const [walletType, setWalletType] = useState({ title: '現場現金', value: '現場現金' })
  const [userId, setUserId] = useState(null)
  const [relationUserId, setRelationUserId] = useState(null)
  const [remark, setRemark] = useState('')
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
        break
      case 'type2':
        type2Ref.current.focus()
        break
      case 'account':
        accountRef.current.focus()
        break
      case 'price':
        priceRef.current.focus()
        priceRef.current.select()
        break
      case 'relation':
        relationRef.current.focus()
        break
      case 'designer':
        designerRef.current.focus()
        break
      case 'payType':
        payTypeRef.current.focus()
        break
      case 'remarkItem':
        remarkItemRef.current.focus()
        break
      case 'remark':
        remarkRef.current.focus()
        break
      default:
        break
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [accountingSubjects.loading])
  const [isClick, setIsClick] = useState(false)
  var valid = !(amount !== null && amount !== '' && accountingSubject && inoutType && walletType)

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
            window.location.href = `/general/accounting/create?date=${location.search.split('=')[1]}`
          } else {
            window.location.href = '/general/accounting/create'
          }
        } else {
          history.push('/general/accounting/records')
        }
      } else throw new Error('新增收借支失敗')
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（keyDownSubmit）；只在 [accountingSubject, amount, inoutType, date, walletType, userId, relationUserId, remark, stayInCreateAccount, location] 變動時呼叫，補上會每次 render 重跑
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

  const selectedEmployee = idx(users, _ => employeeOptions.find(d => d.value === userId)) || null
  const selectedrelationUser = idx(users, _ => employeeOptions.find(d => d.value === relationUserId)) || null
  const handleOpenModal = () => {
    setOpenAccountingSubjectModal(!openAccountingSubjectModal)
  }
  const handleCloseModal = () => {
    setOpenAccountingSubjectModal(false)
  }

  React.useEffect(() => {
    if (location.search.split('=')[1] !== undefined) {
      history.push(`/general/accounting/create?date=${location.search.split('=')[1]}`)
      setDate(Number(location.search.split('=')[1]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 網址參數只在進頁時讀一次，換頁會重新掛載
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
          <div className="w-full max-w-[400px]">
            <DatePicker
              format="yyyy/MM/dd"
              label="開單日期"
              value={date}
              onChange={e => {
                history.push(`/general/accounting/create?date=${new Date(e).getTime()}`)
                setDate(e)
              }}
              localeText={{
                toolbarTitle: '選擇日期',
              }}
              slotProps={{
                toolbar: {
                  toolbarFormat: 'yyyy年M月d日',
                },
                textField: {
                  variant: 'standard',
                  onKeyDown: event => {
                    if (event.key === 'Enter') {
                      if (inoutType === null || inoutType === 'REVENUE') {
                        setFocus('type1')
                        type1Ref.current.focus()
                      } else if (inoutType === 'EXPENDITURE') {
                        setFocus('type2')
                        type2Ref.current.focus()
                      }
                    }
                  },
                },
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
              <ToggleGroupItem ref={type1Ref} value="REVENUE" aria-label="left aligned">
                收入
              </ToggleGroupItem>
              <ToggleGroupItem ref={type2Ref} value="EXPENDITURE" aria-label="centered">
                支出
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {inoutType !== null && (
            <Fragment>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 text-text-secondary" aria-label="從科目列表選擇" onClick={handleOpenModal}>
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
                    if (event.key === 'Enter') {
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
                    getOptionLabel={option => option.title + '-' + (option.designerNo ? option.designerNo : '(無代號)')}
                    renderInput={params => <TextField {...params} label="關係人" variant="outlined" fullWidth inputRef={relationRef} />}
                    onFocus={() => setFocus('relation')}
                    onChange={(event, completed) => {
                      setRelationUserId(idx(completed, _ => _.value))
                      setFocus('designer')
                    }}
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
                  getOptionLabel={option => option.title + '-' + (option.designerNo ? option.designerNo : '(無代號)')}
                  renderInput={params => <TextField {...params} inputRef={designerRef} label="登錄者" variant="outlined" fullWidth />}
                  onFocus={() => setFocus('designer')}
                  onChange={(event, completed) => {
                    setUserId(idx(completed, _ => _.value))
                    setFocus('remarkItem')
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('remarkItem')
                    }
                  }}
                  value={selectedEmployee}
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
                  <NativeSelect
                    inputRef={remarkItemRef}
                    onFocus={() => setFocus('remarkItem')}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        setFocus('remark')
                      }
                    }}
                    onChange={event => {
                      onChange(event)
                      setFocus('remark')
                      remarkItemRef.current.focus()
                    }}
                    displayEmpty={false}
                    placeholder="請選擇…"
                    label="備註快捷鍵"
                  >
                    {remarkItem.map((data, index) => (
                      <NativeSelectOption key={index} value={data.value}>
                        {data.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
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
      <div className="flex flex-wrap items-center justify-end gap-3 py-6">
        {/* 停用原因（STYLE.md §6）：依 valid（收支類別、科目、金額、收付方式必填）；送出中不顯示 */}
        {valid && (
          <p id="general-accounting-create-missing" role="status" className="text-caption text-text-secondary">
            尚缺：
            {[!inoutType && '收入／支出', !accountingSubject && '科目', (amount === null || amount === '') && '金額', !walletType && '收付方式']
              .filter(Boolean)
              .join('、')}
          </p>
        )}
        <Button
          variant="primary"
          aria-describedby={valid ? 'general-accounting-create-missing' : undefined}
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
