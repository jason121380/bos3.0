/** @jsxImportSource @emotion/react */
import {
  Container, CircularProgress, Button, Dialog, DialogTitle, DialogActions
} from '@mui/material'
import { useFetchServicesForTransferList } from 'hooks/useFetchServices'
import { useFetchProductsInTransferList } from 'hooks/useFetchProducts'
import { useFetchTicketsForTransferList } from 'hooks/useFetchTickets'
import { useFetchGetMembershipsForTransferList } from 'hooks/useFetchGetMembership'
import { updateShortcutFunc, deleteShortcutFunc } from 'hooks/useFetchShortcut'
import { getShortcut } from 'hooks/useFetchShortcut'
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

function ShortcutEdit({ match }) {
  const history = useHistory()
  const shortcut = getShortcut(match.params.id)
  const services = useFetchServicesForTransferList()
  const products = useFetchProductsInTransferList()
  const tickets = useFetchTicketsForTransferList({ isLaunched: true })
  const memberCards = useFetchGetMembershipsForTransferList({ isAvailableForSale: true, })
  const { updateShortcut } = updateShortcutFunc()
  const { deleteShortcut } = deleteShortcutFunc()
  const [isClick, setIsClick] = useState(false)
  const [servicesData, setServicesData] = useState(null)
  const [productData, setProductData] = useState(null)
  const [ticketData, setTicketData] = useState(null)
  const [memberCardsData, setMemberCardsData] = useState(null)
  const [servicesKeyword, setServicesKeyword] = useState('')
  const [productKeyword, setProductKeyword] = useState('')
  const [ticketKeyword, setTicketKeyword] = useState('')
  const [memberCardsKeyword, setMemberCardsKeyword] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
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
      services.loading || products.loading || tickets.loading ||
      memberCards.loading || shortcut.loading
    )
  }, [
    services.loading, products.loading, tickets.loading,
    memberCards.loading, shortcut.loading
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
      await updateShortcut({
        input: {
          id: match.params.id,
          newShortcut: submitData
        }
      })
      openSnackbar({
        variant: 'success',
        message: '儲存成功'
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

  const handleDelete = async () => {
    setIsClick(true)
    try {
      await deleteShortcut(match.params.id)
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
    if (!shortcut.loading) {
      const getIds = (data) => data.map(d => d.id || d.uuid)
      const {
        no, name, services, products,
        tickets, memberships
      } = shortcut.data.shortcut

      setSubmitData({
        no,
        name,
        serviceIds: getIds(services),
        productIds: getIds(products),
        ticketIds: getIds(tickets),
        membershipIds: getIds(memberships)
      })
    }
  }, [shortcut.loading])

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
    <>
      <Page css={styles.root} title="編輯組合設定">
        <Container maxWidth={false} >
          <div style={{ width: '100%', gap: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <PageTitle title='編輯組合設定' subTitle='shortcut edit' />
            <Button onClick={() => setOpenDialog(true)} disabled={isClick} color='error' variant='contained' >刪除</Button>
          </div>
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
      <Dialog open={openDialog}>
        <DialogTitle>確認要刪除此組合？</DialogTitle>
        <DialogActions>
          <Button disabled={isClick} onClick={() => setOpenDialog(false)} color="primary" variant='contained'>
            取消
          </Button>
          <Button disabled={isClick} onClick={handleDelete} color="primary" variant='contained'>
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShortcutEdit
