import { gql, useMutation } from '@apollo/client'

const CREATE_DEDUCTION_SETTING = gql`
  mutation CREATE_DEDUCTION_SETTING($input: CreateDeductionSettingInput!) {
    createDeductionSetting(input: $input)
  }
`

export function useFetchCreateDeductionSetting() {
  const [createDeductionSetting] = useMutation(CREATE_DEDUCTION_SETTING)
  return {
    createDeductionSetting: input =>
      createDeductionSetting({
        variables: {
          input,
        },
      }),
  }
}

const UPDATE_DEDUCTION_SETTING = gql`
  mutation UPDATE_DEDUCTION_SETTING($input: UpdateDeductionSettingInput!) {
    updateDeductionSetting(input: $input) 
  }
`

export function useFetchUpdateDeductionSetting() {
  const [updateDeductionSetting] = useMutation(UPDATE_DEDUCTION_SETTING)
  return {
    updateDeductionSetting: input =>
      updateDeductionSetting({
        variables: {
          input,
        },
      }),
  }
}
const DELETE_DEDUCTION_SETTING = gql`
  mutation DELETE_DEDUCTION_SETTING($DeductionId: [ID]!) {
    deleteDeductionSetting(DeductionId: $DeductionId) 
  }
`

export function useFetchDeleteDeductionSetting() {
  const [deleteDeductionSetting] = useMutation(DELETE_DEDUCTION_SETTING)
  return {
    deleteDeductionSetting: DeductionId =>
      deleteDeductionSetting({
        variables: {
          DeductionId,
        },
      }),
  }
}
