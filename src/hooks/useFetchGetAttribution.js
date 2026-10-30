import { gql, useQuery, useLazyQuery } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const USE_FETCH_GET_ATTRIBUTIONS = settingsQuery(gql`
  query USE_FETCH_GET_ATTRIBUTIONS {
    getAttribution {
      name
      value
    }
  }
`)

export default function useFetchGetAttribution() {
  return useQuery(USE_FETCH_GET_ATTRIBUTIONS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}

export function useFetchGetAttributionLazy() {
  const [getAttributionLazy, attributionLazyData] = useLazyQuery(USE_FETCH_GET_ATTRIBUTIONS, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
  return [getAttributionLazy, attributionLazyData]
}

const USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE = settingsQuery(gql`
  query USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE {
    getAttributionForRake {
      label
      value
    }
  }
`)

export function useFetchGetAttributionForRake() {
  return useQuery(USE_FETCH_GET_ATTRIBUTIONS_FOR_RAKE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
  })
}
