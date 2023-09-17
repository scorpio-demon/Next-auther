import { redirectToProvider } from "../next-auther"

export default function Home() {
  return (
    <div>
      {redirectToProvider("google")}
    </div>
  )
}
