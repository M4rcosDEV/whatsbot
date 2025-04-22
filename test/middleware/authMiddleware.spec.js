beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../src/middleware/authMiddleware');
const { Usuario } = require('../../src/models');

jest.mock('../../src/models', () => ({
  Usuario: {
    findByPk: jest.fn(),
  },
}));

jest.mock('jsonwebtoken');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe('authMiddleware', () => {
  it('deve retornar 401 se não houver token', async () => {
    const req = { cookies: {} };
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Não autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 401 se o token for inválido', async () => {
    const req = { cookies: { 'auth-token': 'token_invalido' } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 404 se o usuário não for encontrado', async () => {
    const req = { cookies: { 'auth-token': 'token_valido' } };
    const res = mockResponse();
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 1 });
    Usuario.findByPk.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Usuário não encontrado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve chamar next() e definir req.user se o token e usuário forem válidos', async () => {
    const req = { cookies: { 'auth-token': 'token_valido' } };
    const res = mockResponse();
    const next = jest.fn();

    const fakeUser = { id: 1, nome: 'Teste' };

    jwt.verify.mockReturnValue({ id: 1 });
    Usuario.findByPk.mockResolvedValue(fakeUser);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});
