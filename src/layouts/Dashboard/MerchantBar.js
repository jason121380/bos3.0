/** @jsxImportSource @emotion/react */
import { Dialog, DialogTitle, List, CircularProgress, DialogContent, TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PropTypes from 'prop-types'
import React, { useState, useMemo } from 'react'
import MerchantList from './MerchantList'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  dialog: css({
    '& .MuiPaper-root': {
      borderRadius: 16,
      width: '400px',
      maxWidth: '90vw',
      padding: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    }
  }),
  root: css({
    padding: '0 !important',
  }),
  list: css({
    padding: 0,
  }),
  Circular: css({
    width: '100%',
    padding: '40px 0',
    textAlign: 'center'
  }),
  title: css({
    fontWeight: 700,
    fontSize: '20px',
    textAlign: 'center',
    padding: '16px 24px 8px 24px',
  }),
  searchContainer: css({
    padding: '0 24px 16px 24px',
  }),
  searchField: css({
    '& .MuiOutlinedInput-root': {
      borderRadius: '24px',
      backgroundColor: '#f5f5f5',
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: 'none',
      },
      '&.Mui-focused fieldset': {
        border: '1px solid #007AFF',
      },
    },
    '& .MuiInputBase-input': {
      padding: '8px 12px',
      fontSize: '14px',
    }
  })
}

function MerchantBar({ open, onClose, userMerchants }) {
  const [searchQuery, setSearchQuery] = useState('')

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
    <Dialog
      open={open}
      onClose={onClose}
      css={styles.dialog}
      scroll="paper"
    >
      <DialogTitle css={styles.title}>切換店家</DialogTitle>
      <div css={styles.searchContainer}>
        <TextField
          fullWidth
          placeholder="搜尋店家或私有雲..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          css={styles.searchField}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8E8E93', fontSize: '20px' }} />
              </InputAdornment>
            ),
          }}
        />
      </div>
      <DialogContent css={styles.root}>
        <List css={styles.list}>
          {!userMerchants.loading && filteredMerchants ? (
            <MerchantList
              merchants={filteredMerchants}
              searchQuery={searchQuery}
            />
          ) : (
            <div css={styles.Circular}>
              <CircularProgress />
            </div>
          )}
        </List>
      </DialogContent>
    </Dialog>
  )
}

MerchantBar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
}

export default MerchantBar
