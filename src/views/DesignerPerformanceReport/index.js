/** @jsxImportSource @emotion/react */
import {
	Container,
	Button,
	CircularProgress,
	Grid,
	ToggleButton,
	ToggleButtonGroup
} from '@mui/material'
import Page from 'components/Page'
import { useState, useEffect } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import ReferToggleButton from 'components/ReferToggleButton'
import DateSelector from 'components/DateSelector'
import { startOfDay, endOfDay, format } from 'date-fns'
import Results from './Results'
import useFetchGetDesignerPerformance from 'hooks/useFetchGetDesignerPerformance'
import useFetchGetDesignerPerformanceExcel from 'hooks/useFetchGetDesignerPerformanceExcel'
import useFetchGetIsMemberShipCardActive from 'hooks/useFetchGetIsMemberShipCardActive'
import useFetchGetIsDisplayTogglePerformanceButton from 'hooks/useFetchGetIsDisplayTogglePerformanceButton'
import idx from 'idx'
import _ from 'lodash'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
	root: css({}),
	container: css({
		paddingTop: theme.spacing(3),
		paddingBottom: theme.spacing(3),
	}),
	results: css({
		marginTop: theme.spacing(3),
	}),
	disable: css({
		display: 'none',
	}),
	enable: css({
		display: 'flex',
	}),
}

const DesignerPerformanceReport = () => {
	const [type, setType] = useState('FAKE')
	const [sort, setSort] = useState('DESIGNERNO')
	const [date, setDate] = useState({
		startDate: startOfDay(new Date()).getTime(),
		endDate: endOfDay(new Date()).getTime(),
	})
	const [designerPerformance, setDesignerPerformance] = useState([])
	const [serviceCategory, setServiceCategory] = useState([])
	const [membershipDisplay, setMembershipDisplay] = useState(false)
	const [isDisplayTogglePerformanceButton, setIsDisplayTogglePerformanceButton] = useState(false)
	const isMemberShipCardActiveData = useFetchGetIsMemberShipCardActive()
	const isDisplayTogglePerformanceButtonData = useFetchGetIsDisplayTogglePerformanceButton()
	const [getDesignerPerformanceExcel, designerPerformanceExcelData] = useFetchGetDesignerPerformanceExcel()
	const getDesignerPerformance = useFetchGetDesignerPerformance({
		input: {
			date: date,
			performanceReference: type,
		}
	})

	useEffect(() => {
		if (!designerPerformanceExcelData.loading && designerPerformanceExcelData.data) {
			const url = idx(designerPerformanceExcelData, _ => _.data.designerPerformanceExcel)
			const link = document.createElement('a')
			link.href = url
			link.click()
		}
	}, [designerPerformanceExcelData.loading])

	useEffect(() => {
		if (!isDisplayTogglePerformanceButtonData.loading) {
			const isDisplayTogglePerformanceButton = idx(
				isDisplayTogglePerformanceButtonData, _ => _.data.getIsDisplayTogglePerformanceButton)
			setIsDisplayTogglePerformanceButton(isDisplayTogglePerformanceButton)
		}
	}, [isDisplayTogglePerformanceButtonData.loading])

	useEffect(() => {
		if (!getDesignerPerformance.loading && !isMemberShipCardActiveData.loading) {
			let performanceData = _.cloneDeep(getDesignerPerformance.data.designerPerformance)
			const isMemberShipCardActive = idx(isMemberShipCardActiveData, _ => _.data.getIsMemberShipCardActive)
			if (performanceData.length > 0) {
				const category = performanceData[0].designerPerformancePercented[0].serviceCategory.map(d => d.categoryName)
				const showMembership = isMemberShipCardActive || performanceData[0].designerPerformanceSum[0].membershipPerformance !== 0

				// 四捨五入
				for (let i in performanceData[0]) {
					if (i === 'designerPerformanceData') {
						performanceData[0][i].forEach(d => {
							for (let j in d) {
								if (j !== 'designerName') {
									if (j === 'serviceCategory') {
										d[j].forEach(e => {
											for (let k in e) {
												if (k !== 'categoryName' && e[k] !== null) {
													e[k] = Math.round(e[k])
												}
											}
										})
									} else if (d[j] !== null) {
										d[j] = Math.round(d[j])
									}
								}
							}
						})
					} else {
						performanceData[0][i].forEach(d => {
							for (let j in d) {
								if (j === 'serviceCategory') {
									d[j].forEach(e => {
										for (let k in e) {
											if (k !== 'categoryName' && e[k] !== null) {
												e[k] = Math.round(e[k])
											}
										}
									})
								} else if (j !== 'designerName' && d[j] !== null) {
									d[j] = Math.round(d[j])
								}
							}
						})
					}
				}
				if (sort === 'PERFORMANCE') {
					performanceData[0].designerPerformanceData = performanceData[0].designerPerformanceData.sort((a, b) => b.totalPerformance - a.totalPerformance)
				}
				setDesignerPerformance(performanceData)
				setServiceCategory(category)
				setMembershipDisplay(showMembership)
			} else {
				setDesignerPerformance([])
			}
		}
	}, [getDesignerPerformance.loading, isMemberShipCardActiveData.loading, sort])

	return (
		<Page css={styles.root} className='designerPerformanceReport' title="設計師業績表">
			<Container maxWidth={false} css={styles.container}>
				<div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
					<div className="merchantNamePrint">
						{JSON.parse(localStorage.getItem('userMerchant')).name +
							'   ' +
							format(new Date(date.startDate), 'yyyy-MM').toLocaleString() +
							'   ' +
							'設計師業績表'}
					</div>
					<div className="merchantNamePrint">
						{'列印時間： ' +
							format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
					</div>
				</div>
				<AdminPageHeader title='設計師業績表' />
				<Grid container className='noprint' alignItems='center' style={{ justifyContent: 'space-between' }}>
					<DateSelector
						date={date}
						attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
						dateChange={value => setDate(value)}
						margin
					/>
					<Grid
						item
						style={{
							display: 'flex',
							alignItems: 'center',
							flexWrap: 'wrap',
							gap: "10px 20px"
						}}
					>
						{!isDisplayTogglePerformanceButton && <div style={{ marginTop: '-23px' }}>
							<div className="divText">業績類型：</div>
							<ReferToggleButton
								value={type}
								onChange={value => value !== null && setType(value)}
							/>
						</div>
						}
						<div style={{ marginTop: '-23px' }}>
							<div className="divText">排序依據：</div>
							<ToggleButtonGroup
								size="small"
								value={sort}
								onChange={(event, value) => value !== null && setSort(value)}
								exclusive
							>
								<ToggleButton value='DESIGNERNO'>代號</ToggleButton>
								<ToggleButton value="PERFORMANCE">業績</ToggleButton>
							</ToggleButtonGroup>
						</div>
						<Button
							color="primary"
							variant="contained"
							disabled={designerPerformanceExcelData.loading}
							size="medium"
							onClick={() => {
								getDesignerPerformanceExcel({
									variables: {
										input: {
											date: date,
											performanceReference: type,
											sortType: sort
										}
									}
								})
							}}
						>
							報表匯出
						</Button>
						<Button
							color="primary"
							variant="contained"
							onClick={() => window.print()}
							disabled={getDesignerPerformance.loading} size="medium"
						>
							列印
						</Button>
					</Grid>
				</Grid>
				{getDesignerPerformance.loading ?
					<div style={{ textAlign: 'center', marginTop: '100px' }}>
						<CircularProgress color="primary" />
					</div>
					:
					<Results
						designerPerformance={designerPerformance}
						serviceCategory={serviceCategory}
						membershipDisplay={membershipDisplay}
					/>
				}
			</Container>
		</Page>
	)
}

export default DesignerPerformanceReport