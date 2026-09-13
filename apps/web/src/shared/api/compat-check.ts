import type { operations } from './openapi-types';
import type {
  Cart,
  CartItem,
  CheckoutOptions,
  Order,
  Payment,
  Product,
  Quote,
  Session,
  SessionInfo,
  Simulation,
} from '@checkout/contracts';
import type { ApiResponseData } from './api-types';

// This file verifies that OpenAPI-generated types are compatible with @checkout/contracts.
// Type errors here mean the OpenAPI spec and contracts have diverged.

type MustExtend<T, U extends T> = U;

type R<
  Op extends keyof operations,
  Status extends keyof operations[Op]['responses'],
> = ApiResponseData<Op, Status>;

export type _SessionCheck = MustExtend<Session, R<'createSession', 201>>;
export type _SessionInfoCheck = MustExtend<SessionInfo, R<'getSession', 200>>;
export type _ProductsCheck = MustExtend<Product[], R<'listProducts', 200>>;
export type _CartCheck = MustExtend<Cart, R<'getCart', 200>>;
export type _CartItemCheck = MustExtend<CartItem, R<'getCartItem', 200>>;
export type _CheckoutOptionsCheck = MustExtend<CheckoutOptions, R<'getCheckoutOptions', 200>>;
export type _QuoteCheck = MustExtend<Quote, R<'createQuote', 201>>;
export type _OrderCheck = MustExtend<Order, R<'createOrder', 201>>;
export type _PaymentCheck = MustExtend<Payment, R<'createPayment', 201>>;
export type _SimulationCheck = MustExtend<Simulation, R<'createSimulation', 201>>;
