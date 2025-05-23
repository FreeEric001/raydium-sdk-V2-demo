import { initSdk } from '../config'
import { ApiV3PoolInfoStandardItemCpmm, CpmmKeys, CpmmRpcData, CurveCalculator } from '@/raydium-io/raydium-sdk-v2'

export const fetchRpcPoolInfo = async () => {
  const raydium = await initSdk()
  // SOL-RAY
  const pool1 = 'rap9zgqNsgQka12qS3xua8nkqdCXV4jCCfJZfCfq2fS'

  const res = await raydium.cpmm.getRpcPoolInfos([pool1])

  const pool1Info = res[pool1]

  console.log('SOL-RAY pool price:', pool1Info.poolPrice)
  console.log('cpmm pool infos:', res)
}

export const fetchRpcPoolInfo2 = async () => {
  const raydium = await initSdk()
  // SOL-RAY
  let poolInfo: ApiV3PoolInfoStandardItemCpmm
  const pool1 = 'rap9zgqNsgQka12qS3xua8nkqdCXV4jCCfJZfCfq2fS'
  const data = await raydium.api.fetchPoolById({ ids: pool1 })
  console.log(`data:${data.length} ${JSON.stringify(data)}`);
  console.log(`data:${data.length} ${JSON.stringify(data[0])}`);
  poolInfo = data[0] as ApiV3PoolInfoStandardItemCpmm
  console.log(`poolInfo:${JSON.stringify(poolInfo)}`);
}
/** uncomment code below to execute */
fetchRpcPoolInfo2()
    