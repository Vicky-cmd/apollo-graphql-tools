export type Maybe<T> = T | null

export type Scalars = {
   ID: string
   String: string
   Boolean: boolean
   Int: number
   Float: number
}

export enum ProtectionType {
   Secure = 'secure',
   Encrypt = 'encrypt',
   Redact = 'redact',
}

export type ProtectedDirectiveArgs = {
   fields?: Maybe<Array<Maybe<Scalars['String']>>>
   type?: Maybe<ProtectionType>
}
