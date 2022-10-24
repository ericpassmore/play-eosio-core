import {
    Action,
    APIError,
    Asset,
    Name,
    PrivateKey,
    SignedTransaction,
    Struct,
    Transaction,
    APIClient, FetchProvider
} from '@greymass/eosio'

import fetch from 'node-fetch'

const jungle4 = new APIClient(
    { provider: new FetchProvider('https://jungle4.genereos.io:443', { fetch }) }
)

async function chain_push() {
    @Struct.type('transfer')
    class Transfer extends Struct {
        @Struct.field('name') from!: Name
        @Struct.field('name') to!: Name
        @Struct.field('asset') quantity!: Asset
        @Struct.field('string') memo!: string
    }

    const info = await jungle4.v1.chain.get_info()
    const header = info.getTransactionHeader()
    const actionOrig = Action.from({
        authorization: [{
            actor: 'corecorecore', permission: 'active',
        },], account: 'eosio.token', name: 'transfer', data: Transfer.from({
            from: 'corecorecore', to: 'teamgreymass', quantity: '0.0042 EOS', memo: 'eosio-core is the best <3',
        }),
    })
    const action = Action.from({
        authorization: [{
            actor: 'corecorecore', permission: 'foobar',
        },], account: 'eosio.token', name: 'transfer', data: Transfer.from({
            from: 'corecorecore', to: 'teamgreymass', quantity: '0.0042 EOS', memo: 'eosio-core is the best <3',
        }),
    })
    const transaction = Transaction.from({
        ...header, actions: [action],
    })
    const privateKey = PrivateKey.from('5JW71y3njNNVf9fiGaufq8Up5XiGk68jZ5tYhKpy69yyU9cr7n9')
    const signature = privateKey.signDigest(transaction.signingDigest(info.chain_id))
    const signedTransaction = SignedTransaction.from({
        ...transaction, signatures: [signature],
    })
    return await jungle4.v1.chain.push_transaction(signedTransaction)
    //assert.equal(result.transaction_id, transaction.id.hexString)
}

chain_push()
    .then((value) => {
        console.log("SUCCESS with Chain Push")
        console.log(`transaction_id ${value.transaction_id}`)
    })
    .catch((error) => {
        if (! (error instanceof APIError)) {
            console.log("BAD not an API Error")
        } else {
            const apiError = error as APIError
            console.log(apiError.message)
        }
    })
