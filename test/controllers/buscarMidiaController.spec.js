const { sequelize } = require('../../src/config/database');

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

jest.mock('../../src/services/historicoChat.js', () => ({
    buscarHistorico: jest.fn()
}));

jest.mock('../../src/services/whatsappClient', () => ({
    getChatById: jest.fn()
}));

const { getChatById } = require('../../src/services/whatsappClient');
const { buscarMidiaDownload } = require('../../src/controllers/atendimentoController');
const client = require('../../src/services/whatsappClient');

describe('buscarMidiaDownload', () => {
    it('Deve retornar a mídia com sucesso', async () => {
      const req = {
        params: { numero: '123@c.us', mensagemId: 'msg123' }
      };
  
      const mediaMock = {
        data: Buffer.from('arquivo de teste').toString('base64'),
        mimetype: 'image/jpeg',
        filename: 'imagem.jpg'
      };
  
      const msgMock = {
        id: { id: 'msg123' },
        hasMedia: true,
        downloadMedia: jest.fn().mockResolvedValue(mediaMock)
      };
  
      const chatMock = {
        fetchMessages: jest.fn().mockResolvedValue([msgMock])
      };
      
      client.getChatById.mockResolvedValue(chatMock);
      getChatById.mockResolvedValue(chatMock);
      
      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
  
      await buscarMidiaDownload(req, res);
  
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('imagem.jpg')
      );
  
      expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
    });
});

afterAll(async () => {
  if (sequelize && typeof sequelize.close === 'function') {
    await sequelize.close();
  }
});
