import { gql, useQuery } from '@apollo/client'

const GET_MERCHANT_EVENT = gql`
  query GET_MERCHANT_EVENT($eventId: ID!) {
    mainEvent(eventId: $eventId) {
      nameDefault
      startDateDefault
      endDateDefault
      isSMSNotifyDefault
      maxCountDefault
      isUsingDefault
      isPublic
      endDateActual
      merchantIds
    }
  }
`

export default function useFetchGetMainEvent({ eventId }) {
  return useQuery(GET_MERCHANT_EVENT, {
    variables: {
      eventId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MAIN_EVENTS = gql`
  query GET_MAIN_EVENTS {
    mainEvents {
      id
      nameDefault
      createTime
      startDateDefault
      endDateDefault
      endDateActual
      isEarlyEnd
      isLineNotifyDefault
      isSMSNotifyDefault
      maxCountDefault
      releasedCount
      thresholdReferenceDefault
      isUsingDefault
      isPublic
      isJoined
      ruleGroups {
        id
        nameForGroup
        startDateForGroup
        endDateForGroup
        endDateActual
        isEarlyEnd
        isLineNotifyForGroup
        isSMSNotifyForGroup
        maxCountForGroup
        releasedCount
        maxCountPerOrder
        thresholdReferenceForGroup
        isUsingForGroup
        thresholdPrice
        consumptionTypeUsing
        consumptionTypeRules {
          consumptionType
          attributionRange
          attributions
        }
        payTypeUsing
        merchants {
          id
          name
        }
        isRuleApply
      }
    }
  }
`

export function useFetchGetMainEvents() {
  return useQuery(GET_MAIN_EVENTS, {
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MERCHANT_EVENT_FOR_RULES = gql`
  query GET_MERCHANT_EVENT_FOR_RULES($eventId: ID!) {
    mainEvent(eventId: $eventId) {
      nameDefault
      startDateDefault
      endDateDefault
      isSMSNotifyDefault
      maxCountDefault
    }
  }
`

export function useFetchGetMainEventForRule({ eventId }) {
  return useQuery(GET_MERCHANT_EVENT_FOR_RULES, {
    variables: {
      eventId,
    },
    fetchPolicy: 'cache-and-network',
  })
}

const GET_MAIN_EVENTS_FOR_AUTOCOMPLETE = gql`
  query GET_MAIN_EVENTS_FOR_AUTOCOMPLETE {
    mainEvents {
      id
      nameDefault
    }
  }
`

export function useFetchGetMainEventsForAutocomplete() {
  return useQuery(GET_MAIN_EVENTS_FOR_AUTOCOMPLETE, {
    fetchPolicy: 'cache-and-network',
  })
}
