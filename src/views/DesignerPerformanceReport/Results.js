/** @jsxImportSource @emotion/react */
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
} from '@mui/material'
import { Fragment } from 'react'
import { css } from '@emotion/react'

const styles = {
  root: css({}),
  sepreateDiv: css({
    display: 'flex',
    justifyContent: 'space-around',
  }),
  centerTd: css({
    display: 'flex',
    justifyContent: 'center',
  }),
  sticky: css({
    width: '150px',
    position: 'sticky',
    left: 0,
    background: 'white',
    zIndex: '99',
  }),
  stickyRow: css({
    position: 'sticky',
    top: 0,
    background: 'white',
    zIndex: '100',
  }),
}

export default function Results({ designerPerformance, serviceCategory, membershipDisplay }) {
  return (
    designerPerformance.length === 0 ? 
    <Typography variant="h3" gutterBottom component="div">
      無資料
    </Typography> : (
      <TableContainer className='designerPerformanceReportTable' style={{ maxHeight: 'calc(100vh - 265px)', marginTop: 10 }} component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead css={styles.stickyRow}>
            <TableRow >
              <TableCell css={styles.sticky}>設計師</TableCell>
              {serviceCategory.map((data, index) => {
                return (
                  <Fragment key={index}>
                    <TableCell>{data}</TableCell>
                    <TableCell>人數</TableCell>
                  </Fragment>
                )
              })}
              <TableCell>業績</TableCell>
              <TableCell>業績客單價</TableCell>
              <TableCell>店販</TableCell>
              {membershipDisplay && <TableCell>會員卡</TableCell>}
              <TableCell>總業績</TableCell>
              <TableCell>天數</TableCell>
              <TableCell>總客數</TableCell>
              <TableCell>總客單價</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className='designerPerformance'>
            {designerPerformance[0].designerPerformanceData.map((data, index) => {
              return (
                <Fragment key={index} >
                  <TableRow >
                    <TableCell css={styles.sticky}>{data.designerName}</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.servicePerformance}</TableCell>
                          <TableCell>{service.servicePerformanceCount}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell>{data.performance}</TableCell>
                    <TableCell>
                      {isNaN(data.performance / data.totalCustomer) ? 0 : Math.round(data.performance / data.totalCustomer)}
                    </TableCell>
                    <TableCell>{data.productPerformance}</TableCell>
                    {membershipDisplay && <TableCell>{data.membershipPerformance}</TableCell>}
                    <TableCell>{data.totalPerformance}</TableCell>
                    <TableCell>{data.performanceDay}</TableCell>
                    <TableCell>{data.totalCustomer}</TableCell>
                    <TableCell>{data.totalPerformanceCustomerUnit}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell css={styles.sticky}>指定</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.designateServicePerformance}</TableCell>
                          <TableCell>{service.designateCount}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell>{data.designatePerformance}</TableCell>
                    <TableCell>
                      {isNaN(data.designatePerformance / data.totalDesignateCustomer) ? 0 : Math.round(data.designatePerformance / data.totalDesignateCustomer)}
                    </TableCell>
                    <TableCell>{data.designateProductPerformance}</TableCell>
                    {membershipDisplay && <TableCell>{data.designateMembershipPerformance}</TableCell>}
                    <TableCell>{data.designateTotalPerformance}</TableCell>
                    <TableCell>{data.designatePerformanceDay}</TableCell>
                    <TableCell>{data.totalDesignateCustomer}</TableCell>
                    <TableCell>{data.designateTotalPerformanceCustomerUnit}</TableCell>
                  </TableRow>
                </Fragment>
              )
            })}
          </TableBody>
          <TableBody className='sumPerformance'>
            {designerPerformance[0].designerPerformanceSum.map((data, index) => {
              return (
                <TableRow key={index}>
                    <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>{data.designerName}</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.servicePerformance}</TableCell>
                          <TableCell>{service.servicePerformanceCount}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell>{data.performance}</TableCell>
                    <TableCell>
                      {isNaN(data.performance / data.totalCustomer) ? 0 : Math.round(data.performance / data.totalCustomer)}
                    </TableCell>
                    <TableCell>{data.productPerformance}</TableCell>
                    {membershipDisplay && <TableCell>{data.membershipPerformance}</TableCell>}
                    <TableCell>{data.totalPerformance}</TableCell>
                    <TableCell>{data.performanceDay}</TableCell>
                    <TableCell>{data.totalCustomer}</TableCell>
                    <TableCell>{data.totalPerformanceCustomerUnit}</TableCell>
                  </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceSum.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>指定</TableCell>
                  {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.designateServicePerformance}</TableCell>
                          <TableCell>{service.designateCount}</TableCell>
                        </Fragment> 
                      )
                  })}
                  <TableCell>{data.designatePerformance}</TableCell>
                  <TableCell>{isNaN(data.designatePerformance / data.totalDesignateCustomer) ? 0 : Math.round(data.designatePerformance / data.totalDesignateCustomer)}</TableCell>
                  <TableCell>{data.designateProductPerformance}</TableCell>
                  {membershipDisplay && <TableCell>{data.designateMembershipPerformance}</TableCell>}
                  <TableCell>{data.designateTotalPerformance}</TableCell>
                  <TableCell>{data.designatePerformanceDay}</TableCell>
                  <TableCell>{data.totalDesignateCustomer}</TableCell>
                  <TableCell>{data.designateTotalPerformanceCustomerUnit}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceSum.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>不指定</TableCell>
                  {data.serviceCategory.map((service, index) => {
                    return (
                      <Fragment key={index}>
                        <TableCell>{service.nonDesignateServicePerformance}</TableCell>
                        <TableCell>{service.nonDesignateCount}</TableCell>
                      </Fragment> 
                    )
                  })}
                  <TableCell>{data.nonDesignatePerformance}</TableCell>
                  <TableCell>{isNaN(data.nonDesignatePerformance / data.totalNonDesignateCustomer) ? 0 : Math.round(data.nonDesignatePerformance / data.totalNonDesignateCustomer)}</TableCell>
                  <TableCell>{data.nonDesignateProductPerformance}</TableCell>
                  {membershipDisplay && <TableCell>{data.nonDesignateMembershipPerformance}</TableCell>}
                  <TableCell>{data.nonDesignateTotalPerformance}</TableCell>
                  <TableCell/>
                  <TableCell>{data.totalNonDesignateCustomer}</TableCell>
                  <TableCell>{data.nonDesignateTotalPerformanceCustomerUnit}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformancePercented.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>{data.designerName}</TableCell>
                  {data.serviceCategory.map((service, index) => {
                    return (
                      <Fragment key={index}>
                        <TableCell/>
                        <TableCell>{service.designateCount !== null && service.designateCount + '%'}</TableCell>
                      </Fragment> 
                    )
                  })}
                  <TableCell/>
                  <TableCell/>
                  <TableCell/>
                  {membershipDisplay && <TableCell/>}
                  <TableCell/>
                  <TableCell/>
                  <TableCell>{data.totalDesignateCustomer !== null && data.totalDesignateCustomer + '%'}</TableCell>
                  <TableCell/>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceMale.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>{data.designerName}</TableCell>
                    {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.servicePerformance}</TableCell>
                          <TableCell>{service.servicePerformanceCount}</TableCell>
                        </Fragment> 
                      )
                    })}
                    <TableCell>{data.performance}</TableCell>
                    <TableCell>
                      {isNaN(data.performance / data.totalCustomer) ? 0 : Math.round(data.performance / data.totalCustomer)}
                    </TableCell>
                    <TableCell>{data.productPerformance}</TableCell>
                    {membershipDisplay && <TableCell>{data.membershipPerformance}</TableCell>}
                    <TableCell>{data.totalPerformance}</TableCell>
                    <TableCell>{data.performanceDay}</TableCell>
                    <TableCell>{data.totalCustomer}</TableCell>
                    <TableCell>{data.totalPerformanceCustomerUnit}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceFemale.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>{data.designerName}</TableCell>
                  {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.servicePerformance}</TableCell>
                          <TableCell>{service.servicePerformanceCount}</TableCell>
                        </Fragment> 
                      )
                    })}
                  <TableCell>{data.performance}</TableCell>
                  <TableCell>
                    {isNaN(data.performance / data.totalCustomer) ? 0 : Math.round(data.performance / data.totalCustomer)}
                  </TableCell>
                  <TableCell>{data.productPerformance}</TableCell>
                  {membershipDisplay && <TableCell>{data.membershipPerformance}</TableCell>}
                  <TableCell>{data.totalPerformance}</TableCell>
                  <TableCell>{data.performanceDay}</TableCell>
                  <TableCell>{data.totalCustomer}</TableCell>
                  <TableCell>{data.totalPerformanceCustomerUnit}</TableCell>
                </TableRow>
              )
            })}
            {designerPerformance[0].designerPerformanceUnknown.map((data, index) => {
              return (
                <TableRow key={index} >
                  <TableCell style={{fontWeight: 'bold'}} css={styles.sticky}>{data.designerName}</TableCell>
                  {data.serviceCategory.map((service, index) => {
                      return (
                        <Fragment key={index}>
                          <TableCell>{service.servicePerformance}</TableCell>
                          <TableCell>{service.servicePerformanceCount}</TableCell>
                        </Fragment> 
                      )
                    })}
                  <TableCell>{data.performance}</TableCell>
                  <TableCell>
                    {isNaN(data.performance / data.totalCustomer) ? 0 : Math.round(data.performance / data.totalCustomer)}
                  </TableCell>
                  <TableCell>{data.productPerformance}</TableCell>
                  {membershipDisplay && <TableCell>{data.membershipPerformance}</TableCell>}
                  <TableCell>{data.totalPerformance}</TableCell>
                  <TableCell>{data.performanceDay}</TableCell>
                  <TableCell>{data.totalCustomer}</TableCell>
                  <TableCell>{data.totalPerformanceCustomerUnit}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  )
}

Results.defaultProps = {}
