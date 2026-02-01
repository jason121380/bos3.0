import produce from 'immer'
import { useCallback, useEffect } from 'react'

export default function useInitGroupData({
  group,
  profile,
  fetchHQDepartment,
  fetchMerchantDepartment,
  setGroupData,
  fetchMerchantJobTitle,
  fetchHQJobTitle,
}) {
  // 帶入使用者的 群組 ID
  const initGroupId = useCallback(() => {
    if (!profile.loading && profile.data.me.groupCategory) {
      const groupId = group.find(d => d.name === profile.data.me.groupCategory).value
      setGroupData(
        produce(produceData => {
          produceData.groupId = groupId
        })
      )
    }
  }, [profile.loading, group, profile.data, setGroupData])
  useEffect(() => {
    initGroupId()
  }, [initGroupId])

  // 帶入使用者的 事業部/部門 資料 ID
  useEffect(() => {
    if (
      !fetchHQDepartment.loading &&
      !fetchMerchantDepartment.loading &&
      !profile.loading &&
      fetchHQDepartment.data.userGroup &&
      fetchMerchantDepartment.data.userGroup &&
      profile.data.me.groupCategory &&
      setGroupData
    ) {
      setGroupData(
        produce(prouceData => {
          prouceData.userGroupId =
            profile.data.me.groupCategory === '地方'
              ? fetchMerchantDepartment.data.userGroup.find(
                  data => data.name === profile.data.me.userGroup
                ).id
              : fetchHQDepartment.data.userGroup.find(
                  data => data.name === profile.data.me.userGroup
                ).id
        })
      )
    }
  }, [
    fetchHQDepartment.loading,
    fetchMerchantDepartment.loading,
    profile.loading,
    fetchHQDepartment.data,
    fetchMerchantDepartment.data,
    profile.data,
    setGroupData,
  ])
  // 帶入使用者的職稱
  useEffect(() => {
    if (
      !fetchMerchantJobTitle.loading &&
      !fetchHQJobTitle.loading &&
      !profile.loading &&
      fetchHQJobTitle.data.jobTitle &&
      fetchMerchantJobTitle.data.jobTitle &&
      profile.data.me.groupCategory
    ) {
      setGroupData(
        produce(produceData => {
          produceData.jobTitleId =
            profile.data.me.groupCategory === '地方'
              ? fetchMerchantJobTitle.data.jobTitle.find(
                  data => data.name === profile.data.me.jobTitle
                ).id
              : fetchHQJobTitle.data.jobTitle.find(data => data.name === profile.data.me.jobTitle)
                  .id
        })
      )
    }
  }, [
    fetchMerchantJobTitle.loading,
    fetchHQJobTitle.loading,
    profile.loading,
    fetchHQJobTitle.data,
    fetchMerchantJobTitle.data,
    profile.data,
    setGroupData,
  ])
  // 帶入使用者的店家
  useEffect(() => {
    if (
      !fetchMerchantDepartment.loading &&
      !profile.loading &&
      fetchMerchantDepartment.data &&
      profile.data.me.merchants &&
      profile.data.me.merchants.length >= 0
    ) {
      let merchant = []
      fetchMerchantDepartment.data.userGroup.map(department => {
        merchant = merchant.concat(department.merchants)
        department.groups.map(area => (merchant = merchant.concat(area.merchants)))
        return department
      })
      let active = []
      profile.data.me.merchants.map(
        activeMerhchant =>
          (active = active.concat(
            merchant.filter(merchantData => merchantData.name === activeMerhchant)
          ))
      )
      setGroupData(
        produce(produceData => {
          produceData.merchantIds = active.map(d => d.id)
        })
      )
    }
  }, [
    profile.loading,
    fetchMerchantDepartment.loading,
    fetchMerchantDepartment.data,
    setGroupData,
    profile.data,
  ])
}
