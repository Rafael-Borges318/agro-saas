export const climaService = {
  async getCurrent(cidade: string) {
    // TODO: integrar com OpenWeatherMap ou similar
    return {
      cidade,
      temperatura: null,
      descricao: 'Integração com API de clima pendente',
      umidade: null,
      vento: null,
    };
  },

  async getForecast(cidade: string) {
    return { cidade, previsao: [], mensagem: 'Integração com API de clima pendente' };
  },
};
