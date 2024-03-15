const Contract = TonWeb.Contract;
const { Cell } = TonWeb.boc;

class Counter extends Contract {
    constructor(provider, options) {
        options = {
            wc: 0,
            code: Cell.oneFromBoc('B5EE9C7201010401003F000114FF00F4A413F4BCF2C80B0102016202030040D06C2120C7009130E0D31F30ED44D0D33F3001C00197A4C8CB3FC9ED549130E20011A13431DA89A1A67E61')
        };
        super(provider, options);
        
        this.methods.getCounter = this.getCounter.bind(this);
    }

    createDataCell() {
        const cell = new Cell();
        cell.bits.writeUint(111, 64);
        return cell;
    }

    createSendIncrementBody() {
        const body = new Cell();
        body.bits.writeUint(1, 32);
        body.bits.writeUint(0, 64);
        return body;
    }

    async getCounter() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'counter');
        return result;
    }
}
