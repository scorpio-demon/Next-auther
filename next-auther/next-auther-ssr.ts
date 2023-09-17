const NEXT_AUTH_SECRET: string = process.env.NEXT_AUTH_SECRET as string;
const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID as string;
const GITHUB_CLIENT_ID: string = process.env.GITHUB_CLIENT_ID as string;
import TokenT from "./interface/token";
var jwt = require("jsonwebtoken");
import { ProviderListT } from "./interface/providers";
import { githubUrls, googleUrls, redirect_api_url } from "./providers/url";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

//ANCHOR - Server side
export class NextAutherSSR {
  constructor(private provider: ProviderListT) {}

  verifyToken(tokenName: string = "Authorization"): TokenT {
    let responce: TokenT = {
      is_verified: false,
    };

    const cookieStore = cookies();
    const token = cookieStore.get(tokenName);

    if (token != undefined) {
      try {
        const decodedToken = jwt.verify(token, NEXT_AUTH_SECRET);

        if (decodedToken.data.data.expire_at > Date.now()) {
          responce.data = decodedToken;
          responce.is_verified = true;
        }
      } catch (err) {
        console.log(err);
      }
    }
    return responce;
  }

  makeToken(name: string, data: any, options?: any, algorithm?: string) {
    const token = jwt.sign(
      {
        data: data,
        algorithm: algorithm,
      },
      NEXT_AUTH_SECRET
    );

    return cookies().set(name, token, options);
  }

  redirectToProvider(scope: string = "NOT_ENTERED") {
    let url: string = "";
    let newScope = scope;

    // google
    if (this.provider == "google") {
      if (scope == "NOT_ENTERED") newScope = googleUrls.scope;
      const googleParams = new URLSearchParams({
        redirect_uri: redirect_api_url,
        client_id: GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: newScope,
      });
      url = `${googleUrls.mainUrl}${googleParams.toString()}`;
    }

    // github
    if (this.provider == "github") {
      if (scope == "NOT_ENTERED") newScope = githubUrls.scope;
      const githubParams = new URLSearchParams({
        redirect_uri: redirect_api_url,
        client_id: GITHUB_CLIENT_ID,
        scope: newScope,
      });
      url = `${githubUrls.mainUrl}${githubParams.toString()}`;
    }

    if (this.provider != undefined) {
      this.makeToken("provider", this.provider);
    }

    return redirect(url);
  }

  deleteToken(tokenName: string) {
    cookies().delete(tokenName);
  }
}



