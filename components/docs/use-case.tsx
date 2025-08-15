import { Link } from "./common";


export function UseCase() {
    return (
        <div className="flex flex-col w-full md:max-w-4xl mx-auto pb-4">
            <p className="text-2xl md:text-3xl font-bold break-words" id="use-case">Use Case</p>
            <div className="py-4 text-sm md:text-base break-words">
                In the quickstart, you learned how to mint, send, and receive tokens. While these may seem like basic operations, combining them with <Link href="/docs#concepts-unauth" text="Unauthenticated Notes" /> enables sub-block time payment settlement. As the protocol becomes faster, this will allow for near-instant payment settlements, resulting in smoother user experiences in scenarios such as:
            </div>
            <ul className="list-disc pl-4 md:pl-6 space-y-2 mt-2 text-sm">
                <li className="text-sm md:text-base break-words ">
                    <Link href="https://en.wikipedia.org/wiki/Microtransaction" text="Microtransactions" /> or <Link href="https://en.wikipedia.org/wiki/Micropayment" text="micropayments" /> which are useful for in-game purchases, pay for content like TV show episodes, and other scenarios where small payments are frequent like tipping.
                </li>
                <li className="text-sm md:text-base break-words ">
                    Enable <Link href="https://docs.cdp.coinbase.com/x402/welcome" text="x402" /> in a verifiable privacy-preserving way or pay-per-API call usage which is pretty useful in things like AI credits etc.
                </li>
                <li className="text-sm md:text-base break-words ">
                    This one goes without saying but <strong>instant global privacy-preserving verifiable cheap payments</strong> can be made possible.
                </li>
            </ul>
        </div>
    )
}