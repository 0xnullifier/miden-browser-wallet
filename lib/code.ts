export const INIT_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC

async function fnThatUsesClient(){
    // dynamic import the sdk as this runs the wasm worker
    const { WebClient } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);

    // now you can interact with the client
    // for example finding the latest block number you can do
    const syncSummary = await client.syncState();
    console.log(syncSummary.blockNum())

    // terminate the client when done
    client.terminate();
}`


export const CREATE_ACCOUNT_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC

async function createAccount() {
    // imports and init the client
    const { 
        WebClient, 
        AccountStorageMode 
    } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);

    // create a new private account
    const newAccount = await client.newWallet(
        AccountStorageMode.private(), 
        true // account is mutable i.e it can change its state 
    )

    console.log("New account created with address:", newAccount.id().toBech32());

    // you can store the account in local storage to fetch it 
    // later when we need to retreive the account for things like balances etc.
    localStorage.setItem("account_id", newAccount.id().toBech32());

    // terminate the client when done
    client.terminate();
}`;

export const FETCH_ACCOUNT_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC

async function fetchAccount() {
    // imports and init the client
    const { WebClient, AccountId } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);

    // fetch the account from local storage or index db
    const account = await client.getAccount(
        AccountId.fromBech32(localStorage.getItem("account_id")!)
    );

    // now you can interact with the account

    // for example, log the account address
    console.log(account.id().toBech32());

    // log all the assets in the accounts with their addresses and balances
    account.vault().fungibleAssets().forEach(
        (asset) => console.log(asset.faucetId(), asset.amount())
    );

    // terminate the client when done
    client.terminate();
}`

export const CREAT_FAUCET_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC

async function createFaucet() {
    // imports and init the client
    const { 
        WebClient, 
        AccountStorageMode 
    } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);

    // create a new asset and the faucet account
    const fungibleFaucetAccount = await client.newFaucet(
        AccountStorageMode.public(), // public faucet
        false, // immutable
        "MID", // token symbol
        8, // decimals
        BigInt(1_000_000), // max supply
    );
    const fungibleFaucetId = fungibleFaucetAccount.id().toBech32();
    console.log("Fungible faucet created with address:", fungibleFaucetId);

    await client.syncState(); // sync the state
    // you can store the faucet account in local storage 
    // to fetch it later when we need to retreive the faucet id
    localStorage.setItem("faucet_id", fungibleFaucetAccount.id().toBech32());
    
    // terminate the client when done
    client.terminate();
}`

export const MINT_TOKENS_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC
export const TX_PROVER_ENDPOINT = 'https://tx-prover.testnet.miden.io';

// @param mintTo - the address to mint the tokens to 
async function mintTokens(mintTo: string) {
    // imports and init the client
    const { 
        WebClient, 
        AccountId,
        TransactionProver
    } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);
    // create a new remote prover this reduces the load on the client
    // as the proving operation for a transaction is heavy 
    const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);

    // fetch the faucet account 
    const faucetId = AccountId.fromBech32(localStorage.getItem("faucet_id")!)
    await client.syncState();

    // now you can mint tokens to the address
    const mintTxRequest = client.newMintTransactionRequest(
        AccountId.fromBech32(mintTo), // the address to mint the tokens to
        faucetId, // the faucet account id
        NoteType.Public,
        BigInt(1000),
    );

    const txResult = await client.newTransaction(faucet.id(), mintTxRequest);
    await client.submitTransaction(txResult, prover);
    const txId = txResult.executedTransaction().id().toHex()
    console.log("Mint transaction submitted with id:", txId);

    // terminate the client when done
    client.terminate();
}`


export const SETUP = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC

async function setup() {
    // imports and init the client
    const { WebClient, AccountStorageMode } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);

    // create a new account
    const sender = await client.newWallet(AccountStorageMode.private(), true);

    // create a receiver account
    const receiver = await client.newWallet(AccountStorageMode.public(), true);

    // create a fungible asset and faucet
    const fungibleFaucetAccount = await client.newFaucet(
        AccountStorageMode.public(),
        false,
        "MID",
        8,
        BigInt(1_000_000),
    );

    // mint some tokens

    console.log("Sender Account created with address:", sender.id().toBech32());
    console.log("Receiver Account created with address:", receiver.id().toBech32());
    console.log("Fungible faucet created with address:", fungibleFaucetAccount.id().toBech32());

    return { client, sender, receiver, fungibleFaucetAccount };
} `;


export const CONSUME_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC
export const TX_PROVER_ENDPOINT = 'https://tx-prover.testnet.miden.io';

async function consumeTokens() {
    // run setup to get the client, sender, receiver and fungibleFaucetAccount
    const {
        WebClient,
        AccountId,
        TransactionProver,
    } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);
    const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);

    // fetch the account from local storage
    const accountId = AccountId.fromBech32(localStorage.getItem("account_id")!);
    const consumableNotes = await client.getConsumableNotes();

    // if no consumable notes are found, return
    if (consumableNotes.length === 0) {
        console.log("No pending balance to consume");
        return;
    }

    // get all the noteIds and create a consume transaction request
    const noteIds = consumableNotes.map(
        (note: any) => note.inputNoteRecord().id().toString()
    );
    const consumeTxRequest = client.newConsumeTransactionRequest(noteIds)

    const txResult = await client.newTransaction(accountId, consumeTxRequest)
    const txId = txResult.executedTransaction().id().toHex()
    await client.submitTransaction(txResult, prover)

    console.log("Consumed notes successfully with transaction id:", txId);
    
    // terminate the client when done
    client.terminate();
}`;

export const SEND_CODE = `const RPC_ENDPOINT = "https://rpc.testnet.miden.io:443"; // testnet RPC
export const TX_PROVER_ENDPOINT = 'https://tx-prover.testnet.miden.io';

async function sendTokens(
    to: string,
    amount: bigint, // assuming amount is in base denom
    isPrivate: boolean = false,
) {
    // imports and init the client and prover
    const {
        WebClient,
        AccountId,
        TransactionProver,
        NoteType
    } = await import("@demox-labs/miden-sdk");
    const client = await WebClient.createClient(RPC_ENDPOINT);
    const prover = TransactionProver.newRemoteProver(TX_PROVER_ENDPOINT);

    // setup send transaction params
    const noteType = isPrivate ? NoteType.Private : NoteType.Public;
    const faucet_id = AccountId.fromBech32(
        localStorage.getItem("faucet_id")! 
    );
    const accountId = AccountId.fromBech32(
        localStorage.getItem("account_id")! 
    );
    const toAccountId = to.startsWith("0x") ? AccountId.fromHex(to) : AccountId.fromBech32(to);

    const sendTxRequest = client.newSendTransactionRequest(
        accountId,
        toAccountId,
        FAUCET_ID,
        noteType,
        amount
    )

    const txResult = await client.newTransaction(accountId, sendTxRequest);
    const txId = txResult.executedTransaction().id().toHex()
    await client.submitTransaction(txResult, prover);

    console.log("Send transaction submitted with id:", txId);
    
    // terminate the client when done
    client.terminate();

}`;