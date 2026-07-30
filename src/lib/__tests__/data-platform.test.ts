import { describe, it, expect, vi } from 'vitest';
import { buildStoragePath } from '../storage-paths';
import { registrarTimelineEvent, obterTimelineEventos } from '../timeline-event';
import { prisma } from '../prisma';

vi.mock('../prisma', () => ({
  prisma: {
    timelineEvent: {
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'evt_1', ...data, createdAt: new Date() })),
      findMany: vi.fn().mockImplementation(({ where }) =>
        Promise.resolve([
          {
            id: 'evt_1',
            empresaId: where.empresaId,
            entityType: where.entityType,
            entityId: where.entityId,
            event: 'CRIADO',
            payloadJson: JSON.stringify({ versao: 'v1.0' }),
            createdAt: new Date(),
          },
        ])
      ),
    },
  },
}));

describe('PrintForge Data Platform (PFDP) — Storage & Universal Timeline', () => {
  it('deve gerar caminhos de armazenamento padronizados por empresa', () => {
    const pathStl = buildStoragePath({
      companyId: 'emp_alpha',
      assetId: 'ast_101',
      versionNumber: 2,
      filename: 'Dragão Articulado.stl',
      type: 'stl',
    });

    expect(pathStl).toBe('emp_alpha/assets/stl/ast_101/v2/drag_o_articulado.stl');

    const pathThumb = buildStoragePath({
      companyId: 'emp_alpha',
      assetId: 'ast_101',
      filename: 'thumb.png',
      type: 'thumb',
    });

    expect(pathThumb).toBe('emp_alpha/assets/thumbs/ast_101/thumb.png');
  });

  it('deve registrar eventos na linha do tempo universal de uma entidade', async () => {
    const res = await registrarTimelineEvent({
      empresaId: 'emp_alpha',
      entityType: 'PECA',
      entityId: 'peca_999',
      event: 'FATIAMENTO_CONCLUIDO',
      payload: { slicer: 'OrcaSlicer', tempoHoras: 4.5 },
    });

    expect(res).toBeDefined();
    expect(prisma.timelineEvent.create).toHaveBeenCalled();
  });

  it('deve consultar o histórico de eventos de replay de uma peça', async () => {
    const eventos = await obterTimelineEventos('emp_alpha', 'PECA', 'peca_999');

    expect(eventos.length).toBe(1);
    expect(eventos[0].event).toBe('CRIADO');
    expect(eventos[0].payload.versao).toBe('v1.0');
  });
});
