/** @jsxImportSource @emotion/react */
import { Container, Button, Grid, CircularProgress } from '@mui/material'
import Page from 'components/Page'
import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { getShortcuts } from 'hooks/useFetchShortcut'
import { css } from '@emotion/react'
import { theme } from '../../theme'

import Results from './Results'
import PageTitle from 'components/PageTitle'

const styles = {
	root: css({}),
	container: css({
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(3),
	}),
}

const Shortcut = () => {
	const shortcuts = getShortcuts()
	const [reportData, setReportData] = useState([])
	const [open, setOpen] = useState([])

	const handleOpenCollapse = id => {
		const idx = open.indexOf(id)
		if (idx > -1) {
			const arr = open
			arr.splice(idx, 1)
			setOpen([...arr])
		} else {
			setOpen([...open, id])
		}
	}

	useEffect(() => {
		if (!shortcuts.loading) {
			const data = shortcuts.data.shortcuts
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
		<Page css={styles.root} title="組合設定">
			<Container maxWidth={false} css={styles.container}>
				<Grid alignItems='center' item container justifyContent='space-between'>
					<PageTitle title='組合設定' subTitle='shortcut' />
					<Grid item>

						<Button
							color="primary"
							variant="contained"
							component={RouterLink}
							to="/shortcut/create"
						>
							新增
						</Button>
					</Grid>
				</Grid>
				{shortcuts.loading ? (
					<div style={{ textAlign: 'center', marginTop: 100 }}><CircularProgress /></div>
				) : (
					<Results reportData={reportData} open={open} openCollapse={handleOpenCollapse} />
				)}

			</Container>
		</Page>
	)
}

export default Shortcut