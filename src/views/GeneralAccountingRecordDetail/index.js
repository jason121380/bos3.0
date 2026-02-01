/** @jsxImportSource @emotion/react */
import {
  Button, Card, CardContent, CardHeader, Container, Divider, Grid,
  Table, TableBody, TableCell, TableRow, TextField, colors,
  FormControl, MenuItem, InputLabel, Select, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Autocomplete, ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import red from '@mui/material/colors/red'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import { DatePicker } from '@mui/x-date-pickers'
import AccountingSubjectsAutocomplete from 'components/AccountingSubjectsAutocomplete'
import Page from 'components/Page'
import idx from 'idx'
import { useEffect, useState, Fragment, useRef } from 'react'
import { useHistory } from 'react-router'
import { openSnackbar } from 'elements/snackbars'
import FilterNoneIcon from '@mui/icons-material/FilterNone'
import useFetchMerchantPassword from 'hooks/useFetchMerchantPassword'
import useFetchGetMoneyFlow from 'hooks/useFetchGetMoneyFlow'
import { useFetchUsersForCreatePicking } from 'hooks/useFetchUsers'
import useFetchAccountingSubjects from 'hooks/useFetchAccountingSubjects'
import useFetchUpdateMoneyFlow from 'hooks/useFetchUpdateMoneyFlow'
import useFetchDeleteMoneyFlow from 'hooks/useFetchDeleteMoneyFlow'
import AccountingSubjectModal from './AccountingSubjectModal'
import PageTitle from 'components/PageTitle'
import { theme } from '../../theme'
import { css } from '@emotion/react'

const styles = {
  root: css({
  }),
  tabs: css({
    marginTop: theme.spacing(3),
  }),
  divider: css({
    backgroundColor: colors.grey[300],
  }),
  content: css({
    marginTop: theme.spacing(3),
    padding: 0,
  }),
  action: css({
    marginTop: theme.spacing(3),
  }),
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
  deleteButton: css({
    marginTop: theme.spacing(3),
    color: '#ffff',
    backgroundColor: red[700] + '!important',
    '&:hover, &:active': {
      backgroundColor: red[600] + '!important',
    },
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
  textarea: {
    '& .MuiOutlinedInput-root': {
      padding: '16.5px 14px',
    },
    '& textarea': {
      padidng: '0px !important'
    }
  },
  datePicker: css({
    '& input.MuiInput-input': {
      padding: '6px 0 7px'
    }
  }),
}

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

  const [date, setDate] = useState(new Date())
  const [accountingSubject, setAccountingSubjects] = useState(null)
  const [inoutType, setInoutType] = useState(null)
  const [amount, setAmount] = useState(null)
  const [userId, setUserId] = useState(null)
  const [relationUserId, setRelationUserId] = useState(null)
  const [walletType, setWalletType] = useState(null)
  const [remark, setRemark] = useState('')
  const [openAccountingSubjectModal, setOpenAccountingSubjectModal] = useState(false)
  const [revenueSubjects, setRevenueSubjects] = useState([])
  const [expenditureSubjects, setExpenditureSubjects] = useState([])
  const merchantPassword = useFetchMerchantPassword()
  const [openDialog, setOpenDialog] = useState(false)
  const [editPwd, setEditPwd] = useState('')
  const [editPwdIsUsing, setEditPwdIsUsing] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [isClick, setIsClick] = useState(false)
  const getMoneyFlow = useFetchGetMoneyFlow({ id: match.params.id })
  const users = useFetchUsersForCreatePicking()
  const accountingSubjects = useFetchAccountingSubjects()
  const { updateMoneyFlow } = useFetchUpdateMoneyFlow()
  const { deleteMoneyFlow } = useFetchDeleteMoneyFlow()

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
    if (!getMoneyFlow.loading) {
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
  // 儲存收支
  const Submit = async () => {
    if (accountingSubject === null) {
      openSnackbar({ message: '請選擇科目', variant: 'warning' })
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
        history.push('/general/accounting/records')
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
    try {
      const res = await deleteMoneyFlow(match.params.id)
      if (res.data.deleteMoneyFlow) {
        openSnackbar({
          message: '刪除收借支成功',
          variant: 'success',
        })
        history.push('/general/accounting/records')
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

  const selectInoutType = completed => {
    if (completed === null) {
      openSnackbar({ message: '請選擇科目', variant: 'warning' })
    } else {
      setAccountingSubjects(completed)
      setInoutType(completed.inoutType)
    }
  }

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditPwd('')
  }

  const resetData = () => {
    setAccountingSubjects(null)
    setRelationUserId(null)
    setShowMessage(true)
  }
  return (
    <Fragment>
      <Page css={styles.content} title="收支紀錄詳細">
        <Container maxWidth="md">
          <PageTitle title='收支紀錄詳細' subTitle='ACCOUNTING RECORD DETAIL' />
          <div css={styles.content}>
            <Grid css={styles.root} container spacing={3}>
              <Grid item style={{ width: '100%' }}>
                <Card css={styles.root}>
                  <CardHeader title="一般" />
                  <Divider />
                  <CardContent css={styles.content}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <DatePicker
                              format="yyyy/MM/dd"
                              label="開單日期"
                              value={date}
                              css={styles.datePicker}
                              onChange={(e) => {
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
                                      if (inoutType === 'REVENUE') {
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
                          <TableCell css={styles.padding} style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                            <ToggleButtonGroup
                              value={inoutType}
                              exclusive
                              aria-label="text alignment"
                              onChange={(e, type) => {
                                if (type !== null) {
                                  if (type !== inoutType) {
                                    setInoutType(type)
                                    resetData()
                                    if (inoutType === 'REVENUE') {
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
                            {showMessage && <p style={{ color: 'red', fontWeight: 'bold', fontSize: 14, lineHeight: '100%' }}>收支更動，請重新選擇科目或關係人。</p>}
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
                              </TableCell>
                            </TableRow>
                            {accountingSubject !== null &&
                              accountingSubject.title === '員工借支' &&
                              idx(
                                users,
                                _ =>
                                  _.data.users.users && (
                                    <TableCell css={styles.padding}>
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
                                    </TableCell>
                                  )
                              )}
                            <TableRow>
                              <TableCell css={styles.padding}>
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
                                          setFocus('remarkItem')
                                        }}
                                        onKeyDown={event => {
                                          if (event.key === 'Enter') {
                                            setFocus('remarkItem')
                                          }
                                        }}
                                      />
                                    )
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell css={styles.padding}>
                                <FormControl
                                  fullWidth
                                  variant="outlined"
                                  focused={focus === 'remarkItem'}
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
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell css={styles.padding}>
                                <TextField
                                  css={styles.textarea}
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
          </div>
          <Grid container justifyContent="space-between" spacing={3}>
            <Grid item>
              <Button
                onClick={editPwdIsUsing ? handleOpenDialog : Submit}
                variant="contained"
                color="primary"
                css={styles.action}
                disabled={isClick}
              >
                儲存
              </Button>
            </Grid>
            <Grid item>
              <Button
                onClick={Delete}
                variant="contained"
                css={styles.deleteButton}
                disabled={isClick}
              >
                <DeleteIcon css={styles.buttonIcon} />
                刪除
              </Button>
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
        </Container>
      </Page>
      <Dialog
        open={openDialog}
        // onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'儲存收支紀錄'}</DialogTitle>
        <DialogContent style={{ overflow: 'visible' }}>
          <DialogContentText id="alert-dialog-description">
            <TextField
              value={editPwd}
              label="儲存密碼"
              onChange={event => setEditPwd(event.target.value)}
              inputProps={{
                type: 'password',
              }}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleCloseDialog}>
            取消
          </Button>
          <Button color="primary" autoFocus data-testid="confirm" onClick={Submit}>
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
