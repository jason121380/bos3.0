import PropTypes from 'prop-types'
import { Card, CardHeader, CardTitle } from 'ui/card'
import { formatNumber } from 'ui/format'
import { Table, TableBody, TableCell, TableRow } from 'ui/table'

function Results({ results }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>其他支付方式明細</CardTitle>
          </CardHeader>
          <div className="px-5 pb-5">
            <Table aria-label="a dense table">
              <TableBody>
                {results.otherPayway.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.paywayName}</TableCell>
                    <TableCell numeric>{formatNumber(data.usedPrice)}</TableCell>
                    <TableCell numeric className="text-text-secondary">
                      ({formatNumber(data.usedPriceWithNoCash)})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>第三方卡券明細</CardTitle>
          </CardHeader>
          <div className="px-5 pb-5">
            <Table aria-label="a dense table">
              <TableBody>
                {results.thirdPartTicket.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.ticketName}</TableCell>
                    <TableCell numeric>{formatNumber(data.usedPrice)}</TableCell>
                    <TableCell numeric className="text-text-secondary">
                      ({formatNumber(data.usedPriceWithNoCash)})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>入金儲值明細</CardTitle>
          </CardHeader>
          <div className="px-5 pb-5">
            <Table aria-label="a dense table">
              <TableBody>
                {results.walletDeposit.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.paywayName}</TableCell>
                    <TableCell numeric>{formatNumber(data.usedPrice)}</TableCell>
                    <TableCell numeric className="text-text-secondary">
                      ({formatNumber(data.usedPriceWithNoCash)})
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}

Results.propTypes = {
  customers: PropTypes.array,
}

Results.defaultProps = {
  customers: [],
}

export default Results
