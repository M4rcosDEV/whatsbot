beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

jest.mock('../../src/models/index', () => ({
    Usuario: {
        findAll: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn()
    }
}));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

const { Usuario } = require('../../src/models/index');
const {loginUsuario, cadastrarUsuario,} = require('../../src/controllers/authController');

const mockResponse = () =>{
    const res = {}; 
    res.status = jest.fn().mockReturnValue(res); 
    res.json = jest.fn();
    return res;
};

describe('loginUsuario', () => {
    it('Deve realizar login com sucesso e retornar token', async () => {
        const req = {
            body: {
                email: 'teste@example.com',
                senha: 'senha123'
            }
        };
        const res = mockResponse();
        res.cookie = jest.fn();

        const mockUsuario = {
            id: 1,
            email: 'teste@example.com',
            senha: 'senhaHash'
        };

        Usuario.findOne = jest.fn().mockResolvedValue(mockUsuario);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('token.jwt.aqui');

        await loginUsuario(req, res);

        expect(Usuario.findOne).toHaveBeenCalledWith({ where: { email: 'teste@example.com' } });
        expect(bcrypt.compare).toHaveBeenCalledWith('senha123', 'senhaHash');
        expect(jwt.sign).toHaveBeenCalledWith({ id: mockUsuario.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        expect(res.cookie).toHaveBeenCalledWith(
            'auth-token',
            'token.jwt.aqui',
            expect.objectContaining({
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/',
                maxAge: 1000 * 60 * 60 * 24
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: 'token.jwt.aqui' });
    });

    it('Deve retornar erro 401 com credenciais inválidas', async () => {
        const req = {
            body: {
                email: 'teste@example.com',
                senha: 'senhaErrada'
            }
        };
        const res = mockResponse();

        Usuario.findOne = jest.fn().mockResolvedValue({ senha: 'senhaHash' });
        bcrypt.compare.mockResolvedValue(false);

        await loginUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ mensagem: 'Credenciais inválidas' });
    });

    it('Deve retornar erro 401 se o usuário não existir', async () => {
        const req = {
            body: {
                email: 'inexistente@example.com',
                senha: 'qualquer'
            }
        };
        const res = mockResponse();

        Usuario.findOne = jest.fn().mockResolvedValue(null);

        await loginUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ mensagem: 'Credenciais inválidas' });
    });

    it('Deve retornar erro 500 em caso de falha interna', async () => {
        const req = {
            body: {
                email: 'teste@example.com',
                senha: 'senha123'
            }
        };
        const res = mockResponse();

        Usuario.findOne = jest.fn().mockRejectedValue(new Error('Erro interno'));

        await loginUsuario(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ mensagem: 'Erro ao realizar login' });
    });
});

describe('cadastrarUsuario', () => {
    it('Deve cadastrar um novo usuário e retornar token', async () => {
      const req = {
        body: {
          nome: 'Carlos',
          email: 'carlos@example.com',
          senha: 'senha123'
        }
      };
      const res = mockResponse();
  
      Usuario.findOne.mockResolvedValue(null); // não existe
      bcrypt.hash.mockResolvedValue('senha-hash');
      Usuario.create.mockResolvedValue({ id: 1 });
      jwt.sign.mockReturnValue('fake-token');
  
      await cadastrarUsuario(req, res);
  
      expect(Usuario.findOne).toHaveBeenCalledWith({ where: { email: req.body.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      expect(Usuario.create).toHaveBeenCalledWith({
        nome: 'Carlos',
        email: 'carlos@example.com',
        senha: 'senha-hash'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        mensagem: 'Usuário criado com sucesso',
        token: 'fake-token'
      });
    });
  
    it('Deve retornar erro se e-mail já estiver cadastrado', async () => {
      const req = {
        body: {
          nome: 'Carlos',
          email: 'carlos@example.com',
          senha: 'senha123'
        }
      };
      const res = mockResponse();
  
      Usuario.findOne.mockResolvedValue({ id: 1 }); // já existe
  
      await cadastrarUsuario(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'E-mail já cadastrado' });
    });
  
    it('Deve retornar erro 500 se ocorrer uma exceção', async () => {
      const req = {
        body: {
          nome: 'Carlos',
          email: 'carlos@example.com',
          senha: 'senha123'
        }
      };
      const res = mockResponse();
  
      Usuario.findOne.mockRejectedValue(new Error('Erro no banco'));
  
      await cadastrarUsuario(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ mensagem: 'Erro ao cadastrar usuário' });
    });
});
