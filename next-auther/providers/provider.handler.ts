import { googleUrls, githubUrls } from "./url";
import { redirect } from "next/navigation";
import GoogleProvider from "./google";
import { NextApiRequest } from "next";
import GithubProvider from "./github";

export function nextAuthProviderHandler(req: NextApiRequest) {
  if (req.url?.search(googleUrls.originPath as string)) {
    const google = new GoogleProvider(req);
    return google.tokenMaker();
  }
  if (req.url?.search(githubUrls.originPath as string)) {
    const github = new GithubProvider(req);
    return github.tokenMaker();
  } else redirect("/404");
}
