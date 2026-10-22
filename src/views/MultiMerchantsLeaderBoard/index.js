import { TextField } from 'ui/text-field'
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
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Skeleton } from 'ui/skeleton'
import { ReportToolbar } from 'ui/page-header'
import { Autocomplete } from 'ui/combobox'

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
			// 後端回 null 時當成沒有資料，不讓整頁拋錯
			const data = idx(getMultiMerchantsLeaderBoardLazyData, _ => _.data.multiMerchantsLeaderBoard) || []
			let sortData
			if (sort === 'PERFORMANCE') {
				sortData = [...data].sort((a, b) => a.sorting - b.sorting) // 先複製再排序（查詢結果唯讀）
			} else {
				sortData = [...data].sort((a, b) => b.totalCount - a.totalCount)
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
				<AdminPageHeader title='多店店販銷售排行'>
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
				</AdminPageHeader>
				<ReportToolbar
					date={
						<DateSelector
							date={date}
							attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
							dateChange={value => setDate(value)}
						/>
					}
					filters={
						<>
							<div className="flex flex-col gap-1.5">
								<span className="text-label text-text-secondary">選擇廠商</span>
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
											size="small"
											placeholder="廠商名稱"
											inputProps={{ ...params.inputProps, 'aria-label': '選擇廠商' }}
											InputProps={{
												...params.InputProps,
											}}
										/>
									)}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<span className="text-label text-text-secondary">排序依據</span>
								<ToggleGroup
									size="small"
									value={sort}
									// 再按一次已選的排序時 value 為 null：維持原排序（原本變成兩個都未選、匯出送出空的 sortBy）
									onChange={(e, value) => value && setSort(value)}
									exclusive
								>
									<ToggleGroupItem value='PERFORMANCE'>業績</ToggleGroupItem>
									<ToggleGroupItem value='TOTALCOUNT'>數量</ToggleGroupItem>
								</ToggleGroup>
							</div>
							<div className="min-w-0 flex-1">
								<MerchantListAutocpmplete
									onValueChange={value => {
										setSubmitValue({ ...submitValue, merchantId: value })
										value.length === 0 && handleSearch(date, undefined, [])
									}}
								/>
							</div>
						</>
					}
					actions={
						<Button
							variant="primary"
							onClick={() => handleSearch()}
							disabled={getMultiMerchantsLeaderBoardLazyData.loading || getMultiMerchantsLeaderBoardLazyData.data === undefined}
							className="w-[100px] shrink-0"
						>
							搜尋
						</Button>
					}
				/>
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