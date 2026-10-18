/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Divider, Grid, Table,
  TableBody, TableCell, TableRow, TextField, FormControl, MenuItem,
  InputLabel, Select, Autocomplete, ToggleButton, ToggleButtonGroup
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import AccountingSubjectsAutocomplete from 'components/AccountingSubjectsAutocomplete'
import idx from 'idx'
import React, { useState, Fragment, useEffect, useRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import { FilterNone as FilterNoneIcon } from 'ui/icons'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchCreateMoneyFlow from 'hooks/useFetchCreateMoneyFlow'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import AccountingSubjectModal from './AccountingSubjectModal'

const styles = {
  root: css({}),
  actions: css({
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > * + *': {
      marginLeft: 0,
    },
  }),
  buttonIcon: css({
    marginRight: theme.spacing(1),
  }),
  content: css({
    padding: 0,
    marginTop: theme.spacing(3),
  }),
  action: css({
    marginTop: theme.spacing(3) + '!important',
  }),
  createIcon: css({
    cursor: 'pointer',
    marginRight: '10px',
  }),
  subjectDiv: css({
    display: 'flex',
    alignItems: 'center',
  }),
  padding: css({
    padding: '10px 5px !important'
  }),
  datePicker: css({
    '& input.MuiInput-input': {
      padding: '6px 0 7px'
    }
  }),
}

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
        })
      )
      setRevenueSubjects(revenueInit)
      setExpenditureSubjects(expenditureInit)
    }
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
  }, [accountingSubject, amount, inoutType])

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
      history.push(`/general/accounting/create?date=${location.search.split('=')[1]}`)
      setDate(Number(location.search.split('=')[1]))
    }
  }, [])
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
    <div css={styles.content}>
      <Grid {...rest} css={styles.root} container spacing={3}>
        <Grid item xs={12}>
          <Card {...rest} css={styles.root}>
            <CardHeader title="一般" />
            <Divider />
            <CardContent css={styles.content}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ width: '400px' }}>
                      <DatePicker
                        format="yyyy/MM/dd"
                        label="開單日期"
                        value={date}
                        css={styles.datePicker}
                        onChange={(e) => {
                          history.push(
                            `/general/accounting/create?date=${new Date(e).getTime()}`
                          )
                          setDate(e)
                        }}
                        localeText={{
                          toolbarTitle: '選擇日期'
                        }}
                        slotProps={{
                          toolbar: {
                            toolbarFormat: 'yyyy年M月d日'
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
                            }
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell css={styles.padding}>
                      <ToggleButtonGroup
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
                        <ToggleButton
                          ref={type1Ref}
                          value="REVENUE"
                          aria-label="left aligned"
                          focused={focus === 'type1' ? 1 : 0}
                        >
                          收入
                        </ToggleButton>
                        <ToggleButton
                          ref={type2Ref}
                          value="EXPENDITURE"
                          aria-label="centered"
                          focused={focus === 'type2' ? 1 : 0}
                        >
                          支出
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                  {inoutType !== null && (
                    <Fragment>
                      <TableRow>
                        <TableCell css={styles.padding}>
                          <div css={styles.subjectDiv}>
                            <FilterNoneIcon
                              css={styles.createIcon}
                              onClick={handleOpenModal}
                            />
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
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell css={styles.padding}>
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
                        </TableCell>
                      </TableRow>
                      {accountingSubject !== null && accountingSubject.title === '員工借支' && (
                        <TableRow>
                          <TableCell css={styles.padding}>
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
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell css={styles.padding}>
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
                              setFocus('remarkItem')
                            }}
                            onKeyDown={event => {
                              if (event.key === 'Enter') {
                                setFocus('remarkItem')
                              }
                            }}
                            value={selectedEmployee}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell css={styles.padding}>
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
                                remarkItemRef.current.focus()
                              }}
                            >
                              {remarkItem.map((data, index) => (
                                <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell css={styles.padding}>
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
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
      <Button
        variant="contained"
        color="primary"
        css={styles.action}
        disabled={valid || isClick}
        onClick={() => {
          Submit()
        }}
      // onDoubleClick={valid === false}
      >
        新增
      </Button>
    </div>
  )
}

export default Summary
