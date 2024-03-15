let tonweb, counter, counterAddress, counterValue;

document.addEventListener("DOMContentLoaded", function () {
    window.TonAccess.getHttpEndpoint({ network: "testnet" })
    .then(async (endpoint) => {
        tonweb = new window.TonWeb(new window.TonWeb.HttpProvider(endpoint));

        counter = new Counter(tonweb.provider);
        counterAddress = await counter.getAddress();
        counterValue = await counter.getCounter();
    })
    .catch((error) => console.error(error));
});

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://miroslavakalman.github.io/tonconnect-manifest.json',
    buttonRootId: 'connect'
});

async function transaction() {
    const transaction = {
        validUntil: Math.round(Date.now() / 1000) + 10,
        messages: [
            {
                address: "0:0000000000000000000000000000000000000000000000000000000000000000",
                amount: "1000000000"
            }
        ]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
    } catch (e) {
        console.error(e);
    }
}

async function deploy() {
    const addr = document.getElementById("addr");
    addr.innerText = "Counter address: " + counterAddress.toString(true, true, true);

    const stateInit = (await counter.createStateInit()).stateInit;
    const stateInitBoc = await stateInit.toBoc(false);
    const stateInitBase64 = TonWeb.utils.bytesToBase64(stateInitBoc);

    const transaction = {
        validUntil: Math.round(Date.now() / 1000) + 10,
        messages: [
            {
                address: counterAddress.toString(false, true, true),
                amount: "10000000",
                stateInit: stateInitBase64
            }
        ]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
    } catch (e) {
        console.error(e);
    }
}

async function increment() {
    const payload = await counter.createSendIncrementBody();
    const payloadBoc = await payload.toBoc(false);
    const payloadBase64 = TonWeb.utils.bytesToBase64(payloadBoc);

    const transaction = {
        validUntil: Math.round(Date.now() / 1000) + 10,
        messages: [
            {
                address: counterAddress.toString(false, true, true),
                amount: "2000000",
                payload: payloadBase64
            }
        ]
    };

    try {
        await tonConnectUI.sendTransaction(transaction);
    } catch (e) {
        console.error(e);
    }
}

async function getValue() {
    const value = document.getElementById("value");
    value.innerText = "Value: " + counterValue.toNumber();
}
