// 表單控制項（日期、收支切換、科目／人員／收付方式 Autocomplete、備註快捷 Select、金額與備註 TextField）
// 保留 MUI：皆以 ref 串接 Enter 鍵焦點流程（橋接主題已套新外觀）
import { Input, TextField, InputAdornment } from 'ui/text-field'
import { FormControl, MenuItem, InputLabel, Select } from 'ui/form-control'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { InsertInvitation as InsertInvitationIcon } from 'ui/icons'
import { Copy, Trash2 } from 'lucide-react'
import { MobileDatePicker } from 'ui/date-picker'
import AccountingSubjectsAutocomplete from 'components/AccountingSubjectsAutocomplete'
import useFetchAccountingType from 'hooks/useFetchAccountingType'
import Page from 'components/Page'
import idx from 'idx'
import { useEffect, useState, Fragment, useRef } from 'react'
import { useHistory } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import format from 'date-fns/format'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchGetMoneyFlow from 'hooks/useFetchGetMoneyFlow'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchUpdateMoneyFlow from 'hooks/useFetchUpdateMoneyFlow'
import useFetchDeleteMoneyFlow from 'hooks/useFetchDeleteMoneyFlow'
import { Button } from 'ui/button'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { Field, Input as UiInput } from 'ui/input'
import { PageHeader } from 'ui/page-header'

import AccountingSubjectModal from './AccountingSubjectModal'
import { Autocomplete } from 'ui/combobox'

//備註快捷
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
export default function AccountingRecordDetail(props) {
  const { match } = props
  const history = useHistory()

  const [date, setDate] = useState(new Date().getTime())
  const [accountingSubject, setAccountingSubjects] = useState(null)
  const [inoutType, setInoutType] = useState(null)
  const [amount, setAmount] = useState(null)
  const [userId, setUserId] = useState(null)
  const [relationUserId, setRelationUserId] = useState(null)
  const [walletType, setWalletType] = useState(null)
  const [remark, setRemark] = useState('')
  const [openAccountingSubjectModal, setOpenAccountingSubjectModal] = useState(false)
  const accountingTypeData = useFetchAccountingType({ input: 'MANAGER' })
  const [accountingType, setAccountingType] = useState()
  const [revenueSubjects, setRevenueSubjects] = useState([])
  const [expenditureSubjects, setExpenditureSubjects] = useState([])
  const getMoneyFlow = useFetchGetMoneyFlow({ id: match.params.id })
  const users = useFetchUsersForCreatePicking()
  const accountingSubjects = useFetchAccountingSubjects()
  const { updateMoneyFlow } = useFetchUpdateMoneyFlow()
  const { deleteMoneyFlow } = useFetchDeleteMoneyFlow()

  const merchantPassword = useFetchMerchantPassword()
  const [openDialog, setOpenDialog] = useState(false)
  const [editPwd, setEditPwd] = useState('')
  const [editPwdIsUsing, setEditPwdIsUsing] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  // 刪除前確認（Jason 2026/10/22）
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isClick, setIsClick] = useState(false)

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
  useEffect(() => {
    // 紀錄查詢失敗（或已被刪除）時不帶入，以空表單顯示、不整頁錯誤（Jason 2026/10/22）
    if (!getMoneyFlow.loading && idx(getMoneyFlow, _ => _.data.moneyFlow)) {
      setDate(getMoneyFlow.data.moneyFlow.date)
      setAccountingSubjects({
        title:
          getMoneyFlow.data.moneyFlow.accountingSubject !== null ? getMoneyFlow.data.moneyFlow.accountingSubject.name : '',
        value: getMoneyFlow.data.moneyFlow.accountingSubject !== null ? getMoneyFlow.data.moneyFlow.accountingSubject.id : '',
        number:
          getMoneyFlow.data.moneyFlow.accountingSubject !== null ? getMoneyFlow.data.moneyFlow.accountingSubject.number : '',
        inoutType:
          getMoneyFlow.data.moneyFlow.accountingSubject !== null
            ? getMoneyFlow.data.moneyFlow.accountingSubject.inoutType
            : '',
      })
      setAmount(getMoneyFlow.data.moneyFlow.amount)
      setRelationUserId(
        getMoneyFlow.data.moneyFlow.relationUser !== null
          ? {
            title: getMoneyFlow.data.moneyFlow.relationUser.name,
            value: getMoneyFlow.data.moneyFlow.relationUser.id,
            designerNo: getMoneyFlow.data.moneyFlow.relationUser.designerNo,
          }
          : null
      )
      setInoutType(getMoneyFlow.data.moneyFlow.inoutType)
      if (getMoneyFlow.data.moneyFlow.user) {
        setUserId({
          title: getMoneyFlow.data.moneyFlow.user.name,
          value: getMoneyFlow.data.moneyFlow.user.id,
          designerNo: getMoneyFlow.data.moneyFlow.user.designerNo,
        })
      }
      setRemark(getMoneyFlow.data.moneyFlow.remark)
      setWalletType({ title: getMoneyFlow.data.moneyFlow.walletType, value: getMoneyFlow.data.moneyFlow.walletType })
    }
  }, [getMoneyFlow.loading])

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
  useEffect(() => {
    if (!merchantPassword.loading) {
      const editPwdIsUsing = idx(
        merchantPassword,
        _ => _.data.merchantPassword.editMoneyFlow.isUsing
      )
      setEditPwdIsUsing(editPwdIsUsing)
    }
  }, [merchantPassword.loading])

  useEffect(() => {
    if (showMessage && accountingSubject) {
      if (accountingSubject.title !== '員工借支' || (accountingSubject.title === '員工借支' && relationUserId)) {
        setShowMessage(false);
      }
    }
  }, [accountingSubject, relationUserId])

  if (getMoneyFlow.loading) return ''
  const Submit = async () => {
    if (accountingSubject === null || walletType === null) {
      openSnackbar({
        message: !accountingSubject ? '請選擇科目' : '請選擇收付方式',
        variant: 'warning',
      })
      return
    }
    const variables = {
      id: match.params.id,
      input: {
        date: new Date(date).getTime(),
        amount: +amount,
        walletType: walletType.value,
        remark: remark,
        accountingSubjectId: accountingSubject.value,
        accountingSubjectName: accountingSubject.title,
        relationUserId: relationUserId !== null ? relationUserId.value : null,
      },
      password: editPwd,
    }
    if (userId) {
      variables.input.userId = userId.value
    }
    setIsClick(true)
    try {
      const res = await updateMoneyFlow(variables)
      if (res.data.updateMoneyFlow) {
        openSnackbar({
          message: '更新收借支成功',
          variant: 'success',
        })
        history.push('/accounting/records')
      } else throw new Error('更新收借支失敗')
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setIsClick(false)
    }
  }
  // 刪除收支
  const Delete = async () => {
    setIsClick(true)
    setOpenDeleteDialog(false)
    try {
      const res = await deleteMoneyFlow(match.params.id)
      if (res.data.deleteMoneyFlow) {
        openSnackbar({
          message: '刪除收借支成功',
          variant: 'success',
        })
        history.push('/accounting/records')
      } else throw new Error('刪除收借支失敗')
    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error',
      })
      setIsClick(false)
    }
  }

  const handleOpenModal = () => {
    setOpenAccountingSubjectModal(!openAccountingSubjectModal)
  }

  const handleCloseModal = () => {
    setOpenAccountingSubjectModal(false)
  }
  const onChange = event => {
    setRemark(event.target.value)
  }

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditPwd('')
  }
  const selectInoutType = completed => {
    if (completed === null) {
      openSnackbar({ message: '請選擇科目', variant: 'warning' })
    } else {
      setAccountingSubjects(completed)
      setInoutType(completed.inoutType)
    }
  }

  const selectWalletType = completed => {
    if (completed === null) {
      openSnackbar({ message: '請選擇收付方式', variant: 'warning' })
    } else {
      setWalletType({ title: completed.value, value: completed.value })
    }
  }

  const resetData = () => {
    setAccountingSubjects(null)
    setRelationUserId(null)
    setShowMessage(true)
  }
  return (
    <Fragment>
      <Page className="ui-root" title="收支紀錄詳細">
        <div className="mx-auto flex max-w-3xl flex-col">
          <PageHeader title="收支紀錄詳細" />
          <Card>
            <CardHeader>
              <CardTitle>一般</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <MobileDatePicker
                  closeOnSelect
                  label='開單日期'
                  value={date}
                  onChange={value => setDate(new Date(value).getTime())}
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
                          label="日期"
                          value={format(inputProps.value, inputProps.format)}
                        />
                      </FormControl>
                    )
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <ToggleGroup
                  value={inoutType}
                  exclusive
                  aria-label="text alignment"
                  onChange={(e, type) => {
                    if (type !== null) {
                      if (type !== inoutType) {
                        setInoutType(type)
                        resetData()
                        // 焦點落在新選的類別按鈕（原本依切換前的類別，會跳到舊按鈕，Jason 2026/10/22）
                        if (type === 'REVENUE') {
                          setFocus('type1')
                        } else {
                          setFocus('type2')
                        }
                      }
                    }
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      setFocus('account')
                    } else if (event.key === 'ArrowRight') {
                      if (inoutType !== 'EXPENDITURE') {
                        setInoutType('EXPENDITURE')
                        setFocus('type2')
                        resetData()
                      }
                    } else if (event.key === 'ArrowLeft') {
                      if (inoutType !== 'REVENUE') {
                        setInoutType('REVENUE')
                        setFocus('type1')
                        resetData()
                      }
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
                {showMessage && <p className="text-label font-medium text-danger">收支更動，請重新選擇科目或關係人。</p>}
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
                      value={amount}
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
                  {accountingSubject !== null &&
                    accountingSubject.title === '員工借支' &&
                    idx(
                      users,
                      _ =>
                        _.data.users.users && (
                          <div>
                            <Autocomplete
                              autoHighlight
                              options={_.data.users.users.map(d => {
                                return {
                                  title: d.name,
                                  value: d.id,
                                  designerNo: d.designerNo,
                                }
                              })}
                              value={relationUserId}
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
                                setRelationUserId(completed)
                                setFocus('designer')
                              }}
                              onKeyDown={event => {
                                if (event.key === 'Enter') {
                                  setFocus('designer')
                                }
                              }}
                            />
                          </div>
                        )
                    )}
                  <div>
                    {idx(
                      users,
                      _ =>
                        _.data.users.users && (
                          <Autocomplete
                            autoHighlight
                            options={_.data.users.users.map(d => {
                              return {
                                title: d.name,
                                value: d.id,
                                designerNo: d.designerNo,
                              }
                            })}
                            value={userId}
                            getOptionLabel={option =>
                              option.title +
                              '-' +
                              (option.designerNo ? option.designerNo : '(無代號)')
                            }
                            renderInput={params => (
                              <TextField
                                {...params}
                                inputRef={designerRef}
                                label="登錄者"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                            onFocus={() => setFocus('designer')}
                            onChange={(event, completed) => {
                              setUserId(completed)
                              setFocus('payType')
                            }}
                            onKeyDown={event => {
                              if (event.key === 'Enter') {
                                setFocus('payType')
                              }
                            }}
                          />
                        )
                    )}
                  </div>
                  <div>
                    <Autocomplete
                      options={accountingType !== undefined ? accountingType : []}
                      getOptionLabel={option => option.value}
                      value={walletType}
                      renderInput={params => (
                        <TextField
                          {...params}
                          inputRef={payTypeRef}
                          label="收付方式"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                      onFocus={() => setFocus('payType')}
                      onChange={(event, completed) => {
                        selectWalletType(completed)
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
                          remarkRef.current.focus()
                        }
                      }}
                    >
                      <InputLabel>備註快捷鍵</InputLabel>
                      <Select
                        inputRef={remarkItemRef}
                        label='備註快捷鍵'
                        onChange={event => {
                          onChange(event)
                          setFocus('remark')
                          remarkRef.current.focus()
                        }}
                        onFocus={() => setFocus('remarkItem')}
                        onKeyDown={event => {
                          if (event.key === 'Enter') {
                            setFocus('remark')
                            remarkRef.current.focus()
                          }
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
          <div className="flex items-center justify-between gap-4 py-6">
            <Button
              disabled={isClick}
              onClick={editPwdIsUsing ? handleOpenDialog : Submit}
              variant="primary"
            >
              儲存
            </Button>
            <Button
              disabled={isClick}
              onClick={() => setOpenDeleteDialog(true)}
              variant="danger"
            >
              <Trash2 strokeWidth={1.75} />
              刪除
            </Button>
          </div>
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
        </div>
      </Page>
      {/* 舊版未設定 onClose（點背景／Esc 不關閉），故不傳 onOpenChange、隱藏右上關閉鈕 */}
      <Dialog open={openDialog}>
        <DialogContent size="sm" hideClose aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{'儲存收支紀錄'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Field label="儲存密碼" htmlFor="edit-money-flow-password">
              <UiInput
                id="edit-money-flow-password"
                type="password"
                value={editPwd}
                onChange={event => setEditPwd(event.target.value)}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button variant="primary" autoFocus data-testid="confirm" onClick={Submit}>
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 刪除確認：與儲存密碼對話框相同，點背景／Esc 不關閉 */}
      <Dialog open={openDeleteDialog}>
        <DialogContent size="sm" hideClose aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>刪除收支紀錄</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-body text-text">確定要刪除這筆收支紀錄嗎？</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="danger" autoFocus disabled={isClick} onClick={Delete}>
              確定刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Fragment>
  )
}
