import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePaginatedOcorrencias } from '../../hooks/usePaginatedOcorrencias';
import { apiService } from '../../services/api';

jest.mock('../../services/api');

describe('usePaginatedOcorrencias', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve carregar primeira página com 20 ocorrências', async () => {
    const mockData = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      titulo: `Ocorrência ${i + 1}`,
      descricao: 'Teste',
      status: 'Pendente',
      data_criacao: new Date().toISOString()
    }));

    apiService.buscarOcorrencias = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: {
        currentPage: 1,
        totalPages: 5,
        total: 100,
        hasMore: true,
        perPage: 20
      }
    });

    const { result } = renderHook(() => usePaginatedOcorrencias());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ocorrencias).toHaveLength(20);
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.hasMore).toBe(true);
    expect(apiService.buscarOcorrencias).toHaveBeenCalledWith(1, 20);
  });

  it('deve carregar mais ocorrências ao chamar loadMore', async () => {
    const mockPage1 = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      titulo: `Ocorrência ${i + 1}`
    }));

    const mockPage2 = Array(20).fill(null).map((_, i) => ({
      id: i + 21,
      titulo: `Ocorrência ${i + 21}`
    }));

    apiService.buscarOcorrencias = jest.fn()
      .mockResolvedValueOnce({
        dados: mockPage1,
        pagination: { currentPage: 1, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
      })
      .mockResolvedValueOnce({
        dados: mockPage2,
        pagination: { currentPage: 2, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
      });

    const { result } = renderHook(() => usePaginatedOcorrencias());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ocorrencias).toHaveLength(20);

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loadingMore).toBe(false);
    });

    expect(result.current.ocorrencias).toHaveLength(40);
    expect(result.current.pagination.currentPage).toBe(2);
  });

  it('deve resetar para página 1 ao chamar refresh', async () => {
    const mockData = Array(20).fill(null).map((_, i) => ({
      id: i + 1,
      titulo: `Ocorrência ${i + 1}`
    }));

    apiService.buscarOcorrencias = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 5, total: 100, hasMore: true, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedOcorrencias());

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
    expect(result.current.ocorrencias).toHaveLength(20);
  });

  it('não deve carregar mais quando hasMore é false', async () => {
    const mockData = Array(15).fill(null).map((_, i) => ({
      id: i + 1,
      titulo: `Ocorrência ${i + 1}`
    }));

    apiService.buscarOcorrencias = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 1, total: 15, hasMore: false, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedOcorrencias());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pagination.hasMore).toBe(false);

    await act(async () => {
      await result.current.loadMore();
    });

    // Não deve ter chamado API novamente
    expect(apiService.buscarOcorrencias).toHaveBeenCalledTimes(1);
  });

  it('deve adicionar nova ocorrência via addOcorrencia', async () => {
    const mockData = Array(5).fill(null).map((_, i) => ({
      id: i + 1,
      titulo: `Ocorrência ${i + 1}`
    }));

    apiService.buscarOcorrencias = jest.fn().mockResolvedValue({
      dados: mockData,
      pagination: { currentPage: 1, totalPages: 1, total: 5, hasMore: false, perPage: 20 }
    });

    const { result } = renderHook(() => usePaginatedOcorrencias());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ocorrencias).toHaveLength(5);

    const novaOcorrencia = {
      id: 99,
      titulo: 'Nova Ocorrência',
      descricao: 'Teste',
      status: 'Pendente'
    };

    act(() => {
      result.current.addOcorrencia(novaOcorrencia);
    });

    expect(result.current.ocorrencias).toHaveLength(6);
    expect(result.current.ocorrencias[0]).toEqual(novaOcorrencia);
  });

  it('deve tratar erro ao carregar ocorrências', async () => {
    const mockError = new Error('Erro de rede');
    apiService.buscarOcorrencias = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => usePaginatedOcorrencias());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.ocorrencias).toHaveLength(0);
  });
});
