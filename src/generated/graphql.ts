export type Maybe<T> = T | null

export type Scalars = {
   ID: string
   String: string
   Boolean: boolean
   Int: number
   Float: number
}

export enum ProtectionType {
   Protect = 'PROTECT',
   Restrict = 'RESTRICT',
}

export type ProtectedDirectiveArgs = {
   fields?: Maybe<Array<Maybe<Scalars['String']>>>
   type?: Maybe<ProtectionType>
}
