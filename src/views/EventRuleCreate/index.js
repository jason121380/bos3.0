/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import { useState, useEffect } from 'react'
import useFetchGetAttribution from 'hooks/useFetchGetAttribution'
import { useFetchGetMainEventForRule } from 'hooks/useFetchGetMainEvent'
import useFetchCreateEventRuleGroup from 'hooks/useFetchCreateEventRuleGroup'
import idx from 'idx'
import { cloneDeep } from 'lodash'
import { useHistory } from 'react-router'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import General from './General'
import { openSnackbar } from 'elements/snackbars'
import { startOfDay, endOfDay } from 'date-fns'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
  headerWrap: css({
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10
  })
}

function EventRuleCreate({ match }) {
  const history = useHistory()
  const getAttribution = useFetchGetAttribution()
  const getMainEvent = useFetchGetMainEventForRule({ eventId: match.params.id })
  const { createRule } = useFetchCreateEventRuleGroup()
  const [attributions, setAttributions] = useState([])
  const [isClick, setIsClick] = useState(false)
  const [mainEvent, setMainEvent] = useState({
    name: '',
    start: new Date().getTime(),
    end: new Date().getTime(),
    maxCount: 0
  })
  const [inputValue, setInputValue] = useState({
    nameForGroup: '',
    startDateForGroup: new Date().getTime(),
    endDateForGroup: new Date().getTime(),
    merchants: [],
    product: false,
    membershipCard: false,
    consumptionTypeUsing: 'ALL',
    service: {
      type: '',
      belong: []
    },
    ticketSellInPerformance: {
      type: '',
      belong: []
    },
    ticketSellNotInPerformance: {
      type: '',
      belong: []
    },
    ticketUsePerformanceEntered: {
      type: '',
      belong: []
    },
    ticketUsePerformanceNotEntered: {
      type: '',
      belong: []
    },
    walletDepositForCash: {
      using: false,
      price: 0
    },
    walletDepositForOtherPay: {
      using: false,
      price: 0
    },
    payTypeUsing: [],
    thresholdPrice: 0,
    isSMSNotifyForGroup: false,
    maxCountForGroup: 0,
    maxCountPerOrder: 0
  })

  useEffect(() => {
    if (!getAttribution.loading) {
      const data = idx(getAttribution, _ => _.data.getAttribution).map(({ name }) => name)
      setAttributions(data)
    }
  }, [getAttribution.loading])

  useEffect(() => {
    if (!getMainEvent.loading) {
      const {
        nameDefault, startDateDefault, endDateDefault,
        isSMSNotifyDefault, maxCountDefault
      } = idx(getMainEvent, _ => _.data.mainEvent)

      const cloneData = cloneDeep(inputValue)

      cloneData.startDateForGroup = startDateDefault
      cloneData.endDateForGroup = endDateDefault
      cloneData.isSMSNotifyForGroup = isSMSNotifyDefault
      cloneData.maxCountForGroup = maxCountDefault

      setInputValue(cloneData)

      setMainEvent({
        name: nameDefault,
        start: startDateDefault,
        end: endDateDefault,
        maxCount: maxCountDefault
      })
    }
  }, [getMainEvent.loading])

  const handleSubmit = async () => {
    const {
      nameForGroup, startDateForGroup, endDateForGroup, merchants, product, membershipCard,
      consumptionTypeUsing, service, maxCountForGroup, payTypeUsing, thresholdPrice, isSMSNotifyForGroup,
      ticketSellNotInPerformance, ticketUsePerformanceEntered, maxCountPerOrder, ticketSellInPerformance,
      ticketUsePerformanceNotEntered, walletDepositForCash, walletDepositForOtherPay
    } = cloneDeep(inputValue)
    const submitData = {
      mainEventId: match.params.id,
      nameForGroup: nameForGroup.trim(),
      startDateForGroup: startOfDay(startDateForGroup).getTime(),
      endDateForGroup: endOfDay(endDateForGroup).getTime(),
      merchants,
      consumptionTypeUsing,
      maxCountForGroup,
      payTypeUsing,
      thresholdPrice,
      isSMSNotifyForGroup,
      maxCountPerOrder,
      consumptionTypeRules: [],
      walletDepositRules: []
    }
    try {
      setIsClick(true)
      const checkArr = [
        {
          data: service,
          enum: 'SERVICE',
          errorMessage: '請選擇服務套用的歸屬。'
        },
        {
          data: ticketSellInPerformance,
          enum: 'TICKETSELLINPERFORMANCE',
          errorMessage: '請選擇賣卡先入套用的歸屬。'
        },
        {
          data: ticketSellNotInPerformance,
          enum: 'TICKETSELLNOTINPERFORMANCE',
          errorMessage: '請選擇賣卡後入套用的歸屬。'
        },
        {
          data: ticketUsePerformanceEntered,
          enum: 'TICKETUSEPERFORMANCEENTERED',
          errorMessage: '請選擇用卡先入套用的歸屬。'
        },
        {
          data: ticketUsePerformanceNotEntered,
          enum: 'TICKETUSEPERFORMANCENOTENTERED',
          errorMessage: '請選擇用卡後入套用的歸屬。'
        },
      ]

      const walletDepositArr = [
        {
          data: walletDepositForCash,
          enum: 'CASH',
          errorMessage: '入金儲值現金金額門檻不得為0。'
        },
        {
          data: walletDepositForOtherPay,
          enum: 'OTHERPAY',
          errorMessage: '入金儲值其他付款方式金額門檻不得為0。'
        },
      ]

      if (!submitData.nameForGroup) throw new Error('請輸入活動名稱。')

      if (consumptionTypeUsing !== 'ALL') {
        if (product) {
          submitData.consumptionTypeRules.push({
            consumptionType: 'PRODUCT',
            attributionRange: 'ALL',
            attributions: [],
          })
        }
        if (membershipCard) {
          submitData.consumptionTypeRules.push({
            consumptionType: 'MEMBERSHIP',
            attributionRange: 'ALL',
            attributions: [],
          })
        }

        checkArr.forEach(item => {
          if (item.data.type !== '') {
            if (item.data.type === 'ALL') {
              submitData.consumptionTypeRules.push({
                consumptionType: item.enum,
                attributionRange: 'ALL',
                attributions: [],
              })
            } else {
              if (!item.data.belong.length) throw { message: item.errorMessage }
              submitData.consumptionTypeRules.push({
                consumptionType: item.enum,
                attributionRange: 'SPECIFIC',
                attributions: item.data.belong,
              })
            }
          }
        })

        if (!submitData.consumptionTypeRules.length) throw new Error('請選套用的消費類型。')
      }

      if (!submitData.payTypeUsing.length) throw new Error('請選擇適用付款方式。')

      walletDepositArr.forEach(item => {
        if (item.data.using) {
          if (item.data.price === 0) throw new Error(item.errorMessage)
          submitData.walletDepositRules.push({
            payType: item.enum,
            depositThreshold: item.data.price
          })
        }
      })
      const res = await createRule(submitData)
      if (res.data.createEventRuleGroup) {
        openSnackbar({
          message: '建立成功',
          variant: 'success'
        })
        history.push('/main-event-list')
      } else {
        openSnackbar({
          message: '建立失敗',
          variant: 'warning'
        })
        setIsClick(false)
      }

    } catch (error) {
      openSnackbar({
        message: error.message,
        variant: 'error'
      })
      setIsClick(false)
    }
  }

  return (
    <Page css={styles.root} title="建立規則">
      <Container maxWidth="md">
        <PageTitle title='建立規則' subTitle='event rule Create' />
        {getMainEvent.loading ? (
          <div style={{ textAlign: 'center', marginTop: 150 }}>
            <CircularProgress />
          </div>
        ) : (
          <General
            inputValue={inputValue}
            attributions={attributions}
            setInputValue={setInputValue}
            handleSubmit={handleSubmit}
            isClick={isClick}
            mainEvent={mainEvent}
            eventId={match.params.id}
          />
        )}
      </Container>
    </Page>
  )
}

export default EventRuleCreate
