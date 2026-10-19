/** @jsxImportSource @emotion/react */
import CustomerInfo from './CustomerInfo'

export default function General({ customer, className = {}, isLoading, bookingCusCheck, ...rest }) {
  if (!customer) {
    return null
  }
  return (
    <div {...rest} css={className} className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-6 xl:col-span-4">
        <CustomerInfo bookingCusCheck={bookingCusCheck} customer={customer} isLoading={isLoading}/>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-3">
      </div>
    </div>
  )
}
