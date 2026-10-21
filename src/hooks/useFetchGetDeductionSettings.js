import { gql, useQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_MULTIPLE_DEDUCTION_SETTINGS = settingsQuery(gql`
  query GET_MULTIPLE_DEDUCTION_SETTINGS {
    getDeductionSettings {
      id
      no
      name
      nonSegmented{
        attribute
        rakeData{
          designate{
            rake
            threshold
          }
          nonDesignate{
            rake
            threshold
          }
          nonDistinguish{
            rake
            threshold
          }
        }
      }
      segmented{
        designate{
          rake
          thresholdLowerLimit
          thresholdUpperLimit
        }
        nonDesignate{
          rake
          thresholdLowerLimit
          thresholdUpperLimit
        }
        nonDistinguish{
          rake
          thresholdLowerLimit
          thresholdUpperLimit
        }
      }
      isSegmented
    }
  }
`)
const GET_DEDUCTION_SETTING = gql`
  query GET_DEDUCTION_SETTING($DeductionSettingId: ID!){
    getDeductionSetting(DeductionSettingId:$DeductionSettingId){
      id
      no
      name
      nonSegmented {
        attribute
        rakeData {
          designate{
            rake
            threshold
          }
          nonDesignate{
            rake
            threshold
          }
          nonDistinguish{
            rake
            threshold
          }
        }
      }
      segmented {
        designate {
          rake
          thresholdLowerLimit
          thresholdUpperLimit
        }
        nonDesignate {
          rake
          thresholdLowerLimit
          thresholdUpperLimit
        }
        nonDistinguish {
          rake
          thresholdLowerLimit
          thresholdUpperLimit
        }
      }
      isSegmented
    }
  }
`

export function useFetchDeductionSettings() {
  return useQuery(GET_MULTIPLE_DEDUCTION_SETTINGS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchDeductionSetting(DeductionSettingId) {
  return useQuery(GET_DEDUCTION_SETTING, {
    variables: {
      DeductionSettingId,
    },
    fetchPolicy: 'cache-and-network',
  })
}
