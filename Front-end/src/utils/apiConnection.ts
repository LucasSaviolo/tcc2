// Arquivo para verificar a conectividade com a API
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const checkApiConnection = async (): Promise<boolean> => {
  try {
    // Tentar buscar o usuário atual como teste de conectividade
    await apiService.getCurrentUser();
    return true;
  } catch (error: any) {
    // Se for erro de autenticação (401), a API está funcionando mas o token pode estar inválido
    if (error.response?.status === 401) {
      return true;
    }
    
    // Se não houver resposta, provavelmente o backend não está rodando
    if (!error.response) {
      toast.error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      console.error('Erro de conexão com o servidor:', error);
      return false;
    }
    
    // Outros erros
    toast.error(`Erro ao conectar com o servidor: ${error.response?.data?.message || error.message}`);
    return false;
  }
};

export default checkApiConnection;

