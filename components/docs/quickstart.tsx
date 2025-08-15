import { InstallComponent } from "@/components/docs/install-code"
import { CodeBlock } from "@/components/ui/code-block"
import { CONSUME_CODE, CREAT_FAUCET_CODE, CREATE_ACCOUNT_CODE, FETCH_ACCOUNT_CODE, INIT_CODE, MINT_TOKENS_CODE, SEND_CODE } from "@/lib/code"

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
        <div className="flex flex-col w-full md:max-w-4xl mx-auto">
            <p className="text-2xl md:text-3xl font-bold break-words">Quickstart</p>
            <div className="py-4 text-sm md:text-base break-words leading-relaxed"> The <a href="https://0xmiden.github.io/miden-docs/imported/miden-tutorials/src/web-client/about.html" className="text-primary underline underline-offset-2 cursor-pointer break-words" target="_blank">Miden Typescript SDK</a> is the easiest way to interact with the Miden blockchain. The SDK handles everything from account creation, creating and consuming notes, signing and sending transactions. The quickstart covers client interactions such as creating accounts, creating tokens, sending tokens and consuming notes.</div>

            <p className="text-xl md:text-2xl font-bold py-4 break-words" id="getting-started">Getting Started</p>
            <div className="text-muted-foreground text-sm break-words">Install the sdk via a package manager</div>
            <InstallComponent
                packageManagers={packageManagers}
            />

            <p className="text-lg md:text-xl font-bold pt-8 pb-2 break-words" id="client">Working with the SDK</p>
            <div className="text-muted-foreground text-xs md:text-sm italic break-words leading-relaxed">
                The web client uses WASM bindings with the Rust client and the IndexedDB for storage of things like account headers, block headers, notes etc. in a complex way to interact with the Miden blockchain. The client does not run on the main thread but rather on a worker thread which offloads the computationally heavy tasks. For more detail on this you can read <a href="https://github.com/0xMiden/miden-client/blob/next/crates/web-client/js/workers/web-client-methods-worker.js" className="text-primary/75 underline underline-offset-2 cursor-pointer break-words" target="_blank">web-client-methods-worker.js</a>
            </div>
            <div className="text-foreground pt-4 text-sm md:text-base break-words leading-relaxed">
                The web SDK abstracts away the underlying complexity, so you can get started quickly with a straightforward interface. Here is how you can begin:
            </div>
            <div className="py-4">
                <CodeBlock
                    code={INIT_CODE}
                    language="typescript"
                    filename="interact.ts"
                />
            </div>
            <div className="text-foreground pt-4 text-sm md:text-base break-words leading-relaxed">
                A few points to keep in mind while using the client:
                <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2">
                    <li className="text-sm md:text-base break-words leading-relaxed">
                        Always import {<INLINE_CODE text="@demox-labs/miden-sdk" />} dynamically to ensure the worker and WASM are initialized properly.
                    </li>
                    <li className="text-sm md:text-base break-words leading-relaxed">
                        Terminate the client when you are done with your interactions. This is important as the garbage collector will not terminate the worker thread automatically.
                    </li>
                    <li className="text-sm md:text-base break-words leading-relaxed">
                        Whenever {<INLINE_CODE text="client.submitTransaction" />} is called, the local prover is used. This may not be suitable for browser environments with limited resources. Consider using a remote prover like done in the examples below.
                    </li>
                </ul>
            </div>

            <p className="text-xl md:text-2xl font-bold pt-8 pb-2 break-words" id="accounts">Accounts</p>
            <div className="text-foreground text-sm md:text-base break-words leading-relaxed"> Accounts on Miden are a complex entity but for user-facing apps they are nothing more than a simple address. Like Ethereum EOAs, they are capable of holding assets but can also store data and execute custom code. </div>
            <p className="pt-2 text-sm md:text-base break-words leading-relaxed">The web SDK provides a simple interface to manage these accounts, creating accounts and fetching accounts:</p>
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
            <p className="text-xl md:text-2xl font-bold pt-4 pb-2 break-words" id="tokens">Tokens</p>
            <div className="text-foreground text-sm md:text-base break-words leading-relaxed">
                <p>
                    Tokens or assets are digital units of value that can be transferred between accounts. On Miden, token transfers are handled through <strong>notes</strong>. Notes are pretty much similar to currencies like euros, dollars: in every transaction, you either spend dollars (sending notes) or receive dollars (receiving notes). Also, new bills/notes can be issued to you from the banks (minting). Additionally, the assets can be fungible, for example ERC20 tokens, or non-fungible like NFTs.
                </p>
                <div className="py-2">In the following sections you will see how easy it is to work with faucets, assets, creating notes, and consuming notes through the SDK.</div>
            </div>

            <p className="text-lg md:text-xl font-bold pt-4 pb-2 break-words" id="tokens-minting">Minting Tokens</p>
            <p className="text-foreground text-sm md:text-base break-words leading-relaxed"> The minting of tokens is handled by a special type of account called a <strong>faucet account</strong>. These faucets create notes that can be consumed by the receiver. The faucet ID or the account ID for the faucet account can be thought of as the token address for the asset. The code for creating faucet accounts and fetching faucet accounts via the SDK: </p>
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

            <p className="text-lg md:text-xl font-bold pt-4 pb-2 break-words" id="consuming">Consuming Notes</p>
            <p className="text-foreground text-sm md:text-base break-words leading-relaxed"> The consuming of public notes is pretty straightforward, but for private notes you would have to get the serialized {<INLINE_CODE text="NoteFile" />} via the {<INLINE_CODE text="client.exportNote(noteId)" />} method and send those bytes via some communication channel (for example our app uses WebRTC) and then import them via {<INLINE_CODE text="client.importNote(noteBytes)" />}. The code below consumes <strong>all the notes</strong> found by the client, both public and private: </p>
            <div className="py-4">
                <CodeBlock
                    language="typescript"
                    filename="consume.ts"
                    code={CONSUME_CODE}
                />
            </div>

            <p className="text-lg md:text-xl font-bold pt-4 pb-2 break-words" id="send">Sending Tokens</p>
            <p className="text-foreground text-sm md:text-base break-words leading-relaxed"> Sending tokens is pretty simple in the SDK: </p>
            <div className="py-4">
                <CodeBlock
                    language="typescript"
                    filename="send.ts"
                    code={SEND_CODE}
                />
            </div>
            <div className="py-8 text-foreground">
                <p className="font-semibold text-xl md:text-2xl pb-2 break-words">You're all set!</p>
                <p className="text-sm md:text-base break-words leading-relaxed">
                    With these examples, you should be able to get started building powerful applications on Miden using the TypeScript SDK. For more advanced topics and detailed documentation, check out the <a href="https://0xmiden.github.io/miden-docs/" className="text-primary underline underline-offset-2 break-words" target="_blank">Miden book</a>. The section below covers some of the primitives used in this browser wallet.
                </p>
            </div>
        </div>
    )
}