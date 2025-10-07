import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePaginatedVisitantes } from '../../hooks/usePaginatedVisitantes';
import { apiService } from '../../services/api';

jest.mock('../../services/api');

describe('usePaginatedVisitantes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar primeira página com 20 visitantes', async () => {
    const mockData = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      nome: `Visitante ${i + 1}`,
      documento: `000.000.000-${i.toString().padStart(2, '0')}`,
      status: 'Autorizado',
      tipo: 'Morador'
    }));

    apiService.listarVisitantes = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: {
        currentPage: 1,
        totalPages: 5,
        total: 100,
        hasMore: true,
        perPage: 20
      }
    });

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.visitantes).toHaveLength(20);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(apiService.listarVisitantes).toHaveBeenCalledWith({}, 1, 20);
  });

  it('deve carregar mais visitantes ao chamar loadMore', async () => {
    const mockPage1 = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      nome: `Visitante ${i + 1}`,
      status: 'Autorizado'
    }));

    const mockPage2 = Array(20).fill(null).map((_, i) => ({
      id: i + 21,
      nome: `Visitante ${i + 21}`,
      status: 'Autorizado'
    }));

    apiService.listarVisitantes = jest.fn()
      .mockResolvedValueOnce({
        dados: mockPage1,
        pagination: { currentPage: 1, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
      })
      .mockResolvedValueOnce({
        dados: mockPage2,
        pagination: { currentPage: 2, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
      });

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.visitantes).toHaveLength(20);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    expect(result.current.visitantes).toHaveLength(40);
    expect(result.current.pagination.currentPage).toBe(2);
  });

  it('deve aplicar filtros e manter na paginação', async () => {
    const mockData = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      nome: `Visitante ${i + 1}`,
      status: 'Autorizado',
      tipo: 'Morador'
    }));

    apiService.listarVisitantes = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 2, total: 40, hasMore: true, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const filtros = { status: 'Autorizado', tipo: 'Morador' };

    await act(async () => {
      await result.current.updateFilters(filtros);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Deve ter chamado API com filtros
    expect(apiService.listarVisitantes).toHaveBeenLastCalledWith(filtros, 1, 20);

    // Carregar mais deve manter filtros
    await act(async () => {
      await result.current.loadMore();
    });

    expect(apiService.listarVisitantes).toHaveBeenLastCalledWith(filtros, 2, 20);
  });

  it('deve resetar para página 1 ao mudar filtros', async () => {
    const mockData = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      nome: `Visitante ${i + 1}`,
      status: 'Autorizado'
    }));

    apiService.listarVisitantes = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Carrega página 2
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.pagination.currentPage).toBe(2);

    // Muda filtros - deve resetar para página 1
    await act(async () => {
      await result.current.updateFilters({ status: 'Pendente' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pagination.currentPage).toBe(1);
  });

  it('deve resetar para página 1 ao chamar refresh', async () => {
    const mockData = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      nome: `Visitante ${i + 1}`
    }));

    apiService.listarVisitantes = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Carrega página 2
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.pagination.currentPage).toBe(2);

    // Refresh reseta
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.refreshing).toBe(false);
    });

    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.visitantes).toHaveLength(20);
  });

  it('não deve carregar mais quando hasMore é false', async () => {
    const mockData = Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      nome: `Visitante ${i + 1}`
    }));

    apiService.listarVisitantes = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 1, total: 15, hasMore: false, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pagination.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    // Não deve ter chamado API novamente
    expect(apiService.listarVisitantes).toHaveBeenCalledTimes(1);
  });

  it('deve tratar erro ao carregar visitantes', async () => {
    const mockError = new Error('Erro de rede');
    apiService.listarVisitantes = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => usePaginatedVisitantes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.visitantes).toHaveLength(0);
  });
});
