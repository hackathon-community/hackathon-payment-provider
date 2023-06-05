// from https://www.npmjs.com/package/@vtex/payment-provider
import type { IncomingHttpHeaders } from 'http2'
import type { ParsedUrlQuery } from 'querystring'

function contains<T>(value: T, list: T[]) {
  return list.indexOf(value) !== -1
}

function Enum(...args: string[]) {
  return args.reduce((acc, cur) => {
    acc[cur] = cur
    return acc
  }, Object.create(null))
}


export type Maybe<T> = T | undefined
export const RecipientRole = Enum('marketplace', 'seller')
export type RecipientRole = typeof RecipientRole

export const DocumentType = Enum('CNPJ', 'CPF', 'SSN')
export type DocumentType = typeof DocumentType

export interface AuthenticationHeaders extends IncomingHttpHeaders {
  'x-provider-api-appkey': string
  'x-provider-api-apptoken': string
}

export interface Recipient {
  id: string
  name: string
  documentType: DocumentType
  document: string
  role: RecipientRole
  chargeProcessingFee: boolean
  chargebackLiable: boolean
  amount: number
}

export interface Card {
  number: string
  holder: string
  expiration: Expiration
  csc: string
  document: unknown
}

export interface TokenizedCard {
  holderToken: string
  bin: string
  numberToken: string
  numberLength: number
  cscToken: string
  expiration: Expiration
}

export interface Expiration {
  month: string
  year: string
}

export interface MiniCart {
  buyer: Buyer
  shippingAddress: Maybe<Address>
  billingAddress: Maybe<Address>
  items: Maybe<Item[]>
  shippingValue: Maybe<number>
  taxValue: Maybe<number>
}

export interface Buyer {
  id: Maybe<string>
  firstName: string
  lastName: string
  document: string
  documentType: Maybe<string>
  corporateName: Maybe<string>
  tradeName: Maybe<string>
  corporateDocument: Maybe<string>
  isCorporate: Maybe<boolean>
  email: Maybe<string>
  phone: Maybe<string>
  createdDate: Maybe<Date>
}

export interface Address {
  country: Maybe<string>
  street: Maybe<string>
  number: Maybe<string>
  complement: Maybe<string>
  neighborhood: Maybe<string>
  postalCode: Maybe<string>
  city: Maybe<string>
  state: Maybe<string>
}

export interface Item {
  id: Maybe<string>
  name: Maybe<string>
  price: Maybe<number>
  quantity: Maybe<number>
  discount: Maybe<number>
  deliveryType: Maybe<string>
  sellerId: Maybe<string>
  categoryId: Maybe<string>
}

export interface SecureProxyTokensResponse{
  tokens: SecureProxyTokens[]
}

interface SecureProxyTokens{
  name: String
  placeholder: String
}

export interface AppData {
  appName: Maybe<string>
  payload: Maybe<string>
}

export interface PaymentIdParam extends ParsedUrlQuery {
  paymentId: string
}

export const DebitCard = Enum('Visa Electron', 'Maestro', 'Mastercard Debit')
export type DebitCard = typeof DebitCard

export const CreditCard = Enum(
  'Visa',
  'Mastercard',
  'American Express',
  'Discover',
  'JCB',
  'Diners',
  'Elo',
  'Hipercard',
  'Aura',
  'Benricompras',
  'Credz',
  'Cabal',
  'Cartes Bancaires (CB)'
)
export type CreditCard = typeof CreditCard

export const DirectSale = Enum('Venda Direta Credito', 'Venda Direta Debito')
export type DirectSale = typeof DirectSale

export const AdhocCard = Enum('Cobranded', 'Privatelabels')
export type AdhocCard = typeof AdhocCard

export const BankInvoice = Enum('BankInvoice')
export type BankInvoice = typeof BankInvoice

export const Generic = Enum('Promissories', 'Cash')
export type Generic = typeof Generic

export const Voucher = Enum('SPEI', 'Safetypay')
export type Voucher = typeof Voucher

export const Cryptocurrency = Enum('Bitcoin')
export type Cryptocurrency = typeof Cryptocurrency

export type PaymentMethod =
  | CreditCard
  | DebitCard
  | AdhocCard
  | Generic
  | BankInvoice
  | Voucher
  | Cryptocurrency
  | DirectSale

export interface AvailablePaymentsResponse {
  paymentMethods: PaymentMethod[]
}

export type AllowSplitOptions = 'onAuthorize' | 'onCapture' | 'disabled'
export interface PaymentMethodInfo {
  name: PaymentMethod
  allowsSplit: AllowSplitOptions
}

export type CustomFieldTypeOptions = 'text' | 'select'
export type SelectTypeOptions = 'type' | 'value'
export interface CustomSelectFields {
  text: string
  value: string
}
export interface CustomFieldOptions {
  name: string
  type: CustomFieldTypeOptions
  options?: CustomSelectFields[]
}

export interface ProviderManifestResponse {
  paymentMethods: PaymentMethodInfo[]
  customFields?: CustomFieldOptions[]
}

export interface CancellationRequest extends PaymentRequest {
  authorizationId: string
  tid: Maybe<string>
}

export interface CancellationResponse extends PaymentResponse {
  cancellationId: Maybe<string> | null
  code: Maybe<string> | null | 'cancel-manually'
  message: Maybe<string> | null
}

export interface CustomField {
  name: string
  value: string
}

export interface PaymentRequest {
  transactionId: string
  paymentId: string
  requestId: string
  merchantSettings: Maybe<CustomField[]>
}

export interface Authorization extends PaymentRequest {
  reference: string
  orderId: string
  paymentMethod: PaymentMethod
  paymentMethodCustomCode: Maybe<string>
  merchantName: string
  value: number
  currency: string
  installments: Maybe<number>
  installmentsInterestRate: Maybe<number>
  installmentsValue: Maybe<number>
  deviceFingerprint: Maybe<string>
  ipAddress: Maybe<string>
  miniCart: MiniCart
  url: Maybe<string>
  callbackUrl: string
  inboundRequestsUrl: string
  returnUrl: Maybe<string>
  recipients: Maybe<Recipient[]>
}

export interface CardAuthorization extends Authorization {
  secureProxyTokensUrl: Maybe<string>
  secureProxyUrl: Maybe<string>
  card: Card | TokenizedCard
  paymentMethod: CreditCard | DebitCard | AdhocCard
}

export interface CreditCardAuthorization extends CardAuthorization {
  paymentMethod: CreditCard
}
export interface DebitCardAuthorization extends CardAuthorization {
  paymentMethod: DebitCard
}
export interface AdhocCardAuthorization extends CardAuthorization {
  paymentMethod: AdhocCard
}

export interface DirectSaleAuthorization extends Authorization {
  paymentMethod: DirectSale
}

export interface BankInvoiceAuthorization extends Authorization {
  paymentMethod: BankInvoice
}

export type AuthorizationRequest =
  | CreditCardAuthorization
  | DebitCardAuthorization
  | AdhocCardAuthorization
  | BankInvoiceAuthorization
  | DirectSaleAuthorization
  | Authorization

export const isCardAuthorization = (
  authorization: AuthorizationRequest
): authorization is CardAuthorization =>
  typeof (authorization as CardAuthorization).card !== 'undefined'

export const isCreditCardAuthorization = (
  authorization: AuthorizationRequest
): authorization is CreditCardAuthorization =>
  contains(authorization.paymentMethod, Object.values(CreditCard))

export const isDebitCardAuthorization = (
  authorization: AuthorizationRequest
): authorization is DebitCardAuthorization =>
  contains(authorization.paymentMethod, Object.values(DebitCard))

export const isBankInvoiceAuthorization = (
  authorization: AuthorizationRequest
): authorization is BankInvoiceAuthorization =>
  authorization.paymentMethod === 'BankInvoice'

export const isDirectSaleAuthorization = (
  authorization: AuthorizationRequest
): authorization is DirectSaleAuthorization =>
  contains(authorization.paymentMethod, Object.values(DirectSale))

export const isTokenizedCard = (
  card: Card | TokenizedCard
): card is TokenizedCard =>
  typeof (card as TokenizedCard).numberToken !== 'undefined'

export type AuthorizationStatus = 'approved' | 'denied' | 'undefined'

export interface PaymentResponse {
  paymentId: string
  code: Maybe<string> | null
  message: Maybe<string> | null
}

export interface AuthorizationBase extends PaymentResponse {
  status: AuthorizationStatus
  tid: Maybe<string> | null
  acquirer: Maybe<string> | null
  authorizationId?: Maybe<string> | null
  delayToCancel?: Maybe<number> | null
  delayToAutoSettle?: Maybe<number> | null
  delayToAutoSettleAfterAntifraud?: Maybe<number> | null
}

export interface ApprovedAuthorization extends AuthorizationBase {
  tid: string
  authorizationId: string
  nsu?: Maybe<string>
}

export interface CreditCardAuthorized extends ApprovedAuthorization {
  delayToAutoSettle: Maybe<number>
  delayToAutoSettleAfterAntifraud: Maybe<number>
}

export interface BankInvoiceResponse extends PaymentResponse {
  paymentUrl: string
  identificationNumber: Maybe<string>
  identificationNumberFormatted: Maybe<string>
  barCodeImageType: Maybe<string>
  barCodeImageNumber: Maybe<string>
  delayToCancel: Maybe<number>
}

export type BankInvoiceAuthorized = BankInvoiceResponse & ApprovedAuthorization

export type BankInvoicePending = PendingAuthorization & BankInvoiceResponse

export interface FailedAuthorization extends AuthorizationBase {
  status: 'denied'
}

export interface PendingAuthorization extends AuthorizationBase {
  status: 'undefined'
  delayToCancel: number
  authorizationId: Maybe<string> | null
  paymentAppData: Maybe<AppData> | null
  paymentUrl: Maybe<string> | null
}

export type AuthorizationResponse =
  | ApprovedAuthorization
  | CreditCardAuthorized
  | BankInvoiceAuthorized
  | FailedAuthorization
  | PendingAuthorization
  | RedirectResponse

export interface SettlementRequest extends PaymentRequest {
  value: number
  authorizationId: string
  tid: Maybe<string>
  recipients: Maybe<Recipient[]>
}

export interface SettlementResponse extends PaymentResponse {
  settleId: Maybe<string> | null
  value: number
  requestId: string
}

export interface RefundRequest extends PaymentRequest {
  value: number
  settleId: string
  tid: Maybe<string>
  recipients: Maybe<Recipient[]>
}

export interface RefundResponse extends PaymentResponse {
  requestId: string
  refundId: Maybe<string> | null
  value: number
  code: Maybe<string> | null | 'refund-manually'
}

export interface InboundRequest extends PaymentRequest {
  authorizationId: string
  tid: string
  requestData: { body: string }
}

export interface InboundResponse extends PaymentResponse {
  responseData: {
    statusCode: number
    contentType: string
    content: string
  }
  requestId: string
}

export interface RedirectResponse extends PendingAuthorization {
  redirectUrl: Maybe<string> | null
}
