import { Card, CardContent, CardHeader } from 'ui/card'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { HeaderActionsPortal } from 'ui/page-header'
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import roundDecimal from './../../helper/roundDecimal.js'

const styles = {
  root: 'flex justify-between',
  content: 'p-0 last:pb-4 print:!pb-0',
  subtotal: 'text-[red] font-bold',
  width: 'min-w-[250px]',
}

const checkArray = ['營業收入', '店販收入', '會員卡收入', '卡券販賣(先入業績)']

function Results({
  className,
  merchantIncomeStatement,
  moneyFlows,
  handleExcel,
  excelLoading,
  CARPTDISPLAY,
  ...rest
}) {
  const [cashRevenue, setCashRevenue] = useState(0);
  const [cashExpenditure, setCashExpenditure] = useState(0);
  const [denominator, setDenominator] = useState(0)

  const handleCalculate = ({ cashRevenue, cashExpenditure, subjectName }) => {
    if (checkArray.includes(subjectName)) {
      if (cashRevenue === 0) {
        return ''
      } else {
        return `${Math.round(Math.abs(cashRevenue / denominator * 10000)) / 100}%`
      }
    } else if (cashExpenditure === 0 || denominator === 0) {
      // 營收分母為 0（例如該月只有支出）時不顯示佔比（原本顯示「Infinity%」）
      return ''
    } else {
      return `${Math.round(Math.abs(cashRevenue + cashExpenditure) / denominator * 10000) / 100}%`
    }
  }

  useEffect(() => {
    if (merchantIncomeStatement !== undefined) {
      const cashRevenue = merchantIncomeStatement
        .map((data) => data.cashRevenue)
        .reduce((total, item) => (total = total + item), 0);
      setCashRevenue(cashRevenue);

      const cashExpenditure = merchantIncomeStatement
        .map((data) => data.cashExpenditure)
        .reduce((total, item) => (total = total + item), 0);
      setCashExpenditure(cashExpenditure);

      const filterDenominator = merchantIncomeStatement.filter(({ subjectName }) => (
        checkArray.includes(subjectName)
      ))
      const countDenominator = filterDenominator.reduce((a, b) => a + b.cashRevenue, 0)
      setDenominator(countDenominator)
    }
  }, [merchantIncomeStatement]);

  return (
    <div
      {...rest}
      className={`CostAnalysisReportTableContainer flex w-full flex-wrap ${styles.root}${className ? ` ${className}` : ''}`}
    >
      <div className="w-full min-[900px]:w-5/6">
        {merchantIncomeStatement !== undefined && (
          <>
          {/* 報表匯出：畫到頁首列印鈕左側（STYLE §14），資料與 handler 不變 */}
          <HeaderActionsPortal>
            <Button disabled={excelLoading} onClick={handleExcel} variant="secondary">
              <Download strokeWidth={1.75} />
              報表匯出
            </Button>
          </HeaderActionsPortal>
          <Card className="overflow-hidden text-text print:rounded-none print:shadow-none print:[&_table]:!border print:[&_table]:!border-solid print:[&_table]:!border-black print:[&_th]:!border-y print:[&_th]:!border-x-0 print:[&_th]:!border-solid print:[&_th]:!border-black print:[&_td]:!border print:[&_td]:!border-solid print:[&_td]:!border-[rgb(135,135,135)] print:[&_td:first-child]:!w-[220px] print:[&_td:first-child]:!border-l-0 print:[&_td:last-child]:!border-r-0">
            <CardHeader className="[&>div:first-child]:flex-auto !min-h-0 !items-center !gap-0 !px-4 !pb-2 !pt-4 CostAnalysisReportCardHeader noprint"><span className="block text-heading text-text">費用分析表</span></CardHeader>
            {/* 原生 hr：列印規則以 hr 選擇器隱藏分隔線 */}
            <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
            <CardContent className={styles.content}>
              <PerfectScrollbar>
                <div>
                  <Table dense>
                    <TableHeader>
                      <TableRow>
                        <TableHead className={styles.width}></TableHead>
                        <TableHead>加項</TableHead>
                        {CARPTDISPLAY && <TableHead>%</TableHead>}
                        <TableHead>扣項</TableHead>
                        {CARPTDISPLAY && <TableHead>%</TableHead>}
                        <TableHead>總佔比</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {merchantIncomeStatement.map(
                        (data, index) => (
                          <TableRow key={`IncomeStatement-${index}`}>
                            <TableCell>{data.subjectName}</TableCell>
                            <TableCell>
                              {data.cashRevenue > 0
                                ? Math.round(data.cashRevenue)
                                : ""}
                            </TableCell>
                            {CARPTDISPLAY && (
                              <TableCell>
                                {data.cashRevenue > 0
                                  ? `${roundDecimal((data.cashRevenue / cashRevenue) * 100)}%`
                                  : ""}
                              </TableCell>
                            )}
                            <TableCell>
                              {data.cashExpenditure < 0
                                ? Math.round(data.cashExpenditure)
                                : ""}
                            </TableCell>
                            {CARPTDISPLAY && (
                              <TableCell>
                                {data.cashExpenditure < 0
                                  ? `${roundDecimal((data.cashExpenditure / cashExpenditure) * 100)}%`
                                  : ""}
                              </TableCell>
                            )}
                            <TableCell>{handleCalculate(data)}</TableCell>
                          </TableRow>
                        )
                      )}
                      <TableRow>
                        <TableCell className={styles.subtotal}>小計</TableCell>
                        <TableCell>{Math.round(cashRevenue)}</TableCell>
                        {CARPTDISPLAY && <TableCell>100%</TableCell>}
                        <TableCell>{Math.round(cashRevenue + cashExpenditure) - Math.round(cashRevenue)}</TableCell>
                        {CARPTDISPLAY && <TableCell>100%</TableCell>}
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={styles.subtotal}>損益</TableCell>
                        <TableCell>
                          {Math.round(cashRevenue + cashExpenditure)}
                        </TableCell>
                        {CARPTDISPLAY ? <>
                          <TableCell>
                            {cashRevenue > 0
                              ? roundDecimal(((cashRevenue + cashExpenditure) / cashRevenue) * 100)
                              : 0}
                            %
                          </TableCell>
                        </> : <>
                          <TableCell></TableCell>
                          <TableCell>
                            {cashRevenue > 0
                              ? roundDecimal(((cashRevenue + cashExpenditure) / cashRevenue) * 100)
                              : 0}
                            %
                          </TableCell>
                        </>}
                        {CARPTDISPLAY && <>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                          <TableCell></TableCell>
                        </>}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </PerfectScrollbar>
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
  );
}

Results.propTypes = {
  className: PropTypes.string,
  customers: PropTypes.array,
};

Results.defaultProps = {
  customers: [],
};

export default Results;
