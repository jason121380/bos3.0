import { gql, useQuery, useMutation } from '@apollo/client'

const GET_SYSTEM_UPDATE_RECORD = gql`
  query GET_SYSTEM_UPDATE_RECORD {
    systemUpdateRecord {
      systemUpdateId
      title
      content
      versionNo
      updateTime
    }
  }
`

export default function useFetchSystemUpdateRecord() {
  return useQuery(GET_SYSTEM_UPDATE_RECORD, {
    variables: {},
    fetchPolicy: 'cache-and-network',
  })
}

const SYSTEM_UPDATE_RECORD_CREATE = gql`
  mutation SYSTEM_UPDATE_RECORD_CREATE($input: SystemUpdateInput!) {
    createSystemUpdate(input: $input)
  }
`

export function useFetchCreateSystemUpdateCreate() {
  const [SystemUpdateCreate] = useMutation(SYSTEM_UPDATE_RECORD_CREATE)
  return {
    SystemUpdateCreate: input => SystemUpdateCreate({ variables: input }),
  }
}

const SYSTEM_UPDATE_RECORD_EDIT = gql`
  mutation SYSTEM_UPDATE_RECORD_EDIT($input: UpdateSystemUpdateInput!) {
    updateSystemUpdate(input: $input)
  }
`

export function useFetchCreateSystemUpdateEdit() {
  const [SystemUpdateEdit] = useMutation(SYSTEM_UPDATE_RECORD_EDIT)
  return {
    SystemUpdateEdit: input => SystemUpdateEdit({ variables: input }),
  }
}

const SYSTEM_UPDATE_RECORD_DELETE = gql`
  mutation SYSTEM_UPDATE_RECORD_DELETE($systemUpdateId: ID!) {
    deleteSystemUpdate(systemUpdateId: $systemUpdateId)
  }
`

export function useFetchCreateSystemUpdateDelete() {
  const [SystemUpdateDelete] = useMutation(SYSTEM_UPDATE_RECORD_DELETE)
  return {
    SystemUpdateDelete: ({ systemUpdateId }) => SystemUpdateDelete({ variables: { systemUpdateId } }),
  }
}
