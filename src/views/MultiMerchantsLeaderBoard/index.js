/** @jsxImportSource @emotion/react */
import {
	Container, Button, CircularProgress, TextField,
	Grid, Autocomplete, ToggleButtonGroup, ToggleButton
} from '@mui/material'
import Page from 'components/Page'
import { useState, useEffect } from 'react'
import AdminPageHeader from 'components/AdminPageHeader'
import MerchantListAutocpmplete from 'components/MerchantListAutocpmplete'
import DateSelector from 'components/DateSelector'
import { startOfDay, endOfDay, format } from 'date-fns'
import useFetchGetVendor from 'hooks/useFetchGetVendor'
import useFetchGetMultiMerchantsLeaderBoard from 'hooks/useFetchGetMultiMerchantsLeaderBoard'
import useFetchGetMultiMerchantsLeaderBoardExcel from 'hooks/useFetchGetMultiMerchantsLeaderBoardExcel'
import Results from './Results'
import idx from 'idx'
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
	btnWrap: css({
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexWrap: 'wrap',
		rowGap: '10px',
		columnGap: '100px'
	}),
	searchBtn: css({
		width: '100px',
	}),
}

const MultiMerchantsLeaderBoard = () => {
	const [date, setDate] = useState({
		startDate: startOfDay(new Date()).getTime(),
		endDate: endOfDay(new Date()).getTime(),
	})
	const [vendorOptions, setVendorOptions] = useState([])
	const [sort, setSort] = useState('PERFORMANCE')
	const [submitValue, setSubmitValue] = useState({
		selectVendor: null,
		merchantId: []
	})
	const [reportData, setReportData] = useState([])
	const getVendor = useFetchGetVendor()
	const [getMultiMerchantsLeaderBoardLazy, getMultiMerchantsLeaderBoardLazyData] = useFetchGetMultiMerchantsLeaderBoard()
	const [getMultiMerchantsLeaderBoardExcelLazy, getMultiMerchantsLeaderBoardExcelLazyData] = useFetchGetMultiMerchantsLeaderBoardExcel()

	useEffect(() => {
		handleSearch(date)
	}, [date])

	useEffect(() => {
		if (!getMultiMerchantsLeaderBoardLazyData.loading && getMultiMerchantsLeaderBoardLazyData.data !== undefined) {
			const data = idx(getMultiMerchantsLeaderBoardLazyData, _ => _.data.multiMerchantsLeaderBoard)
			let sortData
			if (sort === 'PERFORMANCE') {
				sortData = data.sort((a, b) => a.sorting - b.sorting)
			} else {
				sortData = data.sort((a, b) => b.totalCount - a.totalCount)
			}
			setReportData([...sortData]);
		}
	}, [getMultiMerchantsLeaderBoardLazyData.loading, sort])

	useEffect(() => {
		if (!getVendor.loading) {
			const data = idx(getVendor, _ => _.data.getVendor)
			setVendorOptions(data)
		}
	}, [getVendor.loading])

	useEffect(() => {
		if (!getMultiMerchantsLeaderBoardExcelLazyData.loading && getMultiMerchantsLeaderBoardExcelLazyData.data !== undefined) {
			const url = idx(getMultiMerchantsLeaderBoardExcelLazyData, _ => _.data.multiMerchantsLeaderBoardExcel)
			const link = document.createElement('a')
			link.href = url
			link.click()
		}
	}, [getMultiMerchantsLeaderBoardExcelLazyData.loading])

	const handleSearch = (
		inputDate = date,
		vendor = submitValue.selectVendor === null ? null : submitValue.selectVendor.uuid,
		merchantId
	) => {
		getMultiMerchantsLeaderBoardLazy({
			variables: {
				input: inputDate,
				vendorUUId: vendor,
				merchantId: merchantId ? [] : submitValue.merchantId
			}
		})
	}

	const handleGetExcelUrl = () => {
		const vendor = submitValue.selectVendor === null ? null : submitValue.selectVendor.uuid
		getMultiMerchantsLeaderBoardExcelLazy({
			variables: {
				input: date,
				vendorUUId: vendor,
				merchantId: submitValue.merchantId,
				sortBy: sort
			}
		})
	}

	return (
		<Page css={styles.root} className='multiMerchantsLeaderBoard' title="多店店販銷售排行">
			<Container maxWidth={false} css={styles.container}>
				<div className="merchantNamePrint" style={{ marginBottom: '10px', display: "none", justifyContent: "space-between" }}>
					<div className="merchantNamePrint">
						{JSON.parse(localStorage.getItem('userMerchant')).name +
							'   ' +
							format(new Date(date.startDate), 'yyyy-MM').toLocaleString() +
							'   ' +
							'多店店販銷售排行'}
					</div>
					<div className="merchantNamePrint">
						{'列印時間： ' +
							format(new Date(), 'yyyy-MM-dd-HH:mm').toLocaleString()}
					</div>
				</div>
				<AdminPageHeader title='多店店販銷售排行' />
				<Grid container className='noprint' alignItems='center' style={{ justifyContent: 'space-between' }}>
					<Grid style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }} item>
						<DateSelector
							date={date}
							attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
							dateChange={value => setDate(value)}
							margin
						/>
						<Autocomplete
							style={{ width: 200 }}
							autoHighlight
							disabled={getVendor.loading}
							options={vendorOptions}
							variant='contained'
							value={submitValue.selectVendor}
							onChange={(event, value) => {
								setSubmitValue({ ...submitValue, selectVendor: value })
								value === null && handleSearch(date, null)
							}}
							getOptionLabel={option => option.name}
							filterOptions={(options, { inputValue }) => {
								const newOptions = options.filter(d =>
									d.name.toLocaleUpperCase().includes(inputValue.toLocaleUpperCase())
								)
								return newOptions
							}}
							renderOption={(props, option) => {
								props.key = props.id
								return (
									<li {...props}>
										{option.name}
									</li>
								)
							}}
							renderInput={params => (
								<TextField
									{...params}
									variant="outlined"
									label="選擇廠商"
									placeholder="廠商名稱"
									InputProps={{
										...params.InputProps,
									}}
								/>
							)}
						/>
						<div style={{ marginTop: -23 }}>
							<div className="divText">排序依據：</div>
							<ToggleButtonGroup
								size="small"
								value={sort}
								onChange={(e, value) => setSort(value)}
								exclusive
							>
								<ToggleButton value='PERFORMANCE'>業績</ToggleButton>
								<ToggleButton value='TOTALCOUNT'>數量</ToggleButton>
							</ToggleButtonGroup>
						</div>
					</Grid>
					<Grid css={styles.btnWrap} style={{ justifySelf: 'flex-end', margin: '10px 0' }} item>
						<div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
							<Button
								color="primary"
								variant="contained"
								size="medium"
								disabled={getMultiMerchantsLeaderBoardExcelLazyData.loading}
								onClick={handleGetExcelUrl}
							>
								報表匯出
							</Button>
							<Button
								color="primary"
								variant="contained"
								disabled={getMultiMerchantsLeaderBoardLazyData.loading}
								onClick={() => window.print()}
								size="medium"
							>
								列印
							</Button>
						</div>
					</Grid>
				</Grid>
				<div className="noprint" style={{ display: 'flex', margin: '12px 0' }}>
					<MerchantListAutocpmplete
						onValueChange={value => {
							setSubmitValue({ ...submitValue, merchantId: value })
							value.length === 0 && handleSearch(date, undefined, [])
						}}
					/>
					<div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => handleSearch()}
							disabled={getMultiMerchantsLeaderBoardLazyData.loading || getMultiMerchantsLeaderBoardLazyData.data === undefined}
							css={styles.searchBtn}
						>
							搜尋
						</Button>
					</div>
				</div>
				{getMultiMerchantsLeaderBoardLazyData.loading && getMultiMerchantsLeaderBoardLazyData.data === undefined ?
					<div style={{ textAlign: 'center', marginTop: '100px' }}>
						<CircularProgress color="primary" />
					</div>
					:
					<Results reportData={reportData} />
				}
			</Container>
		</Page>
	)
}

export default MultiMerchantsLeaderBoard