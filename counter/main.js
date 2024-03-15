require("dotenv").config();

const { getHttpEndpoint } = require("@orbs-network/ton-access");
const { mnemonicToKeyPair } = require("tonweb-mnemonic");
const TonWeb = require("tonweb");

const { Counter } = require("./Counter");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const endpoint = await getHttpEndpoint({ network: process.env.NETWORK });
    const tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
    
    const mnemonic = process.env.MNEMONIC;
    const key = await mnemonicToKeyPair(mnemonic.split(" "));
    const WalletClass = tonweb.wallet.all["v4R2"];
    const wallet = new WalletClass(tonweb.provider, { publicKey: key.publicKey });
    const walletAddress = await wallet.getAddress();
    const seqno = await wallet.methods.seqno().call() || 0;
    console.log("Wallet address:", walletAddress.toString(true, true, true));

    const counter = new Counter(tonweb.provider);
    const counterAddress = await counter.getAddress();
    console.log("Counter address:", counterAddress.toString(true, true, true));

    async function deploy() {
        await wallet.methods.transfer({
            secretKey: key.secretKey,
            toAddress: counterAddress,
            amount: TonWeb.utils.toNano("0.01"),
            seqno: seqno,
            stateInit: (await counter.createStateInit()).stateInit,
            sendMode: 3
        }).send();
    
        let currentSeqno = seqno;
        while (currentSeqno == seqno) {
            console.log("Waiting for deploy transaction to confirm...");
            await sleep(1000);
            currentSeqno = await wallet.methods.seqno().call();
        }
        console.log("Deploy transaction confirmed!");
    }

    async function getNumber() {
        const counterValue = await counter.getCounter();
        console.log("Value:", counterValue.toNumber());
    }

    async function sendTransaction() {
        await wallet.methods.transfer({
            secretKey: key.secretKey,
            toAddress: counterAddress,
            amount: TonWeb.utils.toNano("0.002"),
            seqno: seqno,
            payload: counter.createSendIncrementBody(),
            sendMode: 3
        }).send();

        let currentSeqno = seqno;
        while (currentSeqno == seqno) {
            console.log("Waiting for transaction to confirm...");
            await sleep(1000);
            currentSeqno = await wallet.methods.seqno().call() || 0;
        }
        console.log("Send increment transaction confirmed!");
    }

    // await deploy();
    // await getNumber();
    // await sendTransaction();
};

main();
