import { InstallComponent } from "@/components/docs/install-code"
import { CodeBlock } from "@/components/ui/code-block"
import { CONSUME_CODE, CREAT_FAUCET_CODE, CREATE_ACCOUNT_CODE, FETCH_ACCOUNT_CODE, INIT_CODE, MINT_TOKENS_CODE } from "@/lib/code"

const packageManagers = [
    {
        id: "npm",
        label: "npm",
        command: "npm install @demox-labs/miden-sdk"
    },
    {
        id: "yarn",
        label: "yarn",
        command: "yarn add @demox-labs/miden-sdk"
    },
    {
        id: "pnpm",
        label: "pnpm",
        command: "pnpm add @demox-labs/miden-sdk"
    }
]

const INLINE_CODE = ({ text }: { text: string }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-primary">{text}</code>

export function QuickStart() {
    return (
        <div className="flex flex-col mx-auto">
            <p className="text-3xl font-bold">Quickstart</p>
            <div className="py-4"> The <a href="https://0xmiden.github.io/miden-docs/imported/miden-tutorials/src/web-client/about.html" className="text-primary underline underline-offset-2 cursor-pointer" target="_blank">Miden Typescript Sdk</a> is the easiest way to interact with the miden blockchain. The sdk everything from account creation, creating and consuming notes, signing and sending transactions. </div>

            <p className="text-2xl font-bold py-4" id="getting-started">Getting Started</p>
            <div className="text-muted-foreground ">Install the sdk using a package manager</div>
            <InstallComponent
                packageManagers={packageManagers}
            />

            <p className="text-xl font-bold pt-8 pb-2" id="client">Working with the sdk</p>
            <div className="text-muted-foreground text-sm italic">
                The web client uses wasm bindings with the rust client and the index db for storage of things like account headers, block headers, notes etc. in a complex way to interact with the miden blockchain. The client does not run on the main thread rather on a worker thread which offloads the computationally heavy tasks. For more detail on this you can read <a href="https://github.com/0xMiden/miden-client/blob/next/crates/web-client/js/workers/web-client-methods-worker.js" className="text-primary/75 underline underline-offset-2 cursor-pointer" target="_blank">web-client-methods-worker.js</a>
            </div>
            <div className="text-foreground pt-4">
                The web sdk abstracts away the underlying complexity, so you can get started quickly with a straightforward interface. Here is how you can begin:
            </div>
            <div className="py-4">
                <CodeBlock
                    code={INIT_CODE}
                    language="typescript"
                    filename="interact.ts"
                />
            </div>
            <div className="text-foreground pt-4">
                Few Points to keep in mind while using the client:
                <ul className="list-disc pl-6 space-y-2">
                    <li>
                        Always Import {<INLINE_CODE text="@demox-labs/miden-sdk" />} dynamically to ensure the worker and WASM are initialized properly.
                    </li>
                    <li>
                        Terminate the client when you are done with your interactions. This is important as the garbage collector will not terminate the worker thread automatically.
                    </li>
                    <li>
                        whenever {<INLINE_CODE text="client.submitTransaction" />} is called, the local prover is used, this may not be suitable for browser environments with limited resources. Consider using a remote prover like done in the examples below.
                    </li>
                </ul>
            </div>

            <p className="text-2xl font-bold pt-8 pb-2" id="accounts">Accounts</p>
            <div className="text-foreground"> Accounts on miden are a complex entity but for user facing apps they are nothing more than a simple address, like ethereum EOAs they are capable of holding assets but can also store data and execute custom code. </div>
            <p className="pt-2">The web sdk provides a simple interface to manage these accounts, creating accounts and fetching accounts:</p>
            <div className="py-4">
                <CodeBlock
                    language="typescript"
                    filename="account.ts"
                    tabs={[{
                        code: CREATE_ACCOUNT_CODE,
                        name: "create.ts",
                    }, {
                        code: FETCH_ACCOUNT_CODE,
                        name: "fetch-account.ts",
                    }]}
                />
            </div>
            <p className="text-2xl font-bold pt-4 pb-2" id="tokens">Tokens</p>
            <div className="text-foreground">
                <p>
                    Tokens or assets are digital units of value that can be transferred between accounts. On Miden, token transfers are handled through <strong>notes</strong>. Notes are pretty much similar to currencies like euros, dollars: in every transaction, you either spend dollars (sending notes) or receive dollars (receiving notes). Also, new bills/notes can be issued to you from the banks (minting). Additionally, the assets can be fungible example ETH or non-funglible like NFTs.
                </p>
                <div className="py-2">In the following sections you will see how easy it is to work with faucet, assets, creating notes, consuming notes through the sdk.</div>
            </div>

            <p className="text-xl font-bold pt-4 pb-2" id="tokens-minting">Minting Tokens</p>
            <p className="text-foreground"> The minting of tokens is handled by a special type of account called a <strong>faucet account</strong>, these faucets create notes that can be consumed by the receiver. The faucet id or the account id for the faucet account can be thought of as the token address for the asset. The code for creating faucet accounts and fetching faucet account via the sdk: </p>
            <div className="py-4">
                <CodeBlock
                    language="typescript"
                    filename="mint.ts"
                    tabs={[{
                        code: CREAT_FAUCET_CODE,
                        name: "create.ts",
                        language: "typescript"
                    }, {
                        code: MINT_TOKENS_CODE,
                        name: "mint.ts",
                        language: "typescript"
                    }]}
                />
            </div>

            <p className="text-xl font-bold pt-4 pb-2" id="consuming">Consuming Notes</p>
            <p className="text-foreground"> The consuming of public notes is pretty straightforward, but for private notes you would have to get the serialised <INLINE_CODE text="NoteFile" /> via the <INLINE_CODE text="client.exportNote(noteId)" /> method and send those bytes via some communation channel (for example our app uses webrtc) and then import them via <INLINE_CODE text="client.importNote(noteBytes)" /> the code below consumes <strong>all the notes</strong> found by client both public and private: </p>
            <div className="py-4">
                <CodeBlock
                    language="typescript"
                    filename="mint.ts"
                    code={CONSUME_CODE}
                />
            </div>

            <p className="text-xl font-bold pt-4 pb-2" id="tokens">Sending Tokens</p>

        </div>
    )
}