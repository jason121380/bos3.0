import { openSnackbar } from 'elements/snackbars'
import { useState, useEffect, useRef } from 'react'
import Page from 'components/Page'
import { useParams } from 'react-router'
import produce from 'immer'
import cloneDeep from 'lodash/cloneDeep'
import useFetchCheckIsCustomerExistForOuterStore from 'hooks/useFetchCheckIsCustomerExistForOuterStore'
import useFetchGetMerchantName from 'hooks/useFetchGetMerchantName'
import { LoaderCircle } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'
import { getApiOrigin } from 'lib/api-base'
import { httpStatusMessage } from 'lib/friendly-error'
import idx from 'idx'

const CustomerSendEventTicket = () => {
  const { id } = useParams()
  const [checkExist, checkExistData] = useFetchCheckIsCustomerExistForOuterStore()
  const getMerchantName = useFetchGetMerchantName({ input: id })
  const [data, setData] = useState({
    name: '',
    cellphone: '',
    count: 1,
    merchantName: '',
    isExist: false
  })
  const [isClick, setIsClick] = useState(false)
  const submitRef = useRef(null)

  const handleSetInputValue = (value, key) => {
    setData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  // 清空表單時保留查回的店名（原本寫死「測試店家」；Jason 2026/10/22 fix all）
  const restPage = () => {
    setData(prev => ({
      name: '',
      cellphone: '',
      count: 1,
      merchantName: prev.merchantName,
      isExist: false
    }))
  }

  const handleSubmit = async () => {
    setIsClick(true)
    const { name, cellphone, count } = cloneDeep(data)
    try {
      // 沿用全域 warning 的 3 秒時限；完成／失敗後的提示取代此訊息，避免等待提示永久留存。
      openSnackbar({ message: '資料建立中請稍候', variant: 'warning' })
      if (!cellphone.match(/^[0-9]{5,20}$/)) throw new Error('電話格式有誤: 請輸入5-20碼的數字。')
      if (!count) throw new Error('張數為必填欄位')
      if (count > 500) throw new Error('單次發券張數不可超過500張')
      if (!name.trim()) throw new Error('姓名欄位為必填。')
      // 與 GraphQL 同一個後端（原本只要不是 app.beautyos.co 就打 localhost:4849，測試站與其他網域都送不出去）
      const url = `${getApiOrigin()}/outer_store/send_event_ticket`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name, cellphone, count,
          merchantId: id
        }),
      })
      // 以 res.ok 判斷成功（原本只把 400 當失敗，500／403 也顯示發券成功；Jason 2026/10/22 fix all）
      if (res.status === 400) {
        const message = await res.json()
        throw new Error(message)
      } else if (!res.ok) {
        throw new Error(`發券失敗：${httpStatusMessage(res.status)}`)
      } else {
        restPage()
        openSnackbar({ message: '發券成功', variant: 'success' })
      }
    } catch (error) {
      setIsClick(false)
      openSnackbar({ message: error.message, variant: 'error' })
    } finally {
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!checkExistData.loading && checkExistData.data) {
      const { customerName, isExist } = checkExistData.data.checkIsCustomerExistForOuterStore
      setData(
        produce(draft => {
          draft.isExist = isExist
          if (!isExist) return
          draft.name = customerName || ''
        })
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [checkExistData.loading])

  useEffect(() => {
    if (!getMerchantName.loading) {
      // 查詢失敗時店名留空（原本 data 為 undefined 時整頁錯誤；Jason 2026/10/22 fix all）
      const data = idx(getMerchantName, _ => _.data.getMerchantName) || ''
      handleSetInputValue(data, 'merchantName')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [getMerchantName.loading])

  return (
    <Page className="ui-root flex flex-col gap-4" title={`${data.merchantName}  抽獎資格登錄`}>
      <h1 className="text-title !font-bold text-text">{`${data.merchantName}  抽獎資格登錄`}</h1>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <Field label="電話" required htmlFor="send-ticket-cellphone">
            <Input
              id="send-ticket-cellphone"
              className="h-11"
              value={data.cellphone}
              type="tel"
              onBlur={() => {
                checkExist({
                  variables: {
                    input: {
                      cellphone: data.cellphone,
                      storeId: id
                    }
                  }
                })
              }}
              onChange={e => {
                if (e.target.value.match(/^[0-9]+$/) || e.target.value === '') {
                  handleSetInputValue(e.target.value, 'cellphone')
                }
              }}
            />
          </Field>
          <Field label="張數" required htmlFor="send-ticket-count">
            <Input
              id="send-ticket-count"
              className="h-11 tabular-nums"
              value={data.count}
              placeholder='張數範圍1~500'
              type="tel"
              onChange={e => {
                if (e.target.value.match(/^[0-9]+$/) || e.target.value === '') {
                  handleSetInputValue(parseInt(e.target.value, 10) ? parseInt(e.target.value, 10) : '', 'count')
                }
              }}
            />
          </Field>
          <Field label="姓名" required htmlFor="send-ticket-name">
            <Input
              id="send-ticket-name"
              className="h-11"
              disabled={data.isExist || checkExistData.loading}
              value={data.name}
              maxLength={20}
              onChange={e => handleSetInputValue(e.target.value, 'name')}
            />
          </Field>
        </CardContent>
      </Card>
      <Button
        ref={submitRef}
        variant="primary"
        size="lg"
        className="h-11 w-full"
        disabled={checkExistData.loading || !data.name.trim()}
        aria-describedby={!checkExistData.loading && !data.name.trim() ? 'send-ticket-missing' : undefined}
        onClick={handleSubmit}
      >{isClick ? <LoaderCircle className="animate-spin" strokeWidth={1.75} /> : '提交'}</Button>
      {/* 停用原因（STYLE.md §6）：姓名空白時不能提交；查詢顧客中不列原因 */}
      {!checkExistData.loading && !data.name.trim() && (
        <p id="send-ticket-missing" role="status" className="mt-2 text-center text-caption text-text-secondary">
          尚缺：姓名
        </p>
      )}
    </Page>
  )
}

export default CustomerSendEventTicket
