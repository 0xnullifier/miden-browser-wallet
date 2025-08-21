import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-8 py-4">
        {/* Left border accent */}
        <div className="border-primary text-center">
          <h1 className="text-2xl font-mono underline underline-offset-4 decoration-primary"> The Wallet That Welcomes You To Miden </h1>
        </div>

        <div className="space-y-8 pt-8">
          <p className="">
            The Web Wallet is the easiest way to get started with the <a className="text-primary underline underline-offset-2" href="https://miden.xyz/" target="_blank">Miden Blockchain</a>. It is a simple and
            a user-friendly wallet interface that allows you to interact with the Miden network. Recieve funds from a faucet, send payments to your friends and much more ... <Link href={"/wallet"} className="text-primary underline underline-offset-2">start now</Link>
          </p>
        </div>

        {/* <div>
          <h2 className="text-xl font-mono underline underline-offset-4 decoration-primary py-8">Keywords Explained</h2>
          <p>When you will use the app you will come across words like <b>address</b>, <b >notes</b>, <b>faucet</b> etc. This sections gives a brief about such keywords</p>
        </div> */}
      </div>
    </div>
  )
}

