import { useState, useEffect } from 'react'
import { Alert, Snackbar } from '@mui/material'
import Page from 'components/Page'
import { useParams } from 'react-router'
import produce from 'immer'
import { cloneDeep } from 'lodash'
import useFetchCheckIsCustomerExistForOuterStore from 'hooks/useFetchCheckIsCustomerExistForOuterStore'
import useFetchGetMerchantName from 'hooks/useFetchGetMerchantName'
import { LoaderCircle } from 'lucide-react'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { Field, Input } from 'ui/input'

const index = () => {
  const { id } = useParams()
  const [checkExist, checkExistData] = useFetchCheckIsCustomerExistForOuterStore()
  const getMerchantName = useFetchGetMerchantName({ input: id })
  const [openSnack, setOpenSnack] = useState({
    open: false,
    severity: '',
    message: ''
  })
  const [data, setData] = useState({
    name: '',
    cellphone: '',
    count: 1,
    merchantName: '',
    isExist: false
  })
  const [isClick, setIsClick] = useState(false)

  const handleSetInputValue = (value, key) => {
    setData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const closeSnackBar = () => {
    if (openSnack.message === '資料建立中請稍候') return
    setOpenSnack(
      produce(draft => {
        draft.open = false
      })
    )
  }

  const restPage = () => {
    setData({
      name: '',
      cellphone: '',
      count: 1,
      merchantName: '測試店家',
      isExist: false
    })
  }

  const handleSubmit = async () => {
    setIsClick(true)
    const { name, cellphone, count } = cloneDeep(data)
    try {
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'warning',
            draft.message = '資料建立中請稍候'
        })
      )
      if (!cellphone.match(/^[0-9]{5,20}$/)) throw new Error('電話格式有誤: 請輸入5-20碼的數字。')
      if (!count) throw new Error('張數為必填欄位')
      if (count > 500) throw new Error('單次發券張數不可超過500張')
      if (!name.trim()) throw new Error('姓名欄位為必填。')
      let url = 'https://beautyos-api-prod-htlfg34mhq-de.a.run.app/outer_store/send_event_ticket'
      if (window.location.href.indexOf('app.beautyos.co') === -1) {
        url = 'http://localhost:4849/outer_store/send_event_ticket'
      }
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
      if (res.status === 400) {
        const message = await res.json()
        throw new Error(message)
      } else {
        restPage()
        setOpenSnack(
          produce(draft => {
            draft.open = true,
              draft.severity = 'success',
              draft.message = '發券成功'
          })
        )
      }
    } catch (error) {
      setIsClick(false)
      setOpenSnack(
        produce(draft => {
          draft.open = true,
            draft.severity = 'error',
            draft.message = error.message
        })
      )
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
  }, [checkExistData.loading])

  useEffect(() => {
    if (!getMerchantName.loading) {
      const data = getMerchantName.data.getMerchantName
      handleSetInputValue(data, 'merchantName')
    }
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
                  handleSetInputValue(parseInt(e.target.value) ? parseInt(e.target.value) : '', 'count')
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
        variant="primary"
        size="lg"
        className="h-11 w-full"
        disabled={checkExistData.loading || !data.name.trim()}
        onClick={handleSubmit}
      >{isClick ? <LoaderCircle className="animate-spin" strokeWidth={1.75} /> : '提交'}</Button>
      <Snackbar
        onClose={closeSnackBar}
        open={openSnack.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} severity={openSnack.severity} variant="filled">{openSnack.message}</Alert>
      </Snackbar>
    </Page>
  )
}

export default index
