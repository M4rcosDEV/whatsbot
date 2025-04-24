beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });



jest.mock('../../src/models', () => ({
    Atendimento: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
    Usuario: {
      findByPk: jest.fn()
    } 
  }));

jest.mock('../../src/services/whatsappClient.js', () => ({
    getChatById: jest.fn(),
    sendMessage: jest.fn()
}));


jest.mock('../../src/services/historicoChat.js', () => ({
    buscarHistorico: jest.fn()
}));


const { listarAtendimentos, iniciarAtendimento, buscarMidiaDownload } = require('../../src/controllers/atendimentoController');
const { Atendimento, Usuario } = require('../../src/models');
const client = require('../../src/services/whatsappClient');
const { buscarHistorico } = require('../../src/services/historicoChat');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe('listarAtendimentos', () => {
  it('Deve retornar uma lista de atendimentos com status 200', async () => {
    const req = {};
    const res = mockResponse();

    const mockAtendimentos = [
      {
        id: 1,
        cliente: 'João',
        updatedAt: new Date(),
        usuario: { id: 10, nome: 'Atendente 1' }
      },
      {
        id: 2,
        cliente: 'Maria',
        updatedAt: new Date(),
        usuario: { id: 11, nome: 'Atendente 2' }
      }
    ];

    Atendimento.findAll.mockResolvedValue(mockAtendimentos);

    await listarAtendimentos(req, res);

    expect(Atendimento.findAll).toHaveBeenCalledWith({
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: expect.anything(), // O Sequelize ignora mock de 'include', por isso o any
          as: 'usuario',
          attributes: ['id', 'nome'],
        }
      ]
    });

    expect(res.status).not.toHaveBeenCalled(); // status padrão é 200
    expect(res.json).toHaveBeenCalledWith(mockAtendimentos);
  });

  it('Deve retornar status 500 se ocorrer erro', async () => {
    const req = {};
    const res = mockResponse();

    Atendimento.findAll.mockRejectedValue(new Error('DB error'));

    await listarAtendimentos(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ erro: 'Erro ao buscar atendimentos' });
  });
});


describe('iniciarAtendimento', () => {
    it('Deve iniciar atendimento com sucesso e retornar status 200', async () => {
      const req = {
        params: { id: 1 },
        user: { id: 2 }
      };
      const res = mockResponse();
  
      const mockAtendimento = {
        id: 1,
        usuario_id: null,
        numero: '13135550002',
        save: jest.fn()
      };
      const mockUsuario = { id: 2, nome: 'Atendente' };
      const mockHistorico = [];
  
      Atendimento.findByPk.mockResolvedValue(mockAtendimento);
      Usuario.findByPk.mockResolvedValue(mockUsuario);
      buscarHistorico.mockResolvedValue(mockHistorico);
      client.sendMessage.mockResolvedValue();
      
      await iniciarAtendimento(req, res);
  
      expect(Atendimento.findByPk).toHaveBeenCalledWith(1);
      expect(Usuario.findByPk).toHaveBeenCalledWith(2);
      expect(mockAtendimento.save).toHaveBeenCalled();
      expect(client.sendMessage).toHaveBeenCalledWith('13135550002@c.us', 'Olá! Meu nome é Atendente e estou assumindo seu atendimento.');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Atendimento iniciado com sucesso',
        atendimento: mockAtendimento,
        historico: mockHistorico
      });
    });
  
    it('Deve retornar erro 404 quando o atendimento não for encontrado', async () => {
      const req = { params: { id: 1 }, user: { id: 2 } };
      const res = mockResponse();
  
      Atendimento.findByPk.mockResolvedValue(null);
  
      await iniciarAtendimento(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Atendimento não encontrado' });
    });
  
    it('Deve retornar erro 400 quando o atendimento já foi iniciado', async () => {
      const req = { params: { id: 1 }, user: { id: 2 } };
      const res = mockResponse();
  
      const mockAtendimento = { id: 1, usuario_id: 3, save: jest.fn() };
      Atendimento.findByPk.mockResolvedValue(mockAtendimento);
  
      await iniciarAtendimento(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Este atendimento já foi iniciado por outro atendente.' });
    });
  
    it('Deve retornar erro 500 em caso de falha interna', async () => {
      const req = { params: { id: 1 }, user: { id: 2 } };
      const res = mockResponse();
  
      Atendimento.findByPk.mockRejectedValue(new Error('Erro no banco'));
  
      await iniciarAtendimento(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Erro interno ao iniciar atendimento' });
    });
});

// describe('buscarMidiaDownload', () => {
//     it('Deve retornar a mídia com sucesso', async () => {
//       const req = {
//         params: { numero: '123@c.us', mensagemId: 'msg123' }
//       };
  
//       const mediaMock = {
//         data: Buffer.from('arquivo de teste').toString('base64'),
//         mimetype: 'image/jpeg',
//         filename: 'imagem.jpg'
//       };
  
//       const msgMock = {
//         id: { id: 'msg123' },
//         hasMedia: true,
//         downloadMedia: jest.fn().mockResolvedValue(mediaMock)
//       };
  
//       const chatMock = {
//         fetchMessages: jest.fn().mockResolvedValue([msgMock])
//       };
  
//       client.getChatById.mockResolvedValue(chatMock);
  
//       const res = {
//         set: jest.fn(),
//         send: jest.fn(),
//         status: jest.fn().mockReturnThis(),
//         json: jest.fn()
//       };
  
//       await buscarMidiaDownload(req, res);
  
//       expect(res.set).toHaveBeenCalledWith({
//         'Content-Type': 'image/jpeg',
//         'Content-Disposition': expect.stringContaining('imagem.jpg')
//       });

//       expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
//     });
// });