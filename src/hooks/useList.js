import { useState, useCallback, useMemo } from 'react';

export function useList(initialData = []) {
  const [items, setItems] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});

  // Adicionar item
  const addItem = useCallback((item) => {
    setItems(prev => [...prev, { ...item, id: item.id || Date.now() }]);
  }, []);

  // Remover item
  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Atualizar item
  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  // Limpar lista
  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  // Buscar items
  const search = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Ordenar items
  const sort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Filtrar items
  const filter = useCallback((filterKey, filterValue) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: filterValue
    }));
  }, []);

  // Remover filtro
  const removeFilter = useCallback((filterKey) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey];
      return newFilters;
    });
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Items processados (filtrados, pesquisados e ordenados)
  const processedItems = useMemo(() => {
    let result = [...items];

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          if (typeof value === 'string') {
            return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
          }
          return item[key] === value;
        });
      }
    });

    // Aplicar busca
    if (searchTerm) {
      result = result.filter(item => 
        Object.values(item).some(value => 
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Aplicar ordenação
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [items, searchTerm, sortConfig, filters]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: items.length,
    filtered: processedItems.length,
    hasFilters: Object.keys(filters).length > 0,
    hasSearch: Boolean(searchTerm),
    isSorted: Boolean(sortConfig.key)
  }), [items.length, processedItems.length, filters, searchTerm, sortConfig.key]);

  // Função para recarregar dados
  const reload = useCallback(async (loadFunction) => {
    if (!loadFunction) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await loadFunction();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    items: processedItems,
    allItems: items,
    loading,
    error,
    searchTerm,
    sortConfig,
    filters,
    stats,
    
    // Ações
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems,
    
    // Busca
    search,
    
    // Ordenação
    sort,
    
    // Filtros
    filter,
    removeFilter,
    clearFilters,
    
    // Utilidades
    reload,
    setLoading,
    setError
  };
}
