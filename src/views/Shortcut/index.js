import Page from 'components/Page'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useShortcuts } from 'hooks/useFetchShortcut'
import { Skeleton } from 'ui/skeleton'
import idx from 'idx'

import Results from './Results'
import QueryFailed from 'components/QueryFailed'
import { Button } from 'ui/button'
import { PageHeader } from 'ui/page-header'

const Shortcut = () => {
	const shortcuts = useShortcuts()
	const [reportData, setReportData] = useState([])
	const [open, setOpen] = useState([])

	const handleOpenCollapse = id => {
		const idx = open.indexOf(id)
		if (idx > -1) {
			const arr = [...open]
			arr.splice(idx, 1)
			setOpen(arr)
		} else {
			setOpen([...open, id])
		}
	}

	const handleToggleAll = () => {
		if (open.length === reportData.length) {
			setOpen([])
		} else {
			setOpen(reportData.map(d => d.id))
		}
	}

	useEffect(() => {
		if (!shortcuts.loading) {
			// 查詢失敗時當成沒有組合（原本讀 undefined.shortcuts 整頁進入錯誤畫面）
			const data = idx(shortcuts, _ => _.data.shortcuts) || []
			const tidyData = []
			data.forEach(({
				services, products, memberships, tickets, ...d
			}) => {
				const collapesRow = Math.max(
					services.length, products.length, memberships.length, tickets.length
				)
				const rowData = {
					id: d.id,
					name: d.name,
					no: d.no,
					createdAt: d.createdAt,
					updatedAt: d.updatedAt,
					creator: d.creator,
					editor: d.editor,
					collapesData: []
				}

				for (let i = 0; i < collapesRow; i++) {

					const service = services[i] ? {
						no: services[i].no,
						name: services[i].name,
						price: services[i].price,
					} : null

					const product = products[i] ? {
						no: products[i].no,
						name: products[i].name,
						price: products[i].sellPrice,
					} : null

					const ticket = tickets[i] ? {
						no: tickets[i].no,
						name: tickets[i].name,
						price: tickets[i].price,
					} : null

					const membership = memberships[i] ? {
						no: memberships[i].no,
						name: memberships[i].name,
						price: memberships[i].sellPrice,
					} : null

					rowData.collapesData.push({
						service, product, ticket, membership
					})

				}

				tidyData.push(rowData)
			})
			setReportData(tidyData)
		}
	}, [shortcuts.loading])


	return (
		<Page className="ui-root" title="組合設定">
			<div>
				<PageHeader
				  title="組合設定"
				  actions={
				    <>
				      <Button asChild variant="primary">
				        <RouterLink to={'/shortcut/create'}>{'新增組合'}</RouterLink>
				      </Button>
				    </>
				  }
				/>
				{shortcuts.error ? (
          <QueryFailed onRetry={() => shortcuts.refetch()} />
        ) : shortcuts.loading ? (
					<Skeleton className="h-[320px] w-full rounded-lg" aria-label="載入中" />
				) : (
					<Results reportData={reportData} open={open} openCollapse={handleOpenCollapse} onToggleAll={handleToggleAll} />
				)}

			</div>
		</Page>
	)
}

export default Shortcut