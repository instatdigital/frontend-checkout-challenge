import { Type, type Static, type TSchema } from '@sinclair/typebox';

const object = <T extends Record<string, TSchema>>(properties: T) =>
  Type.Object(properties, { additionalProperties: false });
const text = (description?: string) => Type.String({ minLength: 1, maxLength: 500, description });
const money = () => Type.Integer({ minimum: 0, description: 'Копейки; 129000 = 1 290 ₽.' });
export const Id = Type.String({ format: 'uuid' });
const timestamp = () => Type.String({ format: 'date-time' });
export const EmptyBody = object({});
export const Meta = object({ requestId: Type.String() });
export const Links = Type.Record(
  Type.String(),
  object({
    href: Type.String({ pattern: '^/' }),
    method: Type.Union([
      Type.Literal('GET'),
      Type.Literal('POST'),
      Type.Literal('PUT'),
      Type.Literal('DELETE'),
    ]),
  }),
);
export const envelope = <T extends TSchema>(data: T) => object({ data, meta: Meta, links: Links });
export const ErrorResponse = object({
  error: object({
    code: text('Машинный код ошибки.'),
    message: text('Сообщение для пользователя.'),
    fields: Type.Optional(Type.Array(object({ path: text(), message: text() }))),
  }),
  meta: Meta,
});
export const ProductSchema = object({
  id: text(),
  sku: text(),
  title: text(),
  description: text(),
  price: money(),
  currency: Type.Literal('RUB'),
  stock: Type.Integer({
    minimum: 0,
    description: 'Лимит количества в одной корзине; учебный остаток.',
  }),
});
export const CartItemSchema = object({
  productId: Type.String({ ...text(), readOnly: true }),
  title: Type.String({ ...text(), readOnly: true }),
  unitPrice: Type.Integer({ ...money(), readOnly: true }),
  quantity: Type.Integer({ minimum: 1, maximum: 99 }),
  lineTotal: Type.Integer({ ...money(), readOnly: true }),
});
export const CartSchema = object({
  id: Id,
  version: Type.Integer({ minimum: 0 }),
  items: Type.Array(CartItemSchema),
  quantity: Type.Integer({ minimum: 0 }),
  subtotal: money(),
  currency: Type.Literal('RUB'),
});
export const SetCartItemBody = object({
  quantity: Type.Integer({
    minimum: 1,
    maximum: 99,
    description: 'Новое абсолютное количество, не прибавка.',
    examples: [1],
  }),
});
export const AddressSchema = object({
  city: Type.String({ minLength: 2, maxLength: 100, pattern: '\\S', examples: ['Учебный'] }),
  street: Type.String({ minLength: 2, maxLength: 150, pattern: '\\S', examples: ['Примерная'] }),
  house: Type.String({ minLength: 1, maxLength: 20, pattern: '\\S', examples: ['10'] }),
  apartment: Type.Optional(Type.String({ maxLength: 20 })),
});
export const DeliverySchema = Type.Union([
  object({
    method: Type.Literal('pickup'),
    pickupPointId: Type.String({ enum: ['point-center', 'point-north'] }),
  }),
  object({ method: Type.Literal('courier'), address: AddressSchema }),
]);
export const PaymentMethodSchema = Type.Union([
  Type.Literal('card'),
  Type.Literal('cash_on_delivery'),
]);
export const CustomerSchema = object({
  name: Type.String({
    minLength: 2,
    maxLength: 100,
    pattern: '\\S',
    examples: ['Тестовый Покупатель'],
  }),
  email: Type.String({ format: 'email', maxLength: 150, examples: ['buyer@example.test'] }),
  phone: Type.String({ pattern: '^\\+[1-9]\\d{9,14}$', examples: ['+79990000000'] }),
});
export const CheckoutOptionsSchema = object({
  cart: CartSchema,
  deliveryMethods: Type.Array(
    object({
      id: Type.Union([Type.Literal('pickup'), Type.Literal('courier')]),
      title: text(),
      price: money(),
      freeFrom: Type.Unsafe<number | null>({ ...money(), nullable: true }),
      pickupPoints: Type.Array(object({ id: text(), title: text(), address: text() })),
    }),
  ),
  paymentMethods: Type.Array(object({ id: PaymentMethodSchema, title: text() })),
});
export const QuoteBody = object({
  cartVersion: Type.Integer({ minimum: 0 }),
  delivery: DeliverySchema,
});
export const QuoteSchema = object({
  id: Id,
  cartVersion: Type.Integer({ minimum: 0 }),
  items: Type.Array(CartItemSchema),
  delivery: DeliverySchema,
  subtotal: money(),
  shipping: money(),
  total: money(),
  currency: Type.Literal('RUB'),
  expiresAt: timestamp(),
});
export const CreateOrderBody = object({
  quoteId: Id,
  customer: CustomerSchema,
  paymentMethod: PaymentMethodSchema,
});
export const OrderSchema = object({
  id: Id,
  number: text(),
  status: Type.Union([
    Type.Literal('awaiting_payment'),
    Type.Literal('paid'),
    Type.Literal('confirmed'),
  ]),
  paymentStatus: Type.Union([
    Type.Literal('unpaid'),
    Type.Literal('pending'),
    Type.Literal('succeeded'),
    Type.Literal('failed'),
    Type.Literal('cancelled'),
  ]),
  paymentMethod: PaymentMethodSchema,
  customer: CustomerSchema,
  items: Type.Array(CartItemSchema),
  delivery: DeliverySchema,
  subtotal: money(),
  shipping: money(),
  total: money(),
  currency: Type.Literal('RUB'),
  createdAt: timestamp(),
});
export const PaymentSchema = object({
  id: Id,
  orderId: Id,
  status: Type.Union([
    Type.Literal('pending'),
    Type.Literal('processing'),
    Type.Literal('succeeded'),
    Type.Literal('failed'),
    Type.Literal('cancelled'),
  ]),
  amount: money(),
  currency: Type.Literal('RUB'),
  createdAt: timestamp(),
  failureCode: Type.Unsafe<'CARD_DECLINED' | null>({
    type: 'string',
    enum: ['CARD_DECLINED', null],
    nullable: true,
  }),
});
export const SimulateBody = object({
  scenario: Type.Union([Type.Literal('success'), Type.Literal('decline'), Type.Literal('cancel')]),
});
export const SimulationSchema = object({
  id: Id,
  paymentId: Id,
  scenario: SimulateBody.properties.scenario,
  status: PaymentSchema.properties.status,
});
export const SandboxSchema = object({
  settlementDelayMs: Type.Integer({ minimum: 0 }),
  cards: Type.Array(
    object({
      id: text(),
      title: text(),
      maskedNumber: text(),
      scenario: Type.Union([Type.Literal('success'), Type.Literal('decline')]),
    }),
  ),
});
export const SessionSchema = object({ id: Id, token: Id, cart: CartSchema });
export const SessionInfoSchema = object({ id: Id, cartId: Id });
export const IdempotencyHeaders = Type.Object({
  'idempotency-key': Type.String({
    minLength: 8,
    maxLength: 128,
    pattern: '^[A-Za-z0-9_-]+$',
    description:
      'Сохраняйте ключ при повторе запроса. Для нового заказа или попытки оплаты используйте новый UUID.',
    examples: ['7a3a8ec6-43e6-4bb6-b2fb-bb8be6e671b0'],
  }),
});

export type Session = Static<typeof SessionSchema>;
export type SessionInfo = Static<typeof SessionInfoSchema>;
export type Product = Static<typeof ProductSchema>;
export type CartItem = Static<typeof CartItemSchema>;
export type Cart = Static<typeof CartSchema>;
export type SetCartItem = Static<typeof SetCartItemBody>;
export type CheckoutOptions = Static<typeof CheckoutOptionsSchema>;
export type CreateQuote = Static<typeof QuoteBody>;
export type Delivery = Static<typeof DeliverySchema>;
export type Customer = Static<typeof CustomerSchema>;
export type Quote = Static<typeof QuoteSchema>;
export type Order = Static<typeof OrderSchema>;
export type Payment = Static<typeof PaymentSchema>;
export type Simulation = Static<typeof SimulationSchema>;
export type Scenario = Static<typeof SimulateBody>['scenario'];
export type CreateOrder = Static<typeof CreateOrderBody>;
export type ApiResult<T> = { data: T; meta: { requestId: string }; links: Static<typeof Links> };
export type ApiError = Static<typeof ErrorResponse>;
