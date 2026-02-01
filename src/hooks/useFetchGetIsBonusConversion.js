import { gql, useQuery } from '@apollo/client'

const GET_IS_BONUS_CONVERSION = gql`
  query GET_IS_BONUS_CONVERSION {
    getParameterAboutSettingFunction {
      isBonusConversion
      bonusConversionRate
    }
  }
`

export default function useFetchGetIsBonusConversion() {
  return useQuery(GET_IS_BONUS_CONVERSION, {
    fetchPolicy: 'cache-and-network',
  })
}
