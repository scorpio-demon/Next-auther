const NEXT_PUBLIC_GOOGLE_CLIENT_ID: string = process.env.NEXT_PUBLIC_NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
const NEXT_PUBLIC_GITHUB_CLIENT_ID: string = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string;
import TokenT from "./interface/token";
var jwt = require("jsonwebtoken");
import { ProviderListT } from "./interface/providers";
import { githubUrls, googleUrls, redirect_api_url } from "./providers/url";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";


export function NextAutherClient(tokenName: string = "Authorization"): TokenT {
  let responce: TokenT = {
    is_verified: false,
  };

  const cookieStore = cookies();
  const token = cookieStore.get(tokenName);
  if (token != undefined) {
    responce.data = jwt.decode(token);
  }
  return responce;
}

export function redirectToProvider(provider:ProviderListT,scope: string = "NOT_ENTERED") {
  let url: string = "";
  let newScope = scope;

  // google
  if (provider == "google") {
    if (scope == "NOT_ENTERED") newScope = googleUrls.scope;
    const googleParams = new URLSearchParams({
      redirect_uri: redirect_api_url,
      client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: newScope,
    });
    url = `${googleUrls.mainUrl}${googleParams.toString()}`;
  }

  // github
  if (provider == "github") {
    if (scope == "NOT_ENTERED") newScope = githubUrls.scope;
    const githubParams = new URLSearchParams({
      redirect_uri: redirect_api_url,
      client_id: NEXT_PUBLIC_GITHUB_CLIENT_ID,
      scope: newScope,
    });
    url = `${githubUrls.mainUrl}${githubParams.toString()}`;
  }

  if (provider != undefined) {
    console.log("Provider not defined")
  }

  return redirect(url);
}