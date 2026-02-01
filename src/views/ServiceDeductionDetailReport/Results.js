/** @jsxImportSource @emotion/react */
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
} from '@mui/material'
import PropTypes from 'prop-types'
import { Fragment, useEffect } from 'react'
import { format } from 'date-fns'
import { css } from '@emotion/react'

const styles = {
  table: css({
    minWidth: 650,
  }),
  designerName: css({
    fontWeight: 'bold',
  }),
  sepreateDiv: css({
    display: 'flex',
    justifyContent: 'space-around',
  }),
  sepreateDiv2: css({
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    '& td': {
      width: '100%'
    }
  }),
}

function Results({ userServiceDeductionDetial, setExcelData }) {
  const countTotal = key => {
    const total = userServiceDeductionDetial.reduce((accu, curVal) => accu + curVal[key] , 0)
    return floatDisplay(total)
  }

  const floatDisplay = num => {
    if (String(num).length > 7) {
      num = Math.round(num)
      let display = Number(num).toFixed(2)
      if (display == 0.0) {
        display = 0
      }
      return display
    } else {
      return num
    }
  }

  useEffect(() => {
    if (userServiceDeductionDetial !== null) {
      const excelData = []
      userServiceDeductionDetial.forEach(data => {
        excelData.push({
          日期: format(new Date(data.date), 'yyyy/MM/dd'),
          帳單編號: `#${data.orderNo}`,
          類別: data.type,
          項目: data.item,
          設計師: data.designerName,
          金額: data.cash,
          '手續費(扣業績)': floatDisplay(data.handlingFeeOnSales),
          '扣項(扣業績)': floatDisplay(data.deductionOnSales),
          '互助(扣業績)': floatDisplay(data.helperPriceOnSales),
          實業績: floatDisplay(data.truthPerformance),
          '實業績(依特殊抽成)': floatDisplay(data.specialRake_truthPerformance),
          '特殊抽成(依特殊抽成)': floatDisplay(data.specialRake_specialRake),
          服務歸屬: data.category_categoryName,
          '不分實業績(依服務歸屬)': floatDisplay(data.category_normalTruthPerformance),
          '不分實業績 抽成(依服務歸屬)': floatDisplay(data.category_normalRake),
          '指定實業績(依服務歸屬)': floatDisplay(data.category_designateTruthPerformance),
          '指定實業績 抽成(依服務歸屬)': floatDisplay(data.category_designateRake),
          '不指定實業績(依服務歸屬)': floatDisplay(data.category_nonDesignateTruthPerformance),
          '不指定實業績 抽成(依服務歸屬)': floatDisplay(data.category_nonDesignateRake),
          '%': data.percentage,
          服務抽成: floatDisplay(data.serviceRake),
          '手續費(扣薪水)': floatDisplay(data.handlingFeeOnSalary),
          '扣項(扣薪水)': floatDisplay(data.deductionOnSalary),
          '互助(扣薪水)': floatDisplay(data.helperPriceOnSalary),
          小計: floatDisplay(data.summary),
        })
      })

      excelData.push({
        日期: '合計',
        帳單編號: '',
        類別: '',
        項目: '',
        設計師: '',
        金額: countTotal('cash'),
        '手續費(扣業績)': countTotal('handlingFeeOnSales'),
        '扣項(扣業績)': countTotal('deductionOnSales'),
        '互助(扣業績)': countTotal('helperPriceOnSales'),
        實業績: countTotal('truthPerformance'),
        '實業績(依特殊抽成)': countTotal('specialRake_truthPerformance'),
        '特殊抽成(依特殊抽成)': countTotal('specialRake_specialRake'),
        服務歸屬: '',
        '不分實業績(依服務歸屬)': countTotal('category_normalTruthPerformance'),
        '不分實業績 抽成(依服務歸屬)': countTotal('category_normalRake'),
        '指定實業績(依服務歸屬)': countTotal('category_designateTruthPerformance'),
        '指定實業績 抽成(依服務歸屬)': countTotal('category_designateRake'),
        '不指定實業績(依服務歸屬)': countTotal('category_nonDesignateTruthPerformance'),
        '不指定實業績 抽成(依服務歸屬)': countTotal('category_nonDesignateRake'),
        '%': '',
        服務抽成: countTotal('serviceRake'),
        '手續費(扣薪水)': countTotal('handlingFeeOnSalary'),
        '扣項(扣薪水)': countTotal('deductionOnSalary'),
        '互助(扣薪水)': countTotal('helperPriceOnSalary'),
        小計: countTotal('summary'),
      })
      setExcelData(excelData)
    }
  }, [userServiceDeductionDetial])

  return (
    <Fragment>
      <TableContainer component={Paper} style={{ marginTop: '12px' }}>
        <Table css={styles.table} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>日期</TableCell>
              <TableCell>帳單編號</TableCell>
              <TableCell>類別</TableCell>
              <TableCell>項目</TableCell>
              <TableCell>設計師</TableCell>
              <TableCell>金額</TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                扣業績
                <div css={styles.sepreateDiv}>
                  <TableCell>手續費</TableCell>
                  <TableCell>扣項</TableCell>
                  <TableCell>互助</TableCell>
                </div>
              </TableCell>
              <TableCell>實業績</TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                依特殊抽成
                <div css={styles.sepreateDiv}>
                  <TableCell>實業績</TableCell>
                  <TableCell>特殊抽成</TableCell>
                </div>
              </TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                依服務歸屬
                <div css={styles.sepreateDiv}>
                  <TableCell>服務歸屬</TableCell>
                  <TableCell>不分實業績</TableCell>
                  <TableCell>不分實業績 抽成</TableCell>
                  <TableCell>指定實業績</TableCell>
                  <TableCell>指定實業績 抽成</TableCell>
                  <TableCell>不指定實業績</TableCell>
                  <TableCell>不指定實業績 抽成</TableCell>
                </div>
              </TableCell>
              <TableCell>%</TableCell>
              <TableCell>服務抽成</TableCell>
              <TableCell style={{ textAlign: 'center' }}>
                扣薪水
                <div css={styles.sepreateDiv}>
                  <TableCell>手續費</TableCell>
                  <TableCell>扣項</TableCell>
                  <TableCell>互助</TableCell>
                </div>
              </TableCell>
              <TableCell>小計</TableCell>
            </TableRow>
          </TableHead>
          <TableBody id="whiteSpace">
            {userServiceDeductionDetial.map((data, index) => (
              <TableRow key={index}>
                <TableCell> {format(new Date(data.date), 'yyyy/MM/dd')}</TableCell>
                <TableCell>#{data.orderNo}</TableCell>
                <TableCell>{data.type}</TableCell>
                <TableCell>{data.item}</TableCell>
                <TableCell>{data.designerName}</TableCell>
                <TableCell>{floatDisplay(data.cash)}</TableCell>
                <TableCell css={styles.sepreateDiv}>
                  <TableCell>{floatDisplay(data.handlingFeeOnSales)}</TableCell>
                  <TableCell>{floatDisplay(data.deductionOnSales)}</TableCell>
                  <TableCell>{floatDisplay(data.helperPriceOnSales)}</TableCell>
                </TableCell>
                <TableCell>{floatDisplay(data.truthPerformance)}</TableCell>
                <TableCell css={styles.sepreateDiv}>
                  <TableCell>{floatDisplay(data.specialRake_truthPerformance)}</TableCell>
                  <TableCell>{floatDisplay(data.specialRake_specialRake)}</TableCell>
                </TableCell>
                <TableCell>
                  <div css={styles.sepreateDiv2}>
                    <TableCell>
                      {data.category_categoryName !== '' ? data.category_categoryName : '預設'}
                    </TableCell>
                    <TableCell>
                      {floatDisplay(data.category_normalTruthPerformance)}
                    </TableCell>
                    <TableCell>
                      {floatDisplay(data.category_normalRake)}
                    </TableCell>
                    <TableCell>
                      {floatDisplay(data.category_designateTruthPerformance)}
                    </TableCell>
                    <TableCell>
                      {floatDisplay(data.category_designateRake)}
                    </TableCell>
                    <TableCell>
                      {floatDisplay(data.category_nonDesignateTruthPerformance)}
                    </TableCell>
                    <TableCell>
                      {floatDisplay(data.category_nonDesignateRake)}
                    </TableCell>
                  </div>
                </TableCell>
                <TableCell>{data.percentage}</TableCell>
                <TableCell>{floatDisplay(data.serviceRake)}</TableCell>
                <TableCell css={styles.sepreateDiv}>
                  <TableCell>{floatDisplay(data.handlingFeeOnSalary)}</TableCell>
                  <TableCell>{floatDisplay(data.deductionOnSalary)}</TableCell>
                  <TableCell>{floatDisplay(data.helperPriceOnSalary)}</TableCell>
                </TableCell>
                <TableCell>{floatDisplay(data.summary)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>合計</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>{countTotal('cash')}</TableCell>
              <div css={styles.sepreateDiv}>
                <TableCell>{countTotal('handlingFeeOnSales')}</TableCell>
                <TableCell>{countTotal('deductionOnSales')}</TableCell>
                <TableCell>{countTotal('helperPriceOnSales')}</TableCell>
              </div>
              <TableCell>{countTotal('truthPerformance')}</TableCell>
              <div css={styles.sepreateDiv}>
                <TableCell>{countTotal('specialRake_truthPerformance')}</TableCell>
                <TableCell>{countTotal('specialRake_specialRake')}</TableCell>
              </div>
              <TableCell>
                <div css={styles.sepreateDiv2}>
                  <TableCell></TableCell>
                  <TableCell>
                    {countTotal('category_normalTruthPerformance')}
                  </TableCell>
                  <TableCell>
                    {countTotal('category_normalRake')}
                  </TableCell>
                  <TableCell>
                    {countTotal('category_designateTruthPerformance')}
                  </TableCell>
                  <TableCell>
                    {countTotal('category_designateRake')}
                  </TableCell>
                  <TableCell>
                    {countTotal('category_nonDesignateTruthPerformance')}
                  </TableCell>
                  <TableCell>
                    {countTotal('category_nonDesignateRake')}
                  </TableCell>
                </div>
              </TableCell>
              <TableCell></TableCell>
              <TableCell>{countTotal('serviceRake')}</TableCell>
              <TableCell css={styles.sepreateDiv}>
                <TableCell>{countTotal('handlingFeeOnSalary')}</TableCell>
                <TableCell>{countTotal('deductionOnSalary')}</TableCell>
                <TableCell>{countTotal('helperPriceOnSalary')}</TableCell>
              </TableCell>
              <TableCell>{countTotal('summary')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  )
}

Results.propTypes = {
  report: PropTypes.object,
}

Results.defaultProps = {
  report: {},
}

export default Results
