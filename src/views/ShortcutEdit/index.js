import { Button } from 'ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from 'ui/dialog'
import { PageHeader } from 'ui/page-header'
import { Skeleton } from 'ui/skeleton'
import { useFetchServicesForTransferList } from 'hooks/useFetchServices'
import { useFetchProductsInTransferList } from 'hooks/useFetchProducts'
import { useFetchTicketsForTransferList } from 'hooks/useFetchTickets'
import { useFetchGetMembershipsForTransferList } from 'hooks/useFetchGetMembership'
import { useUpdateShortcut, useDeleteShortcut } from 'hooks/useFetchShortcut'
import { useShortcut } from 'hooks/useFetchShortcut'
import { openSnackbar } from 'elements/snackbars'
import { useMemo, useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import produce from 'immer'
import idx from 'idx'

import Page from 'components/Page'
import General from './General'
import QueryFailed from 'components/QueryFailed'

function ShortcutEdit({ match }) {
  const history = useHistory()
  const shortcut = useShortcut(match.params.id)
  const services = useFetchServicesForTransferList()
  const products = useFetchProductsInTransferList()
  const tickets = useFetchTicketsForTransferList({ isLaunched: true })
  const memberCards = useFetchGetMembershipsForTransferList({ isAvailableForSale: true, })
  const { updateShortcut } = useUpdateShortcut()
  const { deleteShortcut } = useDeleteShortcut()
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
      default:
        // 其他值不處理（與原本沒有 default 時相同）
        break
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
      const found = idx(shortcut, _ => _.data.shortcut)
      // 查詢失敗或查無組合時不帶入（原本解構 undefined 整頁進入錯誤畫面）
      if (!found) return
      const {
        no, name, services, products,
        tickets, memberships
      } = found

      setSubmitData({
        no,
        name,
        serviceIds: getIds(services),
        productIds: getIds(products),
        ticketIds: getIds(tickets),
        membershipIds: getIds(memberships)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [shortcut.loading])

  useEffect(() => {
    if (!services.loading) {
      // 任一清單查詢失敗時該清單當成空的（原本讀 undefined 整頁進入錯誤畫面）
      const data = idx(services, _ => _.data.services.data) || []
      const filtData = doFilter(data, servicesKeyword)
      setServicesData(filtData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [services.loading, servicesKeyword])

  useEffect(() => {
    if (!products.loading) {
      const data = idx(products, _ => _.data.products.data) || []
      const filtData = doFilter(data, productKeyword)
      setProductData(filtData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [products.loading, productKeyword])

  useEffect(() => {
    if (!tickets.loading) {
      const data = idx(tickets, _ => _.data.tickets) || []
      const filtData = doFilter(data, ticketKeyword)
      setTicketData(filtData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [tickets.loading, ticketKeyword])

  useEffect(() => {
    if (!memberCards.loading) {
      const data = (idx(memberCards, _ => _.data.memberships.data) || []).map(({ uuid, ...rest }) => (
        {
          ...rest,
          id: uuid
        }
      ))
      const filtData = doFilter(data, memberCardsKeyword)
      setMemberCardsData(filtData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 只在查詢 loading 轉為 false 時同步一次；缺的 data 與 loading 同時更新
  }, [memberCards.loading, memberCardsKeyword])

  return (
    <>
      <Page className="ui-root" title="編輯組合設定">
        <div>
          <PageHeader
            title="編輯組合設定"
            actions={
              <Button onClick={() => setOpenDialog(true)} disabled={isClick} variant="danger">刪除</Button>
            }
          />
          {shortcut.error ? (
            <QueryFailed onRetry={() => shortcut.refetch()} />
          ) : isLoading ? (
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
      {/* 與舊版相同：不提供點背景或 Esc 關閉，只能按「取消」 */}
      <Dialog open={openDialog}>
        <DialogContent size="sm" hideClose>
          <DialogHeader>
            <DialogTitle>確認要刪除此組合？</DialogTitle>
            <DialogDescription>刪除後無法復原。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button disabled={isClick} onClick={() => setOpenDialog(false)} variant="secondary">
              取消
            </Button>
            <Button disabled={isClick} onClick={handleDelete} variant="danger">
              確認
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ShortcutEdit
