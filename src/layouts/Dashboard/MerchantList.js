/** @jsxImportSource @emotion/react */
import { TreeView, TreeItem } from '@mui/x-tree-view';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useHistory } from 'react-router';
import { css } from '@emotion/react'

import React, { useState, useEffect } from 'react'

const styles = {
  root: css({
    display: 'flex',
    gap: 0,
    flexDirection: 'column',
    '& .Mui-expanded, .Mui-selected': {
      backgroundColor: 'unset !important'
    },
    '& .MuiTreeItem-content': {
      transition: '.2s',
      padding: '12px 24px',
      '&:hover': {
        background: 'rgba(0, 122, 255, 0.05) !important'
      }
    },
  }),
  title: css({
    padding: '8px 8px 8px 24px !important',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  ulGroup: css({
    '& .MuiTreeItem-content': {
      paddingLeft: '24px !important',
    },
    '& ul': {
      marginLeft: '12px !important',
      borderLeft: '1px solid rgba(0, 0, 0, 0.1)'
    }
  }),
  ulGroupAll: css({
    '& .MuiTreeItem-content': {
      paddingLeft: '24px !important',
    },
    '& ul': {
      marginLeft: '12px !important',
      borderLeft: '1px solid rgba(0, 0, 0, 0.1)'
    }
  }),
  item: css({
    '& .MuiTreeItem-label': {
      paddingLeft: '0px !important'
    },
    '& .MuiTreeItem-iconContainer': {
      display: 'none !important'
    }
  }),
  span: css({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    wordBreak: 'keep-all',
    whiteSpace: 'nowrap',
    fontSize: '15px',
    fontWeight: 500,
    color: '#000000'
  }),
  icon: css({
    color: '#007AFF',
    fontSize: '20px'
  })
}

const MerchantList = ({ merchants, searchQuery }) => {
  const history = useHistory()
  const [expanded, setExpanded] = useState([])

  useEffect(() => {
    if (searchQuery) {
      const allIds = []
      const collectIds = (groups) => {
        groups.forEach((g, i) => {
          allIds.push(`group-${g.name}-${i}`)
          if (g.groups) collectIds(g.groups)
        })
      }
      collectIds(merchants.groups)
      allIds.push('全部')
      setExpanded(allIds)
    } else {
      setExpanded([])
    }
  }, [searchQuery, merchants.groups])

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }

  const handleItemClick = merchant => {
    localStorage.setItem('userMerchant', JSON.stringify({ id: merchant.id, name: merchant.name }))
    history.push('/order/create')
    window.location.reload()
  }

  const renderGroup = group => {
    return group.map((data, index) => (
      <TreeItem
        css={!(data.groups && data.groups.length) ? styles.ulGroup : styles.ulGroupAll}
        key={`group-${data.name}-${index}`}
        nodeId={`group-${data.name}-${index}`}
        label={<RenderLabel isGroup={true} data={data} />}
      >
        {data.merchants.length ? renderItem(data.merchants) : ''}
        {data.groups.length ? renderGroup(data.groups) : ''}
      </TreeItem>
    ))
  }

  const renderItem = merchant => {
    return merchant.map((data, index) => (
      <TreeItem
        onClick={() => handleItemClick(data)}
        css={styles.item}
        key={data.id}
        nodeId={data.id}
        label={<RenderLabel isGroup={false} data={data} />}
      />
    ))
  }

  const RenderLabel = ({ isGroup, data }) => {
    return (
      <span css={styles.span}>
        {isGroup ? <GroupsRoundedIcon css={styles.icon} /> : <StorefrontIcon css={styles.icon} />}
        {isGroup ?
          `${data.no ? data.no : ''} - ${data.name}(${data.groups.length ? data.groups.length : data.merchants.length})` : data.name
        }
      </span>
    )
  }
  return (
    <TreeView
      css={styles.root}
      defaultCollapseIcon={<ExpandMoreIcon sx={{ color: '#8E8E93' }} />}
      defaultExpandIcon={<ChevronRightIcon sx={{ color: '#8E8E93' }} />}
      expanded={expanded}
      onNodeToggle={handleToggle}
    >
      <TreeItem
        css={styles.ulGroupAll}
        nodeId='全部'
        label={
          <span css={styles.span}>
            <GroupsRoundedIcon css={styles.icon} />{`全部(${merchants.allMerchants.length})`}
          </span>
        }
      >
        {merchants.allMerchants.length ? renderItem(merchants.allMerchants) : ''}
      </TreeItem>
      {merchants.groups.length ? renderGroup(merchants.groups) : ''}
      {merchants.merchants.length ? renderItem(merchants.merchants) : ''}
    </TreeView>
  )
}

export default MerchantList