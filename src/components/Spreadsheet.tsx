import { useState, useRef } from 'react'
import {
  MagnifyingGlassIcon,
  BellIcon,
  EyeSlashIcon,
  ArrowsUpDownIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PlusIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  UserIcon,
  LinkIcon,
  UserGroupIcon,
  FlagIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'

interface JobRequest {
  id: number
  jobRequest: string
  submitted: string
  status: 'Need to start' | 'In-process' | 'Complete' | 'Blocked'
  submitter: string
  url: string
  assigned: string
  priority: 'High' | 'Medium' | 'Low'
  dueDate: string
  estValue: string
}

interface CustomColumnData {
  [key: string]: { [rowId: number]: string }
}

const statusOptions = ['Need to start', 'In-process', 'Complete', 'Blocked'] as const
const priorityOptions = ['High', 'Medium', 'Low'] as const

const statusColors = {
  'In-process': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Need to start': 'bg-blue-100 text-blue-700 border-blue-200',
  'Complete': 'bg-green-100 text-green-700 border-green-200',
  'Blocked': 'bg-red-100 text-red-700 border-red-200'
}

const priorityColors = {
  'High': 'text-red-600',
  'Medium': 'text-yellow-600', 
  'Low': 'text-green-600'
}

export default function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number, columnKey?: string} | null>(null)
  const [hiddenFields] = useState<string[]>([])
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null)
  const [customColumnData, setCustomColumnData] = useState<CustomColumnData>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState<{row: number, col: string} | null>(null)
  const [visibleRows, setVisibleRows] = useState(40)
  const [maxRows] = useState(20000)
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  // Tab management with separate data for each tab
  const [tabs, setTabs] = useState([
    { id: 'all-orders', name: 'All Orders', color: 'green', data: [] as JobRequest[] },
    { id: 'pending', name: 'Pending', color: 'yellow', data: [] as JobRequest[] },
    { id: 'reviewed', name: 'Reviewed', color: 'green', data: [] as JobRequest[] },
    { id: 'arrived', name: 'Arrived', color: 'purple', data: [] as JobRequest[] }
  ])
  const [activeTabId, setActiveTabId] = useState('all-orders')
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [newTabName, setNewTabName] = useState('')

  // Get current tab data
  const currentTab = tabs.find(tab => tab.id === activeTabId)
  const data = currentTab?.data || []

  // Column management - use percentages for responsive design
  const [columns, setColumns] = useState([
    { key: 'jobRequest', label: 'Job Request', section: 'Financial Overview', widthPercent: 15 },
    { key: 'submitted', label: 'Submitted', section: 'Financial Overview', widthPercent: 10 },
    { key: 'status', label: 'Status', section: 'Financial Overview', widthPercent: 10 },
    { key: 'submitter', label: 'Submitter', section: 'Financial Overview', widthPercent: 10 },
    { key: 'url', label: 'URL', section: '', widthPercent: 12 },
    { key: 'assigned', label: 'Assigned', section: 'ABC', widthPercent: 10 },
    { key: 'priority', label: 'Priority', section: 'Answer a question', widthPercent: 8 },
    { key: 'dueDate', label: 'Due Date', section: 'Answer a question', widthPercent: 10 },
    { key: 'estValue', label: 'Est. Value', section: 'Extract', widthPercent: 10 }
  ])

  // Column header editing
  const [editingColumnKey, setEditingColumnKey] = useState<string | null>(null)
  const [editingColumnLabel, setEditingColumnLabel] = useState('')

  // Filter data based on search term
  const filteredData = data.filter(item => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.jobRequest.toLowerCase().includes(searchLower) ||
      item.submitter.toLowerCase().includes(searchLower) ||
      item.assigned.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower) ||
      item.priority.toLowerCase().includes(searchLower)
    )
  })

  // Get visible columns and calculate section widths
  const visibleColumns = columns.filter(col => !hiddenFields.includes(col.key))
  const rowNumberWidth = 40

  // Calculate total width and ensure add column is always visible
  const totalWidthPercent = visibleColumns.reduce((sum, col) => sum + col.widthPercent, 0)
  const addColumnWidth = 8 // 8% for add column button to ensure it's fully visible
  const availableWidth = 100 - addColumnWidth // Reserve space for add column
  
  // Always scale columns to fit available width (leaving space for add column)
  const adjustedColumns = visibleColumns.map(col => ({
    ...col,
    widthPercent: (col.widthPercent / totalWidthPercent) * availableWidth
  }))

  // Group columns by section and calculate widths dynamically
  const sectionGroups = [
    {
      name: 'Financial Overview',
      columns: adjustedColumns.filter(col => col.section === 'Financial Overview'),
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-500'
    },
    {
      name: '',
      columns: adjustedColumns.filter(col => col.section === ''),
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600'
    },
    {
      name: 'ABC',
      columns: adjustedColumns.filter(col => col.section === 'ABC'),
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600'
    },
    {
      name: 'Answer a question',
      columns: adjustedColumns.filter(col => col.section === 'Answer a question'),
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      name: 'Extract',
      columns: adjustedColumns.filter(col => col.section === 'Extract'),
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      name: 'New Section',
      columns: adjustedColumns.filter(col => col.section === 'New Section'),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600'
    }
  ].filter(group => group.columns.length > 0)

  // Tab functions
  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId)
    setSelectedCell(null)
    setEditingCell(null)
    setShowDropdown(null)
  }

  const handleAddTab = () => {
    const newTab = {
      id: `tab-${Date.now()}`,
      name: `Sheet ${tabs.length + 1}`,
      color: 'gray',
      data: [] as JobRequest[]
    }
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
  }

  const handleTabRename = (tabId: string, newName: string) => {
    setTabs(tabs.map(tab => 
      tab.id === tabId ? { ...tab, name: newName } : tab
    ))
    setEditingTabId(null)
    setNewTabName('')
  }

  const handleCellClick = (rowIndex: number, colIndex: number, columnKey?: string) => {
    if (columnKey === 'status' || columnKey === 'priority') {
      setSelectedCell({ row: rowIndex, col: colIndex, columnKey })
      setShowDropdown({ row: rowIndex, col: columnKey })
      setEditingCell(null)
      setSelectedColumn(null)
      return;
    }
    setSelectedCell({ row: rowIndex, col: colIndex, columnKey })
    setSelectedColumn(null)
    setEditingCell(null)
    setShowDropdown(null)
  }

  const handleCellDoubleClick = (rowIndex: number, columnKey: string) => {
    // For status and priority, show dropdown instead of text input
    if (columnKey === 'status' || columnKey === 'priority') {
      setShowDropdown({ row: rowIndex, col: columnKey })
    } else {
      // For regular cells, start editing on double-click
      setEditingCell({ row: rowIndex, col: columnKey })
      setShowDropdown(null)
    }
  }

  const setData = (newData: JobRequest[]) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTabId ? { ...tab, data: newData } : tab
    ))
  }

  const handleCellChange = (rowIndex: number, columnKey: string, value: string) => {
    if (columnKey.startsWith('custom_')) {
      // Handle custom column data
      setCustomColumnData(prev => ({
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          [rowIndex]: value
        }
      }))
    } else {
      // Handle regular column data
      const newData = [...data]
      // Ensure we have enough rows
      while (newData.length <= rowIndex) {
        newData.push({
          id: Date.now() + newData.length,
          jobRequest: '',
          submitted: '',
          status: 'Need to start',
          submitter: '',
          url: '',
          assigned: '',
          priority: 'Medium',
          dueDate: '',
          estValue: ''
        })
      }
      if (newData[rowIndex]) {
        (newData[rowIndex] as JobRequest & Record<string, string>)[columnKey] = value
        setData(newData)
      }
    }
  }

  const handleDropdownSelect = (rowIndex: number, columnKey: string, value: string) => {
    handleCellChange(rowIndex, columnKey, value)
    setShowDropdown(null)
  }

  const getCellValue = (rowIndex: number, columnKey: string) => {
    if (columnKey.startsWith('custom_')) {
      return customColumnData[columnKey]?.[rowIndex] || ''
    }
    return data[rowIndex] ? (data[rowIndex] as JobRequest & Record<string, string>)[columnKey] : ''
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingCell(null)
    }
  }

  const handleHideFields = () => {
    console.log('Hide fields clicked')
  }

  const handleSort = () => {
    console.log('Sort clicked')
  }

  const handleFilter = () => {
    console.log('Filter clicked')
  }

  const handleImport = () => {
    console.log('Import clicked')
  }

  const handleExport = () => {
    console.log('Export clicked')
  }

  const handleShare = () => {
    console.log('Share clicked')
  }

  const handleNewAction = () => {
    console.log('New Action clicked')
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      if (visibleRows < maxRows) {
        setVisibleRows(prev => Math.min(prev + 20, maxRows))
      }
    }
  }

  const handleAddColumn = (section: string) => {
    const newColumn = {
      key: `custom_${Date.now()}`,
      label: '',
      section: section || 'New Section',
      widthPercent: 10 // Default 10% width for new columns
    }
    // Insert new column before the last position (so add button stays rightmost)
    setColumns([...columns, newColumn])
  }

  const handleSectionMenu = (section: string) => {
    console.log(`Section menu clicked for: ${section}`)
  }

  const handleColumnHeaderClick = (colIndex: number) => {
    setSelectedColumn(colIndex)
    setSelectedCell(null)
    setShowDropdown(null)
    setEditingCell(null)
  }

  const handleColumnHeaderEdit = (columnKey: string, newLabel: string) => {
    setColumns(columns.map(col => 
      col.key === columnKey ? { ...col, label: newLabel } : col
    ))
    setEditingColumnKey(null)
    setEditingColumnLabel('')
  }

  const handleColumnHeaderDoubleClick = (columnKey: string, currentLabel: string) => {
    setEditingColumnKey(columnKey)
    setEditingColumnLabel(currentLabel)
  }

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case 'Financial Overview':
        return <DocumentTextIcon className="w-3 h-3" />
      case 'ABC':
        return <UserGroupIcon className="w-3 h-3" />
      case 'Answer a question':
        return <ExclamationCircleIcon className="w-3 h-3" />
      case 'Extract':
        return <ArrowDownTrayIcon className="w-3 h-3" />
      case 'New Section':
        return <PlusIcon className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col text-xs">
      {/* Fixed Top Navigation */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1">
              <Squares2X2Icon className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">Workspace</span>
          </div>
          <span className="text-gray-400">›</span>
            <span className="text-xs text-gray-600">Folder 2</span>
          <span className="text-gray-400">›</span>
            <span className="text-xs font-medium text-gray-900">Spreadsheet 3</span>
          <button className="text-gray-400 hover:text-gray-600">
              <EllipsisHorizontalIcon className="w-3 h-3" />
          </button>
        </div>
          <div className="flex items-center space-x-2">
          <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search within sheet"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 pr-3 py-1 w-48 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
              <BellIcon className="w-4 h-4 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">1</span>
            </span>
          </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">JD</span>
            </div>
              <div className="text-xs">
              <div className="font-medium text-gray-900">John Doe</div>
              <div className="text-gray-500 text-xs">john.doe@...</div>
            </div>
          </div>
        </div>
      </div>

        {/* Fixed Toolbar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100">
        <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-700 font-medium mr-3">Tool bar</span>
          <button
              onClick={handleHideFields}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <EyeSlashIcon className="w-3 h-3" />
            <span>Hide fields</span>
          </button>
          <button
              onClick={handleSort}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <ArrowsUpDownIcon className="w-3 h-3" />
            <span>Sort</span>
          </button>
          <button
              onClick={handleFilter}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <FunnelIcon className="w-3 h-3" />
            <span>Filter</span>
          </button>
          <button
              onClick={() => console.log('Cell view')}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <ViewColumnsIcon className="w-3 h-3" />
            <span>Cell view</span>
          </button>
          </div>
          <div className="flex items-center space-x-1">
          <button
              onClick={handleImport}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <ArrowUpTrayIcon className="w-3 h-3" />
            <span>Import</span>
          </button>
          <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <ArrowDownTrayIcon className="w-3 h-3" />
            <span>Export</span>
          </button>
          <button
              onClick={handleShare}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
          >
              <ShareIcon className="w-3 h-3" />
            <span>Share</span>
          </button>
          <button
              onClick={handleNewAction}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded"
          >
              <PlusIcon className="w-3 h-3" />
            <span>New Action</span>
          </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <div ref={tableRef} className="h-full overflow-auto" onScroll={handleScroll}>
          {/* Fixed Header Structure */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            {/* Section Headers */}
            <div className="flex border-b border-gray-200">
              {/* Row number header */}
              <div className="bg-gray-50 border-r border-gray-200 flex-shrink-0" style={{ width: `${rowNumberWidth}px` }}>
                <div className="px-2 py-1.5 h-8"></div>
              </div>
              
              {/* Dynamic Section Headers */}
              {sectionGroups.map((group, index) => {
                const sectionWidth = group.columns.reduce((sum, col) => sum + col.widthPercent, 0);
                return (
                  <div 
                    key={`${group.name}-${index}`} 
                    className={`${group.bgColor} border-r ${group.borderColor} flex-shrink-0`} 
                    style={{ width: `${sectionWidth}%` }}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 h-8">
                      <div className="flex items-center space-x-1">
                        {getSectionIcon(group.name) && (
                          <span className={group.iconColor}>
                            {getSectionIcon(group.name)}
                          </span>
                        )}
                        <span className={`text-xs font-medium ${group.textColor}`}>
                          {group.name}
                        </span>
                      </div>
                      {group.name && (
                        <button
                          onClick={() => handleSectionMenu(group.name)}
                          className="w-4 h-4 text-gray-400 hover:text-gray-600 flex items-center justify-center"
                        >
                          <EllipsisHorizontalIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Column - Always at rightmost */}
              <div className="bg-gray-50 border-l border-r border-dashed border-gray-300 flex-shrink-0" style={{ width: `${addColumnWidth}%` }}>
                <div className="flex items-center justify-center py-1.5 h-8">
                  <button
                    onClick={() => handleAddColumn('New Section')}
                    className="flex items-center justify-center w-6 h-6 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-full border border-dashed border-gray-300"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Column Headers */}
            <div className="flex">
              {/* Row number header */}
              <div 
                className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 bg-gray-50 flex-shrink-0"
                style={{ width: `${rowNumberWidth}px` }}
              >
                #
              </div>
              
              {adjustedColumns.map((column, colIndex) => {
                const sectionGroup = sectionGroups.find(group => group.name === column.section)
                const bgColor = sectionGroup ? sectionGroup.bgColor : 'bg-gray-50'
                
                return (
                  <div 
                    key={column.key} 
                    className={`px-2 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 cursor-pointer hover:bg-gray-100 flex-shrink-0 ${bgColor} ${
                      selectedColumn === colIndex + 1 ? 'bg-blue-100' : ''
                    }`}
                    style={{ width: `${column.widthPercent}%` }}
                    onClick={() => handleColumnHeaderClick(colIndex + 1)}
                    onDoubleClick={() => handleColumnHeaderDoubleClick(column.key, column.label)}
                  >
                    <div className="flex items-center space-x-1">
                      {column.key === 'jobRequest' && <DocumentTextIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'submitted' && <CalendarDaysIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'status' && <ExclamationCircleIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'submitter' && <UserIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'url' && <LinkIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'assigned' && <UserGroupIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'priority' && <FlagIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'dueDate' && <CalendarDaysIcon className="w-3 h-3 text-gray-600" />}
                      {column.key === 'estValue' && <CurrencyDollarIcon className="w-3 h-3 text-gray-600" />}
                      {editingColumnKey === column.key ? (
                        <input
                          type="text"
                          value={editingColumnLabel}
                          onChange={(e) => setEditingColumnLabel(e.target.value)}
                          onBlur={() => handleColumnHeaderEdit(column.key, editingColumnLabel || column.label)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleColumnHeaderEdit(column.key, editingColumnLabel || column.label)
                            }
                          }}
                          className="bg-transparent border-none text-xs font-medium text-gray-500 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                          autoFocus
                        />
                      ) : (
                        <span>{column.label || 'New Column'}</span>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {/* Add Column Header - Always at rightmost */}
              <div className="px-2 py-1.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-l border-r border-dashed border-gray-300 flex-shrink-0" style={{ width: `${addColumnWidth}%` }}>
                <span className="text-gray-400">+</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {/* Data rows */}
            {filteredData.slice(0, Math.min(visibleRows, maxRows)).map((item: JobRequest, rowIndex: number) => (
              <div 
                key={item.id} 
                className="flex hover:bg-gray-50 border-b border-gray-200"
              >
                {/* Row number */}
                <div
                  className={`px-2 py-1.5 text-xs font-medium text-gray-900 cursor-pointer border-r border-gray-300 flex items-center flex-shrink-0 ${
                    selectedCell?.row === rowIndex && selectedCell?.col === 0
                      ? 'ring-2 ring-green-600 bg-green-50'
                      : selectedCell?.row === rowIndex 
                      ? 'bg-green-50'
                      : ''
                  }`}
                  style={{ width: `${rowNumberWidth}px` }}
                  onClick={() => handleCellClick(rowIndex, 0)}
                >
                  {rowIndex + 1}
                </div>
                
                {/* Data cells */}
                {adjustedColumns.map((column, colIndex) => {
                  return (
                    <div
                      key={column.key}
                      className={`px-2 py-1.5 text-xs cursor-pointer border-r border-gray-300 flex items-center relative flex-shrink-0 ${
                        selectedCell?.row === rowIndex && selectedCell?.col === colIndex + 1 ? 'ring-2 ring-green-600 bg-green-50' : ''
                      }`}
                      style={{ width: `${column.widthPercent}%` }}
                      onClick={() => handleCellClick(rowIndex, colIndex + 1, column.key)}
                      onDoubleClick={() => handleCellDoubleClick(rowIndex, column.key)}
                    >
                      {column.key === 'status' ? (
                        showDropdown?.row === rowIndex && showDropdown?.col === column.key ? (
                          <select
                            value={item.status}
                            onChange={(e) => handleDropdownSelect(rowIndex, column.key, e.target.value)}
                            onBlur={() => setShowDropdown(null)}
                            className={`w-full text-xs font-medium rounded-full border px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusColors[item.status as keyof typeof statusColors]}`}
                            autoFocus
                          >
                            {statusOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full border ${statusColors[item.status as keyof typeof statusColors]}`}>
                            {item.status}
                          </span>
                        )
                      ) : column.key === 'priority' ? (
                        showDropdown?.row === rowIndex && showDropdown?.col === column.key ? (
                          <select
                            value={item.priority}
                            onChange={(e) => handleDropdownSelect(rowIndex, column.key, e.target.value)}
                            onBlur={() => setShowDropdown(null)}
                            className={`w-full text-xs font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${priorityColors[item.priority as keyof typeof priorityColors]}`}
                            autoFocus
                          >
                            {priorityOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-xs font-medium ${priorityColors[item.priority as keyof typeof priorityColors]}`}>
                            {item.priority}
                          </span>
                        )
                      ) : column.key === 'url' ? (
                        editingCell?.row === rowIndex && editingCell?.col === column.key ? (
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none text-xs focus:outline-none text-gray-900"
                            value={item.url}
                            onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyPress={handleKeyPress}
                            autoFocus
                          />
                        ) : (
                          <span className="text-xs text-gray-900 truncate">
                            {item.url}
                          </span>
                        )
                      ) : column.key.startsWith('custom_') ? (
                        editingCell?.row === rowIndex && editingCell?.col === column.key ? (
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none text-xs focus:outline-none"
                            value={getCellValue(rowIndex, column.key)}
                            onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyPress={handleKeyPress}
                            autoFocus
                          />
                        ) : (
                          <span className="text-xs truncate">
                            {getCellValue(rowIndex, column.key)}
                          </span>
                        )
                      ) : (
                        editingCell?.row === rowIndex && editingCell?.col === column.key ? (
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none text-xs focus:outline-none"
                            value={getCellValue(rowIndex, column.key)}
                            onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyPress={handleKeyPress}
                            autoFocus
                          />
                        ) : (
                          <span className="text-xs truncate">
                            {getCellValue(rowIndex, column.key)}
                          </span>
                        )
                      )}
                    </div>
                  )
                })}
                
                {/* Add column cell - Always at rightmost */}
                <div className="px-2 py-1.5 text-xs cursor-pointer border-l border-r border-dashed border-gray-300 bg-gray-50 flex-shrink-0" style={{ width: `${addColumnWidth}%` }}></div>
              </div>
            ))}
            
            {/* Empty rows for spreadsheet experience */}
            {Array.from({ length: Math.max(0, Math.min(visibleRows, maxRows) - filteredData.length) }).map((_, index: number) => {
              const actualRowIndex = filteredData.length + index
              return (
                <div 
                  key={`empty-${index}`} 
                  className="flex hover:bg-gray-50 border-b border-gray-200"
                >
                  {/* Row number */}
                  <div
                    className={`px-2 py-1.5 text-xs text-gray-500 cursor-pointer border-r border-gray-300 flex items-center flex-shrink-0 ${
                      selectedCell?.row === actualRowIndex && selectedCell?.col === 0
                        ? 'ring-2 ring-green-600 bg-green-50'
                        : selectedCell?.row === actualRowIndex 
                        ? 'bg-green-50'
                        : ''
                    }`}
                    style={{ width: `${rowNumberWidth}px` }}
                    onClick={() => handleCellClick(actualRowIndex, 0)}
                  >
                    {actualRowIndex + 1}
                  </div>
                  
                  {/* Empty cells */}
                  {adjustedColumns.map((column, colIndex) => {
                    return (
                      <div
                        key={colIndex}
                        className={`px-2 py-1.5 text-xs cursor-pointer border-r border-gray-300 flex items-center flex-shrink-0 ${
                          selectedCell?.row === actualRowIndex && selectedCell?.col === colIndex + 1
                            ? 'ring-2 ring-green-600 bg-green-50'
                            : ''
                        }`}
                        style={{ width: `${column.widthPercent}%` }}
                        onClick={() => handleCellClick(actualRowIndex, colIndex + 1, column.key)}
                        onDoubleClick={() => handleCellDoubleClick(actualRowIndex, column.key)}
                      >
                        {column.key === 'status' ? (
                          showDropdown?.row === actualRowIndex && showDropdown?.col === column.key ? (
                            <select
                              value={getCellValue(actualRowIndex, column.key) || 'Need to start'}
                              onChange={(e) => handleDropdownSelect(actualRowIndex, column.key, e.target.value)}
                              onBlur={() => setShowDropdown(null)}
                              className={`w-full text-xs font-medium rounded-full border px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 ${statusColors[(getCellValue(actualRowIndex, column.key) || 'Need to start') as keyof typeof statusColors]}`}
                              autoFocus
                            >
                              {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full border ${getCellValue(actualRowIndex, column.key) ? statusColors[getCellValue(actualRowIndex, column.key) as keyof typeof statusColors] : ''}`}>
                              {getCellValue(actualRowIndex, column.key)}
                            </span>
                          )
                        ) : column.key === 'priority' ? (
                          showDropdown?.row === actualRowIndex && showDropdown?.col === column.key ? (
                            <select
                              value={getCellValue(actualRowIndex, column.key) || 'Medium'}
                              onChange={(e) => handleDropdownSelect(actualRowIndex, column.key, e.target.value)}
                              onBlur={() => setShowDropdown(null)}
                              className={`w-full text-xs font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${priorityColors[(getCellValue(actualRowIndex, column.key) || 'Medium') as keyof typeof priorityColors]}`}
                              autoFocus
                            >
                              {priorityOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`text-xs font-medium ${getCellValue(actualRowIndex, column.key) ? priorityColors[getCellValue(actualRowIndex, column.key) as keyof typeof priorityColors] : ''}`}>
                              {getCellValue(actualRowIndex, column.key)}
                            </span>
                          )
                        ) : column.key.startsWith('custom_') ? (
                          editingCell?.row === actualRowIndex && editingCell?.col === column.key ? (
                            <input 
                              type="text" 
                              className="w-full bg-transparent border-none text-xs focus:outline-none"
                              value={getCellValue(actualRowIndex, column.key)}
                              onChange={(e) => handleCellChange(actualRowIndex, column.key, e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyPress={handleKeyPress}
                              autoFocus
                            />
                          ) : (
                            <span className="text-xs truncate">
                              {getCellValue(actualRowIndex, column.key)}
                            </span>
                          )
                        ) : (
                          editingCell?.row === actualRowIndex && editingCell?.col === column.key ? (
                            <input 
                              type="text" 
                              className="w-full bg-transparent border-none text-xs focus:outline-none"
                              value={getCellValue(actualRowIndex, column.key)}
                              onChange={(e) => handleCellChange(actualRowIndex, column.key, e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyPress={handleKeyPress}
                              autoFocus
                            />
                          ) : (
                            <span className="text-xs truncate">
                              {getCellValue(actualRowIndex, column.key)}
                            </span>
                          )
                        )}
                      </div>
                    )
                  })}
                  
                  {/* Add column cell - Always at rightmost */}
                  <div className="px-2 py-1.5 text-xs cursor-pointer border-l border-r border-dashed border-gray-300 bg-gray-50 flex-shrink-0" style={{ width: `${addColumnWidth}%` }}></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Tabs */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white z-10">
        <div className="flex items-center px-3 py-2 space-x-1">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative">
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onBlur={() => handleTabRename(tab.id, newTabName || tab.name)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTabRename(tab.id, newTabName || tab.name)
                    }
                  }}
                  className="px-3 py-1.5 text-sm border border-green-500 rounded focus:outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => handleTabChange(tab.id)}
                  onDoubleClick={() => {
                    setEditingTabId(tab.id)
                    setNewTabName(tab.name)
                  }}
                  className={`relative px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                    activeTabId === tab.id 
                      ? 'text-green-800 bg-green-50 font-semibold' 
                      : 'text-gray-400 hover:text-green-800 hover:bg-gray-100'
                  }`}
                >
                  {/* Green line above active tab */}
                  {activeTabId === tab.id && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-600" />
                  )}
                  {tab.name}
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddTab}
            className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 