/**
 * Utilitários para formatação de datas
 */

/**
 * Formata uma data para o formato brasileiro: DD/MM/YYYY às HH:mm
 * @param date - Data a ser formatada (string, Date ou null)
 * @returns String formatada ou '-' se a data for null/undefined
 */
export function formatarDataBR(date: string | Date | null | undefined): string {
  if (!date) {
    return '-';
  }

  try {
    const dataObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dataObj.getTime())) {
      return '-';
    }

    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    const horas = String(dataObj.getHours()).padStart(2, '0');
    const minutos = String(dataObj.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
}

/**
 * Formata uma data apenas com data (sem hora): DD/MM/YYYY
 * @param date - Data a ser formatada (string, Date ou null)
 * @returns String formatada ou '-' se a data for null/undefined
 */
export function formatarDataBRSimples(date: string | Date | null | undefined): string {
  if (!date) {
    return '-';
  }

  try {
    const dataObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dataObj.getTime())) {
      return '-';
    }

    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
}




