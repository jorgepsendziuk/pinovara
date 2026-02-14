import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import './DataGrid.css';

export interface DataGridColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T | ((record: T) => any);
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  responsive?: {
    hideOn?: 'mobile' | 'tablet' | 'desktop';
    showOn?: 'mobile' | 'tablet' | 'desktop';
  };
}

export interface DataGridProps<T = any> {
  columns: DataGridColumn<T>[];
  dataSource: T[];
  rowKey?: string | ((record: T) => string);
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTop?: boolean;
    showAllLabel?: string;
    onShowAll?: () => void;
    onChange: (page: number, pageSize: number) => void;
  };
  filters?: {
    searchable?: boolean;
    searchPlaceholder?: string;
    customFilters?: React.ReactNode;
    onSearchChange?: (value: string) => void;
    onFiltersChange?: (filters: any) => void;
  };
  selection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
  actions?: {
    onCreate?: () => void;
    onBulkAction?: (action: string, selectedRows: T[]) => void;
    createLabel?: string;
    bulkActions?: Array<{
      key: string;
      label: string;
      icon?: string | React.ReactElement;
    }>;
  };
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string | React.ReactElement;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  responsive?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void;
  externalSort?: boolean; // Se true, não ordena internamente, apenas chama onSortChange
  externalSortConfig?: { key: string; direction: 'asc' | 'desc' } | null; // Estado de ordenação externa
  getRowStyle?: (record: T, index: number) => React.CSSProperties; // Função para obter estilo da linha
}

function DataGrid<T = any>({
  columns,
  dataSource,
  rowKey = 'id',
  loading = false,
  pagination,
  filters,
  selection,
  actions,
  emptyState,
  responsive = true,
  size = 'medium',
  className = '',
  style,
  onSortChange,
  externalSort = false,
  externalSortConfig = null,
  getRowStyle
}: DataGridProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [internalSortConfig, setInternalSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  // Usar sortConfig externo se fornecido, senão usar interno
  const sortConfig = externalSort ? externalSortConfig : internalSortConfig;
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    selection?.selectedRowKeys || []
  );
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  // Hook para detectar mudanças no tamanho da tela
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtrar colunas baseado na responsividade
  const visibleColumns = useMemo(() => {
    if (!responsive) return columns;

    return columns.filter(col => {
      if (!col.responsive) return true;
      
      if (col.responsive.hideOn === screenSize) return false;
      if (col.responsive.showOn && col.responsive.showOn !== screenSize) return false;
      
      return true;
    });
  }, [columns, screenSize, responsive]);

  // Função para obter o valor de uma célula
  const getCellValue = (record: T, column: DataGridColumn<T>) => {
    if (column.render) {
      const value = column.dataIndex 
        ? typeof column.dataIndex === 'function' 
          ? column.dataIndex(record)
          : record[column.dataIndex as keyof T]
        : null;
      return column.render(value, record, 0);
    }
    
    if (column.dataIndex) {
      return typeof column.dataIndex === 'function' 
        ? column.dataIndex(record)
        : record[column.dataIndex as keyof T];
    }
    
    return null;
  };

  // Função para obter a chave da linha
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey as keyof T]) || String(index);
  };

  // Ordenação
  const handleSort = (columnKey: string) => {
    if (externalSort && onSortChange) {
      // Se ordenação externa, determinar direção baseado no estado atual
      let direction: 'asc' | 'desc' = 'asc';
      if (externalSortConfig && externalSortConfig.key === columnKey && externalSortConfig.direction === 'asc') {
        direction = 'desc';
      }
      onSortChange(columnKey, direction);
    } else {
      // Ordenação interna (comportamento padrão)
      let direction: 'asc' | 'desc' = 'asc';
      if (internalSortConfig && internalSortConfig.key === columnKey && internalSortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setInternalSortConfig({ key: columnKey, direction });
    }
  };

  // Aplicar ordenação aos dados
  const sortedData = useMemo(() => {
    if (externalSort) return dataSource; // Se ordenação externa, não ordena internamente
    if (!sortConfig) return dataSource;

    const column = columns.find(col => col.key === sortConfig.key);
    if (!column) return dataSource;

    const sorted = [...dataSource].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (column.dataIndex) {
        if (typeof column.dataIndex === 'function') {
          aValue = column.dataIndex(a);
          bValue = column.dataIndex(b);
        } else {
          aValue = a[column.dataIndex as keyof T];
          bValue = b[column.dataIndex as keyof T];
        }
      } else {
        aValue = a;
        bValue = b;
      }

      // Tratamento de valores nulos/undefined
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Comparação numérica
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Comparação de strings (case insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return sorted;
  }, [dataSource, sortConfig, columns]);

  // Seleção
  const handleSelectRow = (rowKey: string, selected: boolean) => {
    let newSelectedRowKeys: string[];
    
    if (selection?.type === 'radio') {
      newSelectedRowKeys = selected ? [rowKey] : [];
    } else {
      if (selected) {
        newSelectedRowKeys = [...selectedRowKeys, rowKey];
      } else {
        newSelectedRowKeys = selectedRowKeys.filter(key => key !== rowKey);
      }
    }
    
    setSelectedRowKeys(newSelectedRowKeys);
    
    if (selection?.onChange) {
      const selectedRows = sortedData.filter(record => 
        newSelectedRowKeys.includes(getRowKey(record, 0))
      );
      selection.onChange(newSelectedRowKeys, selectedRows);
    }
  };

  // Selecionar todos
  const handleSelectAll = (selected: boolean) => {
    const allRowKeys = sortedData.map((record, index) => getRowKey(record, index));
    const newSelectedRowKeys = selected ? allRowKeys : [];
    
    setSelectedRowKeys(newSelectedRowKeys);
    
    if (selection?.onChange) {
      const selectedRows = selected ? sortedData : [];
      selection.onChange(newSelectedRowKeys, selectedRows);
    }
  };

  // Estados
  const isLoading = loading;
  const isEmpty = !isLoading && sortedData.length === 0;
  const hasSelection = Boolean(selection);
  const hasActions = Boolean(actions);
  const allSelected = selectedRowKeys.length === sortedData.length && sortedData.length > 0;
  const someSelected = selectedRowKeys.length > 0;

  return (
    <div 
      className={`data-grid ${size} ${responsive ? 'responsive' : ''} ${className}`}
      style={style}
    >
      {/* Header com filtros e ações */}
      {(filters || hasActions) && (
        <div className="data-grid-header">
          <div className="data-grid-filters">
            {filters?.searchable && (
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder={filters.searchPlaceholder || 'Buscar...'}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    filters.onSearchChange?.(e.target.value);
                  }}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            )}
            
            {filters?.customFilters && (
              <div className="custom-filters">
                {filters.customFilters}
              </div>
            )}
          </div>

          <div className="data-grid-actions">
            {someSelected && actions?.bulkActions && (
              <div className="bulk-actions">
                <span className="selected-count">
                  {selectedRowKeys.length} selecionados
                </span>
                {actions.bulkActions.map(action => (
                  <button
                    key={action.key}
                    onClick={() => {
                      const selectedRows = dataSource.filter(record => 
                        selectedRowKeys.includes(getRowKey(record, 0))
                      );
                      actions.onBulkAction?.(action.key, selectedRows);
                    }}
                    className="btn btn-secondary btn-small"
                  >
                    {action.icon && <span className="btn-icon">{typeof action.icon === 'string' ? action.icon : action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            
            {actions?.onCreate && (
              <button
                onClick={actions.onCreate}
                className="btn btn-primary"
              >
                <span className="btn-icon">➕</span>
                {actions.createLabel || 'Criar'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="data-grid-table-container">
        {isLoading ? (
          <div className="data-grid-loading">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        ) : isEmpty ? (
          <div className="data-grid-empty">
            <div className="empty-icon">{typeof emptyState?.icon === 'string' ? emptyState.icon : emptyState?.icon || '📋'}</div>
            <h3>{emptyState?.title || 'Nenhum registro encontrado'}</h3>
            <p>{emptyState?.description || 'Não há dados para exibir.'}</p>
            {emptyState?.action && (
              <button 
                onClick={emptyState.action.onClick}
                className="btn btn-primary"
              >
                {emptyState.action.label}
              </button>
            )}
          </div>
        ) : (
          <table className="data-grid-table">
            <thead>
              <tr>
                {hasSelection && (
                  <th className="selection-column">
                    {selection?.type !== 'radio' && (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="selection-checkbox"
                      />
                    )}
                  </th>
                )}
                
                {visibleColumns.map(column => (
                  <th
                    key={column.key}
                    data-column-key={column.key}
                    className={`${column.align || 'left'} ${column.sortable ? 'sortable' : ''}`}
                    style={{ width: column.width }}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                  >
                    <div className="column-header">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="sort-indicator" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}>
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : <ArrowUpDown size={14} style={{ opacity: 0.5 }} />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {sortedData.map((record, index) => {
                const key = getRowKey(record, index);
                const isSelected = selectedRowKeys.includes(key);
                
                const rowStyle = getRowStyle ? getRowStyle(record, index) : {};
                
                return (
                  <tr 
                    key={key}
                    className={`${isSelected ? 'selected' : ''}`}
                    style={rowStyle}
                  >
                    {hasSelection && (
                      <td className="selection-column">
                        <input
                          type={selection?.type || 'checkbox'}
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(key, e.target.checked)}
                          className="selection-checkbox"
                        />
                      </td>
                    )}
                    
                    {visibleColumns.map(column => (
                      <td
                        key={`${key}-${column.key}`}
                        data-column-key={column.key}
                        className={column.align || 'left'}
                        style={{ width: column.width }}
                      >
                        <div className="cell-content">
                          {getCellValue(record, column)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {pagination && !isEmpty && (
        <div className="data-grid-pagination">
          <div className="pagination-info">
            Mostrando {((pagination.current - 1) * pagination.pageSize) + 1} a{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} de{' '}
            {pagination.total} registros
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              disabled={pagination.current <= 1}
              className="btn btn-secondary btn-small"
            >
              ← Anterior
            </button>
            <span className="current-page">
              Página {pagination.current} de {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="btn btn-secondary btn-small"
            >
              Próxima →
            </button>
          </div>
          {pagination.onShowAll && (
            <button type="button" onClick={pagination.onShowAll} className="btn btn-secondary btn-small" style={{ marginLeft: '8px' }}>
              {pagination.showAllLabel ?? 'Mostrar Todos'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default DataGrid;
