import { gql, useQuery } from '@apollo/client'

const FETCH_USER_SERVICE_DEDUCTION_DETAIL = gql`
  query FETCH_USER_SERVICE_DEDUCTION_DETAIL($input: ServiceDeductionDetialInput) {
    getUserServiceDeductionDetial(input: $input) {
      date
      orderNo
      type
      item
      designerName
      cash
      handlingFeeOnSales
      deductionOnSales
      helperPriceOnSales
      truthPerformance
      specialRake_truthPerformance
      specialRake_specialRake
      category_categoryName
      category_normalTruthPerformance
      category_normalRake
      category_designateTruthPerformance
      category_designateRake
      category_nonDesignateTruthPerformance
      category_nonDesignateRake
      percentage
      serviceRake
      handlingFeeOnSalary
      deductionOnSalary
      helperPriceOnSalary
      summary
    }
  }
`
export default function useFetchServiceDedcutionDetail({ input }) {
  return useQuery(FETCH_USER_SERVICE_DEDUCTION_DETAIL, {
    variables: {
      input,
    },
    fetchPolicy: 'cache-and-network',
  })
}
