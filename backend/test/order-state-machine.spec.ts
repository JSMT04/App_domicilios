import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import {
  canTransition,
  getValidNextStatuses,
  isTerminal,
  transition,
  VALID_TRANSITIONS,
} from '../../src/modules/orders/order-state-machine';

describe('OrderStateMachine', () => {
  // ─── canTransition ────────────────────────────────────────────────────────────

  describe('canTransition()', () => {
    describe('VALID transitions', () => {
      it('PENDIENTE → PREPARANDO should be valid', () => {
        expect(canTransition(OrderStatus.PENDIENTE, OrderStatus.PREPARANDO)).toBe(true);
      });

      it('PENDIENTE → CANCELADO should be valid', () => {
        expect(canTransition(OrderStatus.PENDIENTE, OrderStatus.CANCELADO)).toBe(true);
      });

      it('PREPARANDO → EN_CAMINO should be valid', () => {
        expect(canTransition(OrderStatus.PREPARANDO, OrderStatus.EN_CAMINO)).toBe(true);
      });

      it('PREPARANDO → CANCELADO should be valid', () => {
        expect(canTransition(OrderStatus.PREPARANDO, OrderStatus.CANCELADO)).toBe(true);
      });

      it('EN_CAMINO → ENTREGADO should be valid', () => {
        expect(canTransition(OrderStatus.EN_CAMINO, OrderStatus.ENTREGADO)).toBe(true);
      });
    });

    describe('INVALID transitions', () => {
      it('ENTREGADO → PENDIENTE should be invalid (terminal state)', () => {
        expect(canTransition(OrderStatus.ENTREGADO, OrderStatus.PENDIENTE)).toBe(false);
      });

      it('CANCELADO → PREPARANDO should be invalid (terminal state)', () => {
        expect(canTransition(OrderStatus.CANCELADO, OrderStatus.PREPARANDO)).toBe(false);
      });

      it('EN_CAMINO → CANCELADO should be invalid', () => {
        expect(canTransition(OrderStatus.EN_CAMINO, OrderStatus.CANCELADO)).toBe(false);
      });

      it('PENDIENTE → ENTREGADO should be invalid (skipping states)', () => {
        expect(canTransition(OrderStatus.PENDIENTE, OrderStatus.ENTREGADO)).toBe(false);
      });

      it('PENDIENTE → EN_CAMINO should be invalid (skipping states)', () => {
        expect(canTransition(OrderStatus.PENDIENTE, OrderStatus.EN_CAMINO)).toBe(false);
      });

      it('PREPARANDO → ENTREGADO should be invalid (skipping states)', () => {
        expect(canTransition(OrderStatus.PREPARANDO, OrderStatus.ENTREGADO)).toBe(false);
      });

      it('ENTREGADO → ENTREGADO should be invalid (self-transition)', () => {
        expect(canTransition(OrderStatus.ENTREGADO, OrderStatus.ENTREGADO)).toBe(false);
      });

      it('CANCELADO → CANCELADO should be invalid (self-transition on terminal)', () => {
        expect(canTransition(OrderStatus.CANCELADO, OrderStatus.CANCELADO)).toBe(false);
      });
    });
  });

  // ─── transition() ─────────────────────────────────────────────────────────────

  describe('transition()', () => {
    describe('Valid transitions return new status', () => {
      it('PENDIENTE → PREPARANDO returns PREPARANDO', () => {
        expect(transition(OrderStatus.PENDIENTE, OrderStatus.PREPARANDO)).toBe(
          OrderStatus.PREPARANDO,
        );
      });

      it('PREPARANDO → EN_CAMINO returns EN_CAMINO', () => {
        expect(transition(OrderStatus.PREPARANDO, OrderStatus.EN_CAMINO)).toBe(
          OrderStatus.EN_CAMINO,
        );
      });

      it('EN_CAMINO → ENTREGADO returns ENTREGADO', () => {
        expect(transition(OrderStatus.EN_CAMINO, OrderStatus.ENTREGADO)).toBe(
          OrderStatus.ENTREGADO,
        );
      });

      it('PENDIENTE → CANCELADO returns CANCELADO', () => {
        expect(transition(OrderStatus.PENDIENTE, OrderStatus.CANCELADO)).toBe(
          OrderStatus.CANCELADO,
        );
      });

      it('PREPARANDO → CANCELADO returns CANCELADO', () => {
        expect(transition(OrderStatus.PREPARANDO, OrderStatus.CANCELADO)).toBe(
          OrderStatus.CANCELADO,
        );
      });
    });

    describe('Invalid transitions throw BadRequestException', () => {
      it('ENTREGADO → PENDIENTE throws BadRequestException', () => {
        expect(() =>
          transition(OrderStatus.ENTREGADO, OrderStatus.PENDIENTE),
        ).toThrow(BadRequestException);
      });

      it('CANCELADO → PREPARANDO throws BadRequestException', () => {
        expect(() =>
          transition(OrderStatus.CANCELADO, OrderStatus.PREPARANDO),
        ).toThrow(BadRequestException);
      });

      it('EN_CAMINO → CANCELADO throws BadRequestException', () => {
        expect(() =>
          transition(OrderStatus.EN_CAMINO, OrderStatus.CANCELADO),
        ).toThrow(BadRequestException);
      });

      it('ENTREGADO → any throws BadRequestException', () => {
        const allStatuses = Object.values(OrderStatus);
        allStatuses.forEach((status) => {
          expect(() =>
            transition(OrderStatus.ENTREGADO, status),
          ).toThrow(BadRequestException);
        });
      });

      it('CANCELADO → any throws BadRequestException', () => {
        const allStatuses = Object.values(OrderStatus);
        allStatuses.forEach((status) => {
          expect(() =>
            transition(OrderStatus.CANCELADO, status),
          ).toThrow(BadRequestException);
        });
      });
    });

    describe('Error message content', () => {
      it('throws an error containing both source and target status', () => {
        try {
          transition(OrderStatus.ENTREGADO, OrderStatus.PENDIENTE);
        } catch (e) {
          expect(e.message).toContain('ENTREGADO');
          expect(e.message).toContain('PENDIENTE');
        }
      });
    });
  });

  // ─── isTerminal() ─────────────────────────────────────────────────────────────

  describe('isTerminal()', () => {
    it('ENTREGADO is terminal', () => {
      expect(isTerminal(OrderStatus.ENTREGADO)).toBe(true);
    });

    it('CANCELADO is terminal', () => {
      expect(isTerminal(OrderStatus.CANCELADO)).toBe(true);
    });

    it('PENDIENTE is NOT terminal', () => {
      expect(isTerminal(OrderStatus.PENDIENTE)).toBe(false);
    });

    it('PREPARANDO is NOT terminal', () => {
      expect(isTerminal(OrderStatus.PREPARANDO)).toBe(false);
    });

    it('EN_CAMINO is NOT terminal', () => {
      expect(isTerminal(OrderStatus.EN_CAMINO)).toBe(false);
    });
  });

  // ─── getValidNextStatuses() ───────────────────────────────────────────────────

  describe('getValidNextStatuses()', () => {
    it('PENDIENTE has [PREPARANDO, CANCELADO] as valid next statuses', () => {
      const next = getValidNextStatuses(OrderStatus.PENDIENTE);
      expect(next).toContain(OrderStatus.PREPARANDO);
      expect(next).toContain(OrderStatus.CANCELADO);
      expect(next).toHaveLength(2);
    });

    it('PREPARANDO has [EN_CAMINO, CANCELADO] as valid next statuses', () => {
      const next = getValidNextStatuses(OrderStatus.PREPARANDO);
      expect(next).toContain(OrderStatus.EN_CAMINO);
      expect(next).toContain(OrderStatus.CANCELADO);
      expect(next).toHaveLength(2);
    });

    it('EN_CAMINO has [ENTREGADO] as only valid next status', () => {
      const next = getValidNextStatuses(OrderStatus.EN_CAMINO);
      expect(next).toEqual([OrderStatus.ENTREGADO]);
    });

    it('ENTREGADO has no valid next statuses', () => {
      expect(getValidNextStatuses(OrderStatus.ENTREGADO)).toHaveLength(0);
    });

    it('CANCELADO has no valid next statuses', () => {
      expect(getValidNextStatuses(OrderStatus.CANCELADO)).toHaveLength(0);
    });
  });

  // ─── VALID_TRANSITIONS map completeness ──────────────────────────────────────

  describe('VALID_TRANSITIONS map completeness', () => {
    it('covers all OrderStatus values', () => {
      const allStatuses = Object.values(OrderStatus);
      allStatuses.forEach((status) => {
        expect(VALID_TRANSITIONS).toHaveProperty(status);
      });
    });
  });
});
