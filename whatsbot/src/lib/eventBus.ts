import mitt from 'mitt'

type Events = {
  atendimentoIniciado: void,
  atendimentoIniciadoSucesso: number
}

export const eventBus = mitt<Events>()
