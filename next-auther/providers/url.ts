import {ProviderURLT} from '../interface/providers'
const PROVIDER_REDIRECT_URL = process.env.PROVIDER_REDIRECT_URL as string;
let mainUrl = PROVIDER_REDIRECT_URL;
if (!PROVIDER_REDIRECT_URL.endsWith('/')) mainUrl = mainUrl + '/';
export const redirect_api_url: string = `${PROVIDER_REDIRECT_URL}api/nest-auth`;

export const googleUrls:ProviderURLT = {
  mainUrl: 'https://accounts.google.com/o/oauth2/v2/auth?',
  scope:
    'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  AccessTokenURL:
    'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=',
    originPath:"googleapis.com"
};

export const githubUrls = {
  mainUrl: 'https://github.com/login/oauth/authorize?',
  scope: 'read:user user:email',
  AcessAPI: 'https://api.github.com/user',
  AcessAPIEmail: 'https://api.github.com/user/emails',
  AccessTokenURL: 'https://github.com/login/oauth/access_token?',
  originPath:"github.com"
};

