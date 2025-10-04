import { Link } from "./common";

export function UseCase() {
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-4 mx-auto max-w-none lg:max-w-4xl">
      <p
        className="text-xl sm:text-2xl md:text-3xl font-bold text-wrap hyphens-auto"
        id="use-case"
      >
        Use Case
      </p>
      <div className="py-4 text-sm sm:text-base text-wrap leading-relaxed hyphens-auto">
        In the quickstart, you learned how to mint, send, and receive tokens.
        While these may seem like basic operations, combining them with{" "}
        <Link href="/docs#concepts-unauth" text="Unauthenticated Notes" />{" "}
        enables sub-block time payment settlement. As the protocol becomes
        faster, this will allow for near-instant payment settlements, resulting
        in smoother user experiences in scenarios such as:
      </div>
      <ul className="list-disc pl-4 sm:pl-6 space-y-3 mt-2 text-sm sm:text-base">
        <li className="text-wrap leading-relaxed hyphens-auto">
          <Link
            href="https://en.wikipedia.org/wiki/Microtransaction"
            text="Microtransactions"
          />{" "}
          or{" "}
          <Link
            href="https://en.wikipedia.org/wiki/Micropayment"
            text="micropayments"
          />{" "}
          which are useful for in-game purchases, pay for content like TV show
          episodes, and other scenarios where small payments are frequent like
          tipping.
        </li>
        <li className="text-wrap leading-relaxed hyphens-auto">
          Enable{" "}
          <Link href="https://docs.cdp.coinbase.com/x402/welcome" text="x402" />{" "}
          in a verifiable privacy-preserving way or pay-per-API call usage which
          is pretty useful in things like AI credits etc.
        </li>
        <li className="text-wrap leading-relaxed hyphens-auto">
          This one goes without saying but{" "}
          <strong>
            instant global privacy-preserving verifiable cheap payments
          </strong>{" "}
          can be made possible.
        </li>
      </ul>
    </div>
  );
}
