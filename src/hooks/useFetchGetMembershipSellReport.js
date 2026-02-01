import { gql, useQuery } from '@apollo/client'

const GET_MEMBERSHIP_SELL_REPORT = gql`
  query GET_MEMBERSHIP_SELL_REPORT($input: MembershipSellReportInput!) {
    membershipSellReport(input: $input) {
      orderId
      orderNo
      orderDate
      designerName
      designerNo
      customerName
      customerNo
      membershipName
      membershipNo
      sellPrice
      count
      summary
      handlingFee
      truth
      rake
      remark
      expiryDate
    }
  }
`

export default function useFetchGetMembershipSellReport({ input }) {
  return useQuery(GET_MEMBERSHIP_SELL_REPORT, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
