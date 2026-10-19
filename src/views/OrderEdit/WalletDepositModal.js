/** @jsxImportSource @emotion/react */
import {
  Card,
  CardHeader,
  CardContent,
  Modal,
  Button,
} from '@mui/material'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import PropTypes from 'prop-types'
import { memo, useContext, useState, useRef } from 'react'
import { red, blue } from '@mui/material/colors'
import _ from 'lodash'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import WalletDepositToggleButton from 'components/WalletDepositToggleButton'
import useFetchPayments from 'hooks/useFetchPayments'
import { DateTimePicker } from 'ui/date-picker'
import useFetchWalletDeposit from 'hooks/useFetchWalletDeposit'
import billContext from 'context/keyInContext'
import { cloneDeep } from 'lodash'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  root: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[20],
    width: 500,
    maxHeight: '100%',
    overflowY: 'auto',
    maxWidth: '100%',
  }),
  birthday: css({
    width: '100%',
  }),
  actions: css({
    justifyContent: 'flex-end',
  }),
  inner: css({
    minWidth: 700,
  }),
  categorieDiv: css({
    marginBottom: '5px',
  }),
  categorieBtn: css({
    margin: '3px',
  }),
  clickedCategorieBtn: css({
    margin: '3px',
    color: 'white',
  }),
  categorieClear: css({
    backgroundColor: red[500],
    color: 'white',
    '&:hover': {
      backgroundColor: red[700],
    },
  }),
  addBtn: css({
    backgroundColor: blue[500],
    color: 'white',
    '&:hover': {
      backgroundColor: blue[700],
    },
  }),
  confirmBtn: css({
    margin: '7px 0',
    float: 'right',
  }),
  header: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  backBtn: css({
    margin: '16px 24px',
  }),
  btnDiv: css({
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  rowOfGrid: css({
    margin: '5px 0px',
  }),
  dividerDiv: css({
    margin: '8px 0px',
  }),
  detailBottomCash: css({
    fontSize: '20px',
    fontWeight: 'bold',
  }),
  card: css({
    margin: theme.spacing(3, 0, 3, 0),
    maxWidth: 500,
  }),
  formControl: css({
    marginBottom: theme.spacing(3) + '!important',
  }),
  option: css({
    fontSize: 14,
    '& > span': {
      marginRight: 10,
      fontSize: 14,
    },
  }),
  dateTimeInput: {
    '& input.MuiInput-input': {
      padding: '6px 0 7px'
    }
  }
}

const statusText = {
  ADD: '儲值',
  MINUS: '扣除',
}

function WalletDepositModal({ openWalletDeposit, onClose, response, identity }) {
  const { bill } = useContext(billContext)

  const inputLabel = useRef(null)
  const [isClick, setIsClick] = useState(false)
  const getInitialMoneyStatus = () => {
    if (identity.allowDepositAddition) return 'ADD'
    if (identity.allowDepositDeduction) return 'MINUS'
  }
  const [moneyStatus, setMoneyStatus] = useState(getInitialMoneyStatus)
  const [walletDepositData, setWalletDepositData] = useState({
    customerId: bill.customerId,
    money: 0,
    payType: '',
    date: new Date().getTime(),
    designerId: bill.designerId,
    remark: '',
    handlingFeeDecountWay: 'WITHOUTHANDLINGFEE',
  })

  const payments = useFetchPayments()
  const { walletDeposit } = useFetchWalletDeposit()

  const paymentCashOption = [
    <NativeSelectOption value="現金" key={98}>
      現金
    </NativeSelectOption>,
  ]

  const paymentOptions = paymentCashOption.concat(
    payments.loading ? (
      <NativeSelectOption key={99} value={null}>
        <em>None</em>
      </NativeSelectOption>
    ) : (
      payments.data.merchantPayWays.map((data, index) => (
        <NativeSelectOption value={data.name} key={index}>
          {data.name}
        </NativeSelectOption>
      ))
    )
  )

  const handlingFeeDecountWayArray = [
    {
      value: 'BYCUSTOMER',
      label: '由客人負擔',
    },
    {
      value: 'BYDESIGNER',
      label: '由設計師負擔',
    },
    {
      value: 'WITHOUTHANDLINGFEE',
      label: '不扣項',
    },
  ]

  const handleWalletDepositDataChange = ({ value, key }) => {
    setWalletDepositData({
      ...walletDepositData,
      [key]: value,
    })
  }
  const handleSubWalletDeposit = async () => {
    setIsClick(true)
    const cloneWalletDeposit = cloneDeep(walletDepositData)
    try {
      if (isNaN(cloneWalletDeposit.date)) throw new Error('日期有誤')
      if (isNaN(cloneWalletDeposit.money)) throw new Error('金額有誤')
      if (!cloneWalletDeposit.designerId) throw new Error('請選擇設計師')
      if (!cloneWalletDeposit.customerId) throw new Error('請選擇顧客')
      if (!cloneWalletDeposit.payType) throw new Error('請選擇付款方式')
      if (moneyStatus === 'MINUS') {
        cloneWalletDeposit.money = cloneWalletDeposit.money * -1
      }
      const res = await walletDeposit({ input: cloneWalletDeposit, })
      if (res.data.walletDeposit) {
        openSnackbar({ message: `成功${statusText[moneyStatus]}入金`, variant: 'success' })
        response.refetch()
        onClose()
      } else throw new Error(`${statusText[moneyStatus]}失敗`)
    } catch (error) {
      openSnackbar({ message: error.message, variant: 'error' })
      setIsClick(false)
    }
  }

  return (
    <Modal open={openWalletDeposit}>
      <Card css={styles.root}>
        <div css={styles.header}>
          <CardHeader title="異動入金" />
          <Button color="primary" variant="contained" css={styles.backBtn} onClick={onClose}>
            返回
          </Button>
        </div>
        <CardContent>
          {/* 標籤統一放欄位上方（與打帳單主表一致）。必填 *：依本檔 handleSubWalletDeposit 的檢查
              （日期／金額／設計師／顧客／付款方式為空會中止）；備註與手續費負擔方不必填 */}
          <Field label="日期" required className="mb-6">
            <DateTimePicker
              value={walletDepositData.date}
              format="yyyy/MM/dd HH:mm"
              onChange={e => handleWalletDepositDataChange({ key: 'date', value: new Date(e).getTime() })}
              localeText={{
                toolbarTitle: '選擇日期'
              }}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small'
                },
                toolbar: {
                  toolbarFormat: 'M月d日 HH:mm'
                }
              }}
            />
          </Field>
          <div className="mb-6 flex flex-wrap items-end gap-2">
            <Field label="金額" required className="min-w-[160px] flex-1">
              <Input
                type="number"
                name="money"
                min={0}
                value={walletDepositData.money}
                onFocus={e => e.target.select()}
                onChange={e => {
                  const value = parseInt(Math.abs(e.target.value))
                  handleWalletDepositDataChange({ key: 'money', value })
                }}
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            <WalletDepositToggleButton
              value={moneyStatus}
              onChange={v => setMoneyStatus(v)}
              identity={identity}
            />
          </div>
          <Field label="設計師" required className="mb-6">
            <EmployeeAutoComplete
              placeholder="選擇設計師"
              onChange={val => {
                handleWalletDepositDataChange({ key: 'designerId', value: val.userId })
              }}
              value={walletDepositData.designerId}
            />
          </Field>
          <Field label="顧客" required className="mb-6">
            <CustomerAutoComplete
              styles={{
                option: styles.option,
              }}
              fieldProps={{
                placeholder: '選擇顧客',
              }}
              value={walletDepositData.customerId}
              onChange={val => {
                handleWalletDepositDataChange({ key: 'customerId', value: val.id })
              }}
            />
          </Field>
          <Field label="付款方式" required className="mb-6">
            <NativeSelect
              name="payType"
              value={walletDepositData.payType}
              onChange={event => {
                handleWalletDepositDataChange({ key: 'payType', value: event.target.value })
              }}
            >
              {paymentOptions}
            </NativeSelect>
          </Field>
          {walletDepositData.payType !== '現金' && (
            <Field label="入金儲值手續費負擔方" className="mb-6">
              <NativeSelect
                name="handlingFeeDecountWay"
                value={walletDepositData.handlingFeeDecountWay}
                onChange={event => {
                  handleWalletDepositDataChange({
                    key: 'handlingFeeDecountWay',
                    value: event.target.value,
                  })
                }}
              >
                {handlingFeeDecountWayArray.map((data, index) => (
                  <NativeSelectOption value={data.value} key={index}>
                    {data.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}
          <Field label="備註">
            <Input
              name="remark"
              value={walletDepositData.remark}
              onChange={e => {
                handleWalletDepositDataChange({
                  key: 'remark',
                  value: e.target.value,
                })
              }}
            />
          </Field>
        </CardContent>
        <div css={styles.btnDiv}>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSubWalletDeposit}
            disabled={isClick}
          >
            確認{statusText[moneyStatus]}
          </Button>
        </div>
      </Card>
    </Modal>
  )
}

WalletDepositModal.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

WalletDepositModal.defaultProps = {
  open: false,
  onClose: () => { },
}

export default memo(WalletDepositModal)
