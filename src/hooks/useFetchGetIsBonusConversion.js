import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_IS_BONUS_CONVERSION = settingsQuery(gql`
  query GET_IS_BONUS_CONVERSION {
    getParameterAboutSettingFunction {
      isBonusConversion
      bonusConversionRate
    }
  }
`)

export default function useFetchGetIsBonusConversion() {
  return useQuery(GET_IS_BONUS_CONVERSION, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
