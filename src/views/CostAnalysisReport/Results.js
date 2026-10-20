/** @jsxImportSource @emotion/react */
// 卡片保留相容層：列印樣式以 .CostAnalysisReportTableContainer .MuiCard-root／.MuiCardContent-root 排版表格（initialize.scss）
import { Card, CardContent, CardHeader } from 'ui/card-compat'
import { Download } from 'lucide-react'
import { Button } from 'ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui/table'
import { HeaderActionsPortal } from 'ui/page-header'
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import roundDecimal from './../../helper/roundDecimal.js'
import { css } from '@emotion/react'
import { theme } from '../../theme/index.js'

const styles = {
  root: css({
    display: "flex",
    justifyContent: "space-between",
  }),
  content: css({
    padding: 0,
  }),
  nameCell: css({
    display: "flex",
    alignItems: "center",
  }),
  avatar: css({
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  }),
  actions: css({
    padding: theme.spacing(1),
    justifyContent: "flex-end",
  }),
  leftCard: css({
    width: "55%",
  }),
  rightCard: css({
    width: "40%",
  }),
  subtotal: css({
    color: "red",
    fontWeight: "bold",
  }),
  cardBottom: css({
    marginBottom: "15px",
  }),
  width: css({
    minWidth: '250px',
  })
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
    } else if (cashExpenditure === 0) {
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
      className="CostAnalysisReportTableContainer flex w-full flex-wrap"
      css={css([styles.root, className])}
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
          <Card>
            <CardHeader
              className="CostAnalysisReportCardHeader noprint"
              title="費用分析表"
            />
            {/* 原生 hr：列印規則以 hr 選擇器隱藏分隔線 */}
            <hr className="m-0 shrink-0 border-0 border-b border-solid border-border" />
            <CardContent css={styles.content}>
              <PerfectScrollbar>
                <div css={styles.inner}>
                  <Table dense>
                    <TableHeader>
                      <TableRow>
                        <TableHead css={styles.width}></TableHead>
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
                        <TableCell css={styles.subtotal}>小計</TableCell>
                        <TableCell>{Math.round(cashRevenue)}</TableCell>
                        {CARPTDISPLAY && <TableCell>100%</TableCell>}
                        <TableCell>{Math.round(cashRevenue + cashExpenditure) - Math.round(cashRevenue)}</TableCell>
                        {CARPTDISPLAY && <TableCell>100%</TableCell>}
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell css={styles.subtotal}>損益</TableCell>
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
  className: PropTypes.object,
  customers: PropTypes.array,
};

Results.defaultProps = {
  customers: [],
};

export default Results;
