import { LoaderCircle, Search } from 'lucide-react'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useRef } from 'react'
import MerchantList from './MerchantList'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from 'ui/dialog'
import { Input } from 'ui/input'

function MerchantBar({ open, onClose, userMerchants }) {
  const [searchQuery, setSearchQuery] = useState('')
  const contentRef = useRef(null)

  const merchantsData = useMemo(() => {
    if (!userMerchants.data || !userMerchants.data.getUserMerchant) return null
    try {
      return JSON.parse(userMerchants.data.getUserMerchant)
    } catch (e) {
      return null
    }
  }, [userMerchants.data])

  const filteredMerchants = useMemo(() => {
    if (!merchantsData || !searchQuery) return merchantsData

    const query = searchQuery.toLowerCase()

    const filterMerchantItem = (merchant) => merchant.name.toLowerCase().includes(query)

    const filterGroups = (groups) => {
      return groups.map(group => {
        const filteredSubGroups = filterGroups(group.groups || [])
        const filteredSubMerchants = (group.merchants || []).filter(filterMerchantItem)

        if (group.name.toLowerCase().includes(query) || filteredSubGroups.length > 0 || filteredSubMerchants.length > 0) {
          return {
            ...group,
            groups: filteredSubGroups,
            merchants: filteredSubMerchants
          }
        }
        return null
      }).filter(Boolean)
    }

    const filteredAllMerchants = (merchantsData.allMerchants || []).filter(filterMerchantItem)
    const filteredMainGroups = filterGroups(merchantsData.groups || [])
    const filteredMainMerchants = (merchantsData.merchants || []).filter(filterMerchantItem)

    return {
      ...merchantsData,
      allMerchants: filteredAllMerchants,
      groups: filteredMainGroups,
      merchants: filteredMainMerchants
    }
  }, [merchantsData, searchQuery])

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      {/* 開啟時不自動聚焦搜尋框（Jason 2026/10/21：手機一開就彈出鍵盤、擋住店家清單）；焦點改放在彈窗本身，鍵盤使用者按 Tab 即進入搜尋框 */}
      <DialogContent
        size="sm"
        ref={contentRef}
        onOpenAutoFocus={event => {
          event.preventDefault()
          if (contentRef.current) contentRef.current.focus()
        }}
      >
        <DialogHeader>
          <DialogTitle>切換店家</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.75} />
            <Input aria-label="搜尋店家" placeholder="搜尋店家" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <DialogBody className="px-2 pb-4 pt-0">
          {!userMerchants.loading && filteredMerchants ? (
            <MerchantList merchants={filteredMerchants} searchQuery={searchQuery} />
          ) : (
            <div className="flex justify-center py-10">
              <LoaderCircle className="h-6 w-6 animate-spin text-text-tertiary" strokeWidth={1.75} />
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}

MerchantBar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

export default MerchantBar
