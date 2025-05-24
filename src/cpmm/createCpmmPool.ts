import {
  CREATE_CPMM_POOL_PROGRAM,
  CREATE_CPMM_POOL_FEE_ACC,
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId,
} from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { initSdk, txVersion } from '../config'

export const createPool = async () => {
  const raydium = await initSdk({ loadToken: true })

  // check token list here: https://api-v3.raydium.io/mint/list
  // USDT
  //const mintA = await raydium.token.getTokenInfo('49j9SgJWYidjtCyjroEzfa9NCyEoY9Zjmzmhxy6PeQyK')
  // AAA
  //const mintB = await raydium.token.getTokenInfo('6BJwba9NyE3FJttj5PLTYmbeTzA6wMi44xaX4k6QqKZ5')
  const mintA =  {
      address: '49j9SgJWYidjtCyjroEzfa9NCyEoY9Zjmzmhxy6PeQyK',
      programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
      decimals: 6,
    } 

  const mintB =  {
      address: '6BJwba9NyE3FJttj5PLTYmbeTzA6wMi44xaX4k6QqKZ5',
      programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
      decimals: 9,
    } 
  /**
   * you also can provide mint info directly like below, then don't have to call token info api
   *  {
      address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
    } 
   */

  const feeConfigs = await raydium.api.getCpmmConfigs()
  //console.log(`feeConfigs: ${JSON.stringify(feeConfigs)}`);
  if (raydium.cluster === 'devnet') {
    feeConfigs.forEach((config) => {
      config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58()
    })
  }
  
  let a = {
    // poolId: // your custom publicKey, default sdk will automatically calculate pda pool id
    programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,//CREATE_CPMM_POOL_PROGRAM, // devnet: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
    poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,//CREATE_CPMM_POOL_FEE_ACC, // devnet:  DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
    mintA,
    mintB,
    mintAAmount: new BN(100),
    mintBAmount: new BN(100),
    startTime: new BN(0),
    feeConfig: feeConfigs[0],
    associatedOnly: false,
    ownerInfo: {
      useSOLBalance: true,
    },
    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  };
  console.log(`--${JSON.stringify(a)}`);
  const { execute, extInfo } = await raydium.cpmm.createPool({
    // poolId: // your custom publicKey, default sdk will automatically calculate pda pool id
    programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, // devnet: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM
    poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC, // devnet:  DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC
    mintA,
    mintB,
    mintAAmount: new BN(100),
    mintBAmount: new BN(100),
    startTime: new BN(0),
    feeConfig: feeConfigs[0],
    associatedOnly: false,
    ownerInfo: {
      useSOLBalance: true,
    },
    txVersion,
    // optional: set up priority fee here
    // computeBudgetConfig: {
    //   units: 600000,
    //   microLamports: 46591500,
    // },
  })

  console.log(`---extInfo: ${JSON.stringify(extInfo)}`);

  // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
  try{
    const { txId } = await execute({ sendAndConfirm: false })
    console.log('pool created', {
      txId,
      poolKeys: Object.keys(extInfo.address).reduce(
        (acc, cur) => ({
          ...acc,
          [cur]: extInfo.address[cur as keyof typeof extInfo.address].toString(),
        }),
        {}
      ),
    })
  }catch(e){
    console.log( `--error:${e}`);
  }
  process.exit() // if you don't want to end up node execution, comment this line
}

/** uncomment code below to execute */
createPool()
