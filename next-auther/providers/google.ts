const GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET: string = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_BACK: string = process.env.REDIRECT_BACK as string;

import {NextAutherSSR} from "../next-auther-ssr";
import { googleUrls, redirect_api_url } from "./url";
import {
  GetTokenRequestInputT,
  GetTokenRequestReturn,
} from "../interface/getTokenRequest";
import { UserT } from "../interface/user";
import { redirect } from "next/navigation";
import { NextApiRequest } from "next";

export default class GoogleProvider {
  constructor(private req: NextApiRequest){}
  private nestAuther = new NextAutherSSR("google");

  private async getTokenRequest({
    code,
    clientId,
    clientSecret,
  }: GetTokenRequestInputT): Promise<GetTokenRequestReturn> {
    try {
      const searchParams = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirect_api_url,
        grant_type: "authorization_code",
      });

      const res = await fetch(googleUrls.tokenUrl as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: searchParams.toString(),
      });
      return res.json();
    } catch (error: any) {
      console.error("Failed to fetch auth tokens");
      throw new Error(error.message);
    }
  }

  async tokenMaker() {
    const code: string = this.req.query.code as string;

    const { id_token, access_token } = await this.getTokenRequest({
      code,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    });

    // Fetch the user's profile with the access token and bearer
    let googleUser: UserT = {
      id: "",
      name: "",
      image: "",
      email: "",
      expire_at: 0,
    };
    await fetch(googleUrls.AccessTokenURL + access_token, {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    })
      .then(async (res) => {
        const user = await res.json();

        googleUser = {
          id: user.id as string,
          name: user.name as string,
          image: user.picture as string,
          email: user.email,
          expire_at: Date.now() + 15 * 24 * 60 * 60 * 1000, // One month
        };
      })
      .catch((error) => {
        console.error("Failed to fetch access api");
        throw new Error(error.message);
      });

    // save token in cookie
    this.nestAuther.makeToken("Authorization", googleUser);
    this.nestAuther.deleteToken("provider");
    //   Redirect user
    return redirect(REDIRECT_BACK);
  }
}
