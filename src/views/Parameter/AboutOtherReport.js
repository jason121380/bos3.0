import { CheckboxField } from 'ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from 'ui/toggle-group'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import cloneDeep from 'lodash/cloneDeep'

const checkboxSettings = [
  {label: '費用分析表與損益表出現人員薪資項目', key: 'isDesignerSalaryDisplayOnBalanceReport'},
  {label: '報表匯出客資遮碼', key: 'isCustomerDataMarked'},
  {label: '顯示設計師排行榜服務業績月平均', key: 'isMonthlyAverageDisplayForDesignerLeaderBoard'},
  {label: '顯示設計師排行榜客次數', key: 'isDRROCDisplay'},
  {label: '顯示設計師排行榜業績預估值', key: 'isDRRPEVDisplay'},
  {label: '顯示店家排行榜服務業績月平均', key: 'isMonthlyAverageDisplayForMerchantLeaderBoard'},
  {label: '顯示商品列表成本', key: 'isProductCostDisplay'},
  {label: '店家日報表合併服務業績/卡券使用入業績/卡券販賣入業績', key: 'isServiceTicketMerged'},
  {label: '帳單列表使用區間日期選擇器', key: 'isOpenDateRangeInOrderMangement'},
  {label: '隱藏虛實業績切換按鈕', key: 'isDisplayTogglePerformanceButton'},
  {label: '費用分析表顯示加扣項的百分比', key: 'CARPTDisplay'},
  {label: '顯示現場電腦打卡篩選器', key: 'isEDCIFilterDisplay'},
  {label: '互助排行榜合併多店同一人員業績', key: 'isMultiStoreStaffPerfMergedHL'},
  {label: '設計師排行榜合併多店同一人員業績', key: 'isMultiStoreStaffPerfMergedDL'},
  {label: '卡券販賣不顯示客項次', key: 'isTSNoOT' },
  {label: '顯示非現金表格', key: 'nonCashDisplay' },
]

const toggleSettings = [
  {label: '多店業績相關報表業績顯示依據', key: 'multiStorePerfRef'},
]

function AboutOtherReport({
  className,
  inputEnable,
  aboutReport,
  setAboutReport
}) {
  const handleCheckboxChange = (key) => {
    const newData = cloneDeep(aboutReport)
    newData[key] = !newData[key]
    setAboutReport(newData)
  }
  
  const handleToggleChange = (key, value) => {
    if (value !== null) {
      const newData = cloneDeep(aboutReport)
      newData[key] = value
      setAboutReport(newData)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>其他報表設定</CardTitle>
      </CardHeader>
      <CardContent>
        {checkboxSettings.map(d => (
          <div className="flex items-center mb-[24px]" key={d.label}>
            <CheckboxField
              disabled={!inputEnable}
              className="mx-[20px] my-0"
              label={d.label}
              checked={aboutReport[d.key]}
              onChange={() => handleCheckboxChange(d.key)}
            />
          </div>
        ))}
        {toggleSettings.map(d => (
          <div className="flex items-center mb-[24px]" key={d.label}>
            <p>{d.label}：</p>
            <ToggleGroup
              className="mx-[20px] my-0"
              size="small"
              exclusive
              value={aboutReport[d.key]}
              onChange={(e, v) => handleToggleChange(d.key, v)}
            >
              <ToggleGroupItem value='EACH'>依各店</ToggleGroupItem>
              <ToggleGroupItem value='CURRENT'>依當前店家</ToggleGroupItem>
            </ToggleGroup>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default memo(AboutOtherReport)
