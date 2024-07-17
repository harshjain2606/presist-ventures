const solanaWeb3 = require('@solana/web3.js');
const { Market, OpenOrders } = require('@project-serum/serum');

const SOL_MINT_ADDRESS = "So11111111111111111111111111111111111111112";
const DOGWIFTHAT_MINT_ADDRESS = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";

const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

async function swapTokens() {
    const payer = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SOLANA_SECRET_KEY)));

    const marketAddress = new solanaWeb3.PublicKey('Market_Address'); 
    const market = await Market.load(connection, marketAddress, {}, solanaWeb3.PublicKey.default);

    const baseMint = new solanaWeb3.PublicKey(SOL_MINT_ADDRESS);
    const quoteMint = new solanaWeb3.PublicKey(DOGWIFTHAT_MINT_ADDRESS);

    const owner = payer.publicKey;
    const openOrders = await OpenOrders.findForOwner(connection, owner, market.address, solanaWeb3.PublicKey.default);
    
    const [baseVault, quoteVault] = await Promise.all([
        market.findOpenOrdersAccountsForOwner(owner),
        market.findOpenOrdersAccountsForOwner(owner),
    ]);

    const transaction = new solanaWeb3.Transaction();

    const instruction = market.makePlaceOrderInstruction(connection, {
        owner,
        payer: baseVault[0].baseTokenAccount,
        side: 'sell', 
        price: 1.0, 
        size: 1.0, 
        orderType: 'limit',
        clientId: new solanaWeb3.BN(123),
        openOrdersAddressKey: openOrders[0].address,
        feeDiscountPubkey: null,
    });

    transaction.add(instruction);
    transaction.feePayer = payer.publicKey;
    const recentBlockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;

    transaction.sign(payer);

    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);

    console.log("Transaction completed with signature:", signature);
}

swapTokens().catch(console.error);
