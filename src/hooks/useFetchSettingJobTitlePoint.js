import { gql, useMutation } from '@apollo/client'

const SET_JOBTITLES_POINTS = gql`
  mutation setting_JobTitle_Point($input: [SettingJobTitlePointInput!]) {
    settingJobTitlePoint(input: $input)
  }
`

export default function useFetchSettingJobTitlePoint() {
  const [setJobTitlePoint] = useMutation(SET_JOBTITLES_POINTS)
  return {
    setJobTitlePoint: ({ input }) =>
      setJobTitlePoint({
        variables: {
          input,
        },
      }),
  }
}
