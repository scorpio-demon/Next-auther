export interface ProviderURLT {
  mainUrl:string
  scope: string
  tokenUrl?: string;
  AcessAPI?: string;
  AcessAPIEmail?: string;
  AccessTokenURL: string;
  originPath?:string
}

export interface ProvidersT {
  jwt?: string;
  google?: ProviderURLT;
  github?: ProviderURLT;
  twitter?: ProviderURLT;
}

export type ProviderListT = 'google' | 'github' | 'jwt' ;
