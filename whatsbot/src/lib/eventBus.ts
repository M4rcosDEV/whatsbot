import mitt from 'mitt'

type Events = {
  atendimentoIniciado: void
}

export const eventBus = mitt<Events>()
