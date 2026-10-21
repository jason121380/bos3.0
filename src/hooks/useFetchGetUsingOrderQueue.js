import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { settingsQuery, SETTINGS_FETCH_POLICY } from 'lib/settings-cache'

const GET_USING_ORDER_QUEUE = settingsQuery(gql`
  query GET_USING_ORDER_QUEUE {
    getUsingOrderQueue {
      id
      orderInput
      orderNo
      orderDate
      status
      createTime
      message
    }
  }
`)

// skip：版面以 useAfterFirstLoad 延後到首屏完成後再查（lib/after-first-load）
const useFetchGetUsingOrderQueue = ({ skip = false } = {}) => {
  return useQuery(GET_USING_ORDER_QUEUE, {
    fetchPolicy: SETTINGS_FETCH_POLICY,
    skip,
  })
}

export default useFetchGetUsingOrderQueue
