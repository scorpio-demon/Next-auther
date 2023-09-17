const NEXT_PUBLIC_GITHUB_CLIENT_ID: string = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string;
const NEXT_PUBLIC_GITHUB_CLIENT_SECRET: string = process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET as string;
const REDIRECT_BACK: string = process.env.REDIRECT_BACK as string;

import {NextAutherSSR} from "../next-auther-ssr";
import { githubUrls, redirect_api_url } from "./url";
import { UserT } from "../interface/user";
import {
  GetTokenRequestInputT,
  GetTokenRequestReturn,
} from "../interface/getTokenRequest";
import { redirect } from "next/navigation";
import { NextApiRequest } from "next";

export default class GithubProvider {
    constructor(private req: NextApiRequest){}
  private nestAuther = new NextAutherSSR("github");

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
      });

      const res = await fetch(
        githubUrls.AccessTokenURL + searchParams.toString(),
        { method: "POST", headers: { Accept: "application/json" } }
      );
      const toReturn = await res.json();
      return toReturn;
    } catch (error: any) {
      console.error("Failed to fetch auth tokens");
      throw new Error(error.message);
    }
  }

  async tokenMaker() {
    const code: string = this.req.query.nextUrl as string;

    const { access_token } = await this.getTokenRequest({
      code,
      clientId: NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
    });

    // Fetch the user's profile with the access token and bearer
    let githubUser: UserT = {
      id: "",
      name: "",
      image: "",
      email: "",
      expire_at: 0,
    };
    await fetch(githubUrls.AcessAPI, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      .then(async (res) => {
        const user = await res.json();
        githubUser = {
          id: user.id as string,
          name: user.name as string,
          image: user.avatar_url as string,
          email: user.email,
          expire_at: Date.now() + 15 * 24 * 60 * 60 * 1000, // One month
        };
      })
      .catch((error) => {
        console.error("Failed to fetch access api");
        throw new Error(error.message);
      });

    if (githubUser.email == undefined) {
      // get user primary email address
      await fetch(githubUrls.AcessAPIEmail, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
        .then(async (res) => {
          const primaryEmails = await res.json();
          const userEmailObj = primaryEmails.find(
            (email: { primary: boolean }) => email.primary
          );

          githubUser.email = userEmailObj.email;
        })
        .catch((error) => {
          console.error("Failed to fetch access api");
          throw new Error(error.message);
        });
    }
    // save token in cookie
    this.nestAuther.makeToken("Authorization", githubUser);
    this.nestAuther.deleteToken("provider");
    //   Redirect user
    redirect(REDIRECT_BACK);
  }
}
