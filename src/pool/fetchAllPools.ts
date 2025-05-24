import { Connection, PublicKey,clusterApiUrl } from '@solana/web3.js'
import {
  ALL_PROGRAM_ID,
  DEVNET_PROGRAM_ID,
  liquidityStateV4Layout,
  PoolInfoLayout,
  CpmmPoolInfoLayout,
  struct,
  publicKey,
} from '@raydium-io/raydium-sdk-v2'

//const connection = new Connection('rpc url')
export const connection = new Connection(clusterApiUrl('devnet'))

const getAmmPoolInfo = async (poolId: PublicKey) => {
  const data = await connection.getAccountInfo(poolId)
  if (!data) throw new Error(`pool not found: ${poolId.toBase58()}`)
  //let rsp = liquidityStateV4Layout.decode(data.data)
  
  let rsp = CpmmPoolInfoLayout.decode(data.data)
  console.log(rsp);

  // const cpmmPools: (ReturnType<typeof CpmmPoolInfoLayout.decode> & { poolId: PublicKey })[] = []
  // cpmmPools.push({
  //       poolId: new PublicKey('4hjnV6oaPa62yHfRGc2PD9gJL3HCecU2KpyLGhrULuPS'),
  //       ...CpmmPoolInfoLayout.decode(data.data),
  //     })
  //console.log(cpmmPools);

  return liquidityStateV4Layout.decode(data.data)
}

const getMultipleAmmPoolInfo = async (poolIdList: PublicKey[]) => {
  const data = await connection.getMultipleAccountsInfo(poolIdList)

  return data.map((d, idx) => {
    if (!d) return null
    return {
      poolId: poolIdList[idx],
      ...liquidityStateV4Layout.decode(d.data),
    }
  })
}

async function fetchAllPools() {
  // since amm pool data at least > 1GB might cause error
  // let's limit data size and get poolId/baseMint/quoteMint first
  const layoutAmm = struct([publicKey('49j9SgJWYidjtCyjroEzfa9NCyEoY9Zjmzmhxy6PeQyK'), publicKey('6BJwba9NyE3FJttj5PLTYmbeTzA6wMi44xaX4k6QqKZ5')])
  const ammPools: (ReturnType<typeof layoutAmm.decode> & { poolId: PublicKey })[] = []

  /*console.log('amm fetching...')
  const ammPoolsData = await connection.getProgramAccounts(ALL_PROGRAM_ID.AMM_V4, {
    filters: [{ dataSize: liquidityStateV4Layout.span }],
    dataSlice: { offset: liquidityStateV4Layout.offsetOf('baseMint'), length: 64 },
    encoding: 'base64' as any,
  })
  console.log('amm fetch done')
  ammPoolsData.forEach((a) => {
    ammPools.push({
      poolId: a.pubkey,
      ...layoutAmm.decode(a.account.data),
    })
  })*/

  // after get all amm pools id, we can fetch amm pool info one by one or by group separately

  // e.g. 1:1  ammPools.forEach((a) => getAmmPoolInfo(a.poolId))
  // e.g. 200 per group  getMultipleAmmPoolInfo(ammPools.slice(0, 100).map((a) => a.poolId))

  const clmmPools: (ReturnType<typeof PoolInfoLayout.decode> & { poolId: PublicKey })[] = []
  /*console.log('clmm fetching...')
  const clmmPoolsData = await connection.getProgramAccounts(ALL_PROGRAM_ID.CLMM_PROGRAM_ID, {
    filters: [{ dataSize: PoolInfoLayout.span }],
  })

  console.log('clmm fetch done')
  clmmPoolsData.forEach((c) => {
    clmmPools.push({
      poolId: c.pubkey,
      ...PoolInfoLayout.decode(c.account.data),
    })
  })*/

  const cpmmPools: (ReturnType<typeof CpmmPoolInfoLayout.decode> & { poolId: PublicKey })[] = []
  console.log('cpmm fetching...')
  const cpmmPoolsData = await connection.getProgramAccounts(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, {
    filters: [{ dataSize: CpmmPoolInfoLayout.span }],
  })
  /*const targetPublicKey = new PublicKey('4hjnV6oaPa62yHfRGc2PD9gJL3HCecU2KpyLGhrULuPS').toBase58();
  const cpmmPoolsData = await connection.getProgramAccounts(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, {
    filters: [{ 
        memcmp: {
            offset: 0, // 数据偏移量，从哪个字节开始比较
            bytes: targetPublicKey, // 目标公钥字符串，需要是Base58编码
        },
      }],
  })*/
  cpmmPoolsData.forEach((c) => {
    //console.log('--',c.pubkey);
    if(c.pubkey.toBase58() == '4hjnV6oaPa62yHfRGc2PD9gJL3HCecU2KpyLGhrULuPS')
    {
      cpmmPools.push({
        poolId: c.pubkey,
        ...CpmmPoolInfoLayout.decode(c.account.data),
      })
    }
  })
  console.log('cpmm fetch done')

  console.log(ammPools.length, {
    //amm: ammPools,
    //clmmPools: clmmPools,
    cpmmPools,
  })
}

fetchAllPools()
//getAmmPoolInfo(new PublicKey('4hjnV6oaPa62yHfRGc2PD9gJL3HCecU2KpyLGhrULuPS'))
