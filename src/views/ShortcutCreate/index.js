/** @jsxImportSource @emotion/react */
import { Container, CircularProgress } from '@mui/material'
import { useFetchServicesForTransferList } from 'hooks/useFetchServices'
import { useFetchProductsInTransferList } from 'hooks/useFetchProducts'
import { useFetchTicketsForTransferList } from 'hooks/useFetchTickets'
import { useFetchGetMembershipsForTransferList } from 'hooks/useFetchGetMembership'
import { createShortcutFunc } from 'hooks/useFetchShortcut'
import { openSnackbar } from 'elements/snackbars'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import { useMemo, useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import produce from 'immer'

import Page from 'components/Page'
import PageTitle from 'components/PageTitle'
import General from './General'

const styles = {
  root: css({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  }),
}

function ShortcutCreate() {
  const history = useHistory()
  const services = useFetchServicesForTransferList()
  const products = useFetchProductsInTransferList()
  const tickets = useFetchTicketsForTransferList({ isLaunched: true })
  const memberCards = useFetchGetMembershipsForTransferList({ isAvailableForSale: true, })
  const { createShort } = createShortcutFunc()
  const [isClick, setIsClick] = useState(false)
  const [servicesData, setServicesData] = useState([])
  const [productData, setProductData] = useState([])
  const [ticketData, setTicketData] = useState([])
  const [memberCardsData, setMemberCardsData] = useState([])
  const [servicesKeyword, setServicesKeyword] = useState('')
  const [productKeyword, setProductKeyword] = useState('')
  const [ticketKeyword, setTicketKeyword] = useState('')
  const [memberCardsKeyword, setMemberCardsKeyword] = useState('')
  const [submitData, setSubmitData] = useState({
    no: '',
    name: '',
    serviceIds: [],
    productIds: [],
    ticketIds: [],
    membershipIds: []
  })

  const isLoading = useMemo(() => {
    return (
      services.loading || products.loading || tickets.loading || memberCards.loading
    )
  }, [
    services.loading, products.loading, tickets.loading, memberCards.loading
  ])

  const keyWordsOnChange = (value, type) => {
    switch (type) {
      case 'SERVICE':
        setServicesKeyword(value)
        break;
      case 'PRODUCT':
        setProductKeyword(value)
        break;
      case 'TICKET':
        setTicketKeyword(value)
        break;
      case 'MEMBERCARD':
        setMemberCardsKeyword(value)
        break;
    }
  }

  const handleSetValue = (value, key) => {
    setSubmitData(
      produce(draft => {
        draft[key] = value
      })
    )
  }

  const doFilter = (data, keyword) => {
    return data.map(d => {
      if (!keyword) {
        d.display = true
        return d
      } else {
        d.display = d.no && d.no.includes(keyword) || d.name && d.name.includes(keyword)
        return d
      }
    })
  }

  const handleSubmit = async () => {
    setIsClick(true)
    try {
      if (!submitData.name) throw new Error('名稱不得為空')
      await createShort({
        input: submitData
      })
      openSnackbar({
        variant: 'success',
        message: '新增成功'
      })
      history.push('/shortcut')
    } catch (error) {
      openSnackbar({
        variant: 'error',
        message: error.message
      })
      setIsClick(false)
    }
  }

  useEffect(() => {
    if (!services.loading) {
      const data = services.data.services.data
      const filtData = doFilter(data, servicesKeyword)
      setServicesData(filtData)
    }
  }, [services.loading, servicesKeyword])

  useEffect(() => {
    if (!products.loading) {
      const data = products.data.products.data
      const filtData = doFilter(data, productKeyword)
      setProductData(filtData)
    }
  }, [products.loading, productKeyword])

  useEffect(() => {
    if (!tickets.loading) {
      const data = tickets.data.tickets
      const filtData = doFilter(data, ticketKeyword)
      setTicketData(filtData)
    }
  }, [tickets.loading, ticketKeyword])

  useEffect(() => {
    if (!memberCards.loading) {
      const data = memberCards.data.memberships.data.map(({ uuid, ...rest }) => (
        {
          ...rest,
          id: uuid
        }
      ))
      const filtData = doFilter(data, memberCardsKeyword)
      setMemberCardsData(filtData)
    }
  }, [memberCards.loading, memberCardsKeyword])

  return (
    <Page css={styles.root} title="新增組合設定">
      <Container maxWidth={false}  >
        <PageTitle title='新增組合設定' subTitle='shortcut create' />
        {isLoading ? (
          <div style={{ width: '100%', marginTop: 200, display: 'flex', justifyContent: 'center' }} >
            <CircularProgress color="primary" sx={{ textAlign: 'center' }} />
          </div>
        ) : (
          <General
            servicesData={servicesData}
            servicesKeyword={servicesKeyword}
            productData={productData}
            productKeyword={productKeyword}
            ticketData={ticketData}
            ticketKeyword={ticketKeyword}
            memberCardsData={memberCardsData}
            memberCardsKeyword={memberCardsKeyword}
            keyWordsOnChange={keyWordsOnChange}
            handleSetValue={handleSetValue}
            submitData={submitData}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isClick={isClick}
          />
        )}
      </Container>
    </Page>
  )
}

export default ShortcutCreate
