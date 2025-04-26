process.env.NODE_ENV = 'test';
const { sequelize } = require('../../src/config/database');

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

jest.mock('../../src/models/index', () => ({
    Usuario: {
      findAll: jest.fn(),
      create: jest.fn()
    }
}));

const { Usuario } = require('../../src/models/index');
const { listarUsuarios, listarStatusUsuarios, criarUsuario} = require('../../src/controllers/usuarioController');
  

const mockResponse = () =>{
    const res = {}; 
    res.status = jest.fn().mockReturnValue(res); 
    res.json = jest.fn();
    return res;
};

describe('listarUsuarios', () => {
    it('Deve retornar uma lista de usuários com status 200', async () => {
        const req = {};
        const res = mockResponse();

        mockUsuarios = [
            { id: 1, nome: 'João', email: 'joao@example.com' },
            { id: 2, nome: 'Maria', email: 'maria@example.com' }
        ];

        Usuario.findAll.mockResolvedValue(mockUsuarios);

        await listarUsuarios(req, res);

        expect(Usuario.findAll).toHaveBeenCalledWith({
            attributes: ['id', 'nome', 'email'],
            order: [['createdAt', 'ASC']]
        });

        expect(res.json).toHaveBeenCalledWith(mockUsuarios);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('Deve retornar um erro com status 500 ao falhar na busca de usuários', async () =>{
        const req = {};
        const res = mockResponse();

        Usuario.findAll.mockRejectedValue(new Error('DB error'));
    
        await listarUsuarios(req, res);

        expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao obter usuários' });
        expect(res.status).toHaveBeenCalledWith(500);
    })
});

describe('listarStatusUsuarios', () => {
    it('Deve retornar a lista de usuários com status 200', async () => {
      const mockUsuarios = [
        { id: 1, nome: 'João', email: 'joao@example.com', atendimentos_abertos: 2 },
        { id: 2, nome: 'Maria', email: 'maria@example.com', atendimentos_abertos: 1 },
      ];
  
      const req = {}; // Mock do request, que pode ser vazio para esse teste
      const res = mockResponse();
  
      // Mockando o retorno de findAll
      Usuario.findAll.mockResolvedValue(mockUsuarios);
  
      // Chama a função
      await listarStatusUsuarios(req, res);
  
      // Verificações
      expect(Usuario.findAll).toHaveBeenCalledWith({
        attributes: [
          'id',
          'nome',
          'email',
          [
            expect.anything(), // Aqui estamos só verificando que o literal foi passado
            'atendimentos_abertos',
          ],
        ],
        order: [
          [expect.anything(), 'DESC'], // Verifica que o literal de contagem de atendimentos foi passado
        ],
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsuarios);
    });
  
    it('Deve retornar um erro com status 500 ao falhar na consulta', async () => {
      const req = {};
      const res = mockResponse();
  
      // Simulando falha no banco
      Usuario.findAll.mockRejectedValue(new Error('DB error'));
  
      await listarStatusUsuarios(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Erro ao obter status dos usuários' });
    });
  });

describe('criarUsuario', () => {
    it('Deve criar um usuário e retornar status 201', async () => {
        const req = {
            body: {
                nome: 'Carlos',
                email: 'carlos@example.com',
                senha: 'senha123'
            }
        };
        const res = mockResponse();

        const mockUsuarioCriado = {
            id: 3,
            nome: 'Carlos',
            email: 'carlos@example.com',
            senha: 'senha123',
        };

        Usuario.create = jest.fn().mockResolvedValue(mockUsuarioCriado);

        await criarUsuario(req, res);

        expect(Usuario.create).toHaveBeenCalledWith({
            nome: 'Carlos',
            email: 'carlos@example.com',
            senha: 'senha123'
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUsuarioCriado);
    });

    it('Deve retornar erro 500 ao falhar na criação de usuário', async () => {
        const req = {
            body: {
                nome: 'Carlos',
                email: 'carlos@example.com',
                senha: 'senha123'
            }
        };
        const res = mockResponse();

        Usuario.create = jest.fn().mockRejectedValue(new Error('Erro no banco'));

        await criarUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ mensagem: "Erro ao criar usuario" });
    });
});

afterAll(async () => {
  if (sequelize && typeof sequelize.close === 'function') {
    await sequelize.close();
  }
});