const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');
const wallet = solanaWeb3.Keypair.generate(); // Replace this with your wallet

// Token Mints
const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const DOG_TOKEN_MINT_ADDRESS = 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';

async function swapTokens() {
    // Fetch the token accounts
    const solMint = new solanaWeb3.PublicKey(SOL_MINT_ADDRESS);
    const dogMint = new solanaWeb3.PublicKey(DOG_TOKEN_MINT_ADDRESS);
    
    const solTokenAccount = await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        solMint,
        wallet.publicKey
    );
    
    const dogTokenAccount = await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        dogMint,
        wallet.publicKey
    );

    // Create the Token Swap transaction
    const tokenSwapTransaction = new solanaWeb3.Transaction().add(
        splToken.Token.createTransferInstruction(
            splToken.TOKEN_PROGRAM_ID,
            solTokenAccount,
            dogTokenAccount,
            wallet.publicKey,
            [],
            1000000 // Amount to swap (example value)
        )
    );

    // Send the transaction
    const signature = await solanaWeb3.sendAndConfirmTransaction(connection, tokenSwapTransaction, [wallet]);
    console.log('Transaction confirmed with signature:', signature);
}

// Ensure you have funds and the associated token accounts
(async () => {
    // Airdrop SOL to the wallet for transaction fees
    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, solanaWeb3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);

    // Swap tokens
    await swapTokens();
})();
