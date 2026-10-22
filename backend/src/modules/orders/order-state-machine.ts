import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

/**
 * Valid state transitions for an Order.
 *
 * PENDIENTE  → PREPARANDO | CANCELADO
 * PREPARANDO → EN_CAMINO  | CANCELADO
 * EN_CAMINO  → ENTREGADO
 * ENTREGADO  → (terminal)
 * CANCELADO  → (terminal)
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDIENTE]:   [OrderStatus.PREPARANDO, OrderStatus.CANCELADO],
  [OrderStatus.PREPARANDO]:  [OrderStatus.EN_CAMINO, OrderStatus.CANCELADO],
  [OrderStatus.EN_CAMINO]:   [OrderStatus.ENTREGADO],
  [OrderStatus.ENTREGADO]:   [],
  [OrderStatus.CANCELADO]:   [],
};

/**
 * Returns true if transitioning from `from` to `to` is allowed.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Executes the transition and returns the new status.
 * Throws BadRequestException if the transition is invalid.
 */
export function transition(from: OrderStatus, to: OrderStatus): OrderStatus {
  if (!canTransition(from, to)) {
    throw new BadRequestException(
      `Transición inválida: ${from} → ${to}. ` +
      `Transiciones permitidas desde ${from}: [${VALID_TRANSITIONS[from].join(', ') || 'ninguna'}]`,
    );
  }
  return to;
}

/**
 * Returns whether a status is terminal (no further transitions allowed).
 */
export function isTerminal(status: OrderStatus): boolean {
  return VALID_TRANSITIONS[status].length === 0;
}

/**
 * Returns all valid next statuses from a given status.
 */
export function getValidNextStatuses(status: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}
