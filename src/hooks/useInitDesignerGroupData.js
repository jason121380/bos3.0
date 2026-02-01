import produce from 'immer'
import { useCallback, useEffect } from 'react'

export default function useInitGroupData({
  group,
  designer,
  fetchHQDepartment,
  fetchMerchantDepartment,
  setGroupData,
  fetchMerchantJobTitle,
  fetchHQJobTitle,
}) {
  // 帶入使用者的 群組 ID
  const initGroupId = useCallback(() => {
    if (!designer.loading && designer.data.merchantDesigner.groupCategory) {
      const groupId = group.find(d => d.name === designer.data.merchantDesigner.groupCategory).value
      setGroupData(
        produce(produceData => {
          produceData.groupId = groupId
        })
      )
    }
  }, [designer.loading, group, designer.data, setGroupData])
  useEffect(() => {
    initGroupId()
  }, [initGroupId])

  // 帶入使用者的 事業部/部門 資料 ID
  useEffect(() => {
    if (
      !fetchHQDepartment.loading &&
      !fetchMerchantDepartment.loading &&
      !designer.loading &&
      fetchHQDepartment.data.userGroup &&
      fetchMerchantDepartment.data.userGroup &&
      designer.data.merchantDesigner.groupCategory &&
      setGroupData
    ) {
      setGroupData(
        produce(prouceData => {
          prouceData.userGroupId =
            designer.data.merchantDesigner.groupCategory === '地方'
              ? fetchMerchantDepartment.data.userGroup.find(
                  data => data.name === designer.data.merchantDesigner.userGroup
                ).id
              : fetchHQDepartment.data.userGroup.find(
                  data => data.name === designer.data.merchantDesigner.userGroup
                ).id
        })
      )
    }
  }, [
    fetchHQDepartment.loading,
    fetchMerchantDepartment.loading,
    designer.loading,
    fetchHQDepartment.data,
    fetchMerchantDepartment.data,
    designer.data,
    setGroupData,
  ])
  // 帶入使用者的職稱
  useEffect(() => {
    if (
      !fetchMerchantJobTitle.loading &&
      !fetchHQJobTitle.loading &&
      !designer.loading &&
      fetchHQJobTitle.data.jobTitle &&
      fetchMerchantJobTitle.data.jobTitle &&
      designer.data.merchantDesigner.groupCategory
    ) {
      setGroupData(
        produce(produceData => {
          produceData.jobTitleId =
            designer.data.merchantDesigner.groupCategory === '地方'
              ? fetchMerchantJobTitle.data.jobTitle.find(
                  data => data.name === designer.data.merchantDesigner.jobTitle
                ).id
              : fetchHQJobTitle.data.jobTitle.find(
                  data => data.name === designer.data.merchantDesigner.jobTitle
                ).id
        })
      )
    }
  }, [
    fetchMerchantJobTitle.loading,
    fetchHQJobTitle.loading,
    designer.loading,
    fetchHQJobTitle.data,
    fetchMerchantJobTitle.data,
    designer.data,
    setGroupData,
  ])
  // 帶入使用者的店家
  useEffect(() => {
    if (
      !fetchMerchantDepartment.loading &&
      !designer.loading &&
      fetchMerchantDepartment.data &&
      designer.data.merchantDesigner.merchants &&
      designer.data.merchantDesigner.merchants.length >= 0
    ) {
      let merchant = []
      fetchMerchantDepartment.data.userGroup.map(department => {
        merchant = merchant.concat(department.merchants)
        department.groups.map(area => (merchant = merchant.concat(area.merchants)))
        return department
      })
      let active = []
      designer.data.merchantDesigner.merchants.map(
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
    designer.loading,
    fetchMerchantDepartment.loading,
    fetchMerchantDepartment.data,
    setGroupData,
    designer.data,
  ])
}
