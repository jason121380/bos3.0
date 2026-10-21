import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { useFetchServicesForTransferList } from 'hooks/useFetchServices'
import { useFetchProductsInTransferList } from 'hooks/useFetchProducts'
import { useFetchTicketsForTransferList } from 'hooks/useFetchTickets'
import { useFetchGetMembershipsForTransferList } from 'hooks/useFetchGetMembership'
import { useCreateShortcut } from 'hooks/useFetchShortcut'
import { openSnackbar } from 'elements/snackbars'
import { useMemo, useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import produce from 'immer'

import Page from 'components/Page'
import General from './General'

function ShortcutCreate() {
  const history = useHistory()
  const services = useFetchServicesForTransferList()
  const products = useFetchProductsInTransferList()
  const tickets = useFetchTicketsForTransferList({ isLaunched: true })
  const memberCards = useFetchGetMembershipsForTransferList({ isAvailableForSale: true, })
  const { createShort } = useCreateShortcut()
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
    // 複製每一筆再標記（查詢結果唯讀，不直接改）
    return data.map(item => {
      const d = { ...item }
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
    <Page className="ui-root" title="新增組合設定">
      <div>
        <PageHeader title="新增組合設定" />
        {isLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="載入中">
            <Skeleton className="h-[480px] w-full rounded-lg" />
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
      </div>
    </Page>
  )
}

export default ShortcutCreate
