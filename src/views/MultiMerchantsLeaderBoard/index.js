import {
	TextField, Autocomplete, ToggleButtonGroup, ToggleButton
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
import { Download, Printer } from 'lucide-react'
import { Button } from 'ui/button'
import { Skeleton } from 'ui/skeleton'

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
		<Page className='multiMerchantsLeaderBoard ui-root' title="多店店販銷售排行">
			<div>
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
				<div className='noprint flex flex-wrap items-center justify-between'>
					<div className="flex flex-wrap items-center gap-5">
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
					</div>
					<div className="my-2.5 flex flex-wrap items-center justify-between gap-x-[100px] gap-y-2.5 justify-self-end">
						<div className="flex flex-wrap gap-2.5">
							<Button
								variant="secondary"
								disabled={getMultiMerchantsLeaderBoardExcelLazyData.loading}
								onClick={handleGetExcelUrl}
							>
								<Download strokeWidth={1.75} />
								報表匯出
							</Button>
							<Button
								variant="secondary"
								disabled={getMultiMerchantsLeaderBoardLazyData.loading}
								onClick={() => window.print()}
							>
								<Printer strokeWidth={1.75} />
								列印
							</Button>
						</div>
					</div>
				</div>
				<div className="noprint my-3 flex">
					<MerchantListAutocpmplete
						onValueChange={value => {
							setSubmitValue({ ...submitValue, merchantId: value })
							value.length === 0 && handleSearch(date, undefined, [])
						}}
					/>
					<div className="ml-2.5 flex items-center">
						<Button
							variant="primary"
							onClick={() => handleSearch()}
							disabled={getMultiMerchantsLeaderBoardLazyData.loading || getMultiMerchantsLeaderBoardLazyData.data === undefined}
							className="w-[100px]"
						>
							搜尋
						</Button>
					</div>
				</div>
				{getMultiMerchantsLeaderBoardLazyData.loading && getMultiMerchantsLeaderBoardLazyData.data === undefined ?
					// 載入中：與舊版 CircularProgress 相同時機顯示
					<div className="noprint" aria-busy="true" aria-label="載入中">
						<Skeleton className="h-[320px] w-full rounded-lg" />
					</div>
					:
					<Results reportData={reportData} />
				}
			</div>
		</Page>
	)
}

export default MultiMerchantsLeaderBoard