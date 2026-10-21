import { Modal } from 'ui/modal-compat'
import { Button } from 'ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from 'ui/card'
import { Field, Input } from 'ui/input'
import { NativeSelect, NativeSelectOption } from 'ui/native-select'
import PropTypes from 'prop-types'
import { memo, useContext, useState, useRef } from 'react'
import CustomerAutoComplete from 'components/CustomerAutoComplete'
import EmployeeAutoComplete from 'components/EmployeeAutoComplete'
import WalletDepositToggleButton from 'components/WalletDepositToggleButton'
import useFetchPayments from 'hooks/useFetchPayments'
import { DateTimePicker } from 'ui/date-picker'
import useFetchWalletDeposit from 'hooks/useFetchWalletDeposit'
import billContext from 'context/keyInContext'
import cloneDeep from 'lodash/cloneDeep'
import { openSnackbar } from 'elements/snackbars'

const styles = {
  option: 'text-[14px] [&>span]:mr-[10px] [&>span]:text-[14px]',
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
      <Card className="absolute left-1/2 top-1/2 max-h-[calc(100%-32px)] w-[500px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background shadow-float outline-none">
        <CardHeader
          className="items-center pb-4"
          action={
            <Button variant="secondary" size="sm" onClick={onClose}>
              返回
            </Button>
          }
        >
          <CardTitle>異動入金</CardTitle>
        </CardHeader>
        <div className="h-px bg-border" />
        <CardContent>
          {/* 標籤統一放欄位上方（與打帳單主表一致）。必填 *：依據 handleSubWalletDeposit 的檢查
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
                  const value = parseInt(Math.abs(e.target.value), 10)
                  handleWalletDepositDataChange({ key: 'money', value })
                }}
                onWheel={() => document.activeElement.blur()}
              />
            </Field>
            <WalletDepositToggleButton
              value={moneyStatus}
              identity={identity}
              onChange={v => setMoneyStatus(v)}
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
        <CardFooter>
          <Button
            variant="primary"
            onClick={handleSubWalletDeposit}
            disabled={isClick}
          >
            確認{statusText[moneyStatus]}
          </Button>
        </CardFooter>
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
