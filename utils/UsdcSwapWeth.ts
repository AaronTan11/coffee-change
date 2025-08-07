import { ethers } from 'ethers';
import FACTORY_ABI from './constants/SwapAbi/factory.json';
import QUOTER_ABI from './constants/SwapAbi/quoter.json';
import SWAP_ROUTER_ABI from './constants/SwapAbi/swaprouter.json';
import POOL_ABI from './constants/SwapAbi/pool.json';
import TOKEN_IN_ABI from './constants/SwapAbi/weth.json';

// Types
interface Token {
    chainId: number;
    address: string;
    decimals: number;
    symbol: string;
    name: string;
    isToken: boolean;
    isNative: boolean;
    wrapped: boolean;
}

interface PoolInfo {
    poolContract: ethers.Contract;
    token0: string;
    token1: string;
    fee: number;
}

interface SwapParams {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    recipient: string;
    amountIn: bigint;
    amountOutMinimum: bigint;
    sqrtPriceLimitX96: number;
    deadline: number; // Added deadline parameter
}

// Get provider and signer from MetaMask
async function getProviderAndSigner(): Promise<[ethers.BrowserProvider, ethers.JsonRpcSigner]> {
    if (!window.ethereum) {
        throw new Error("MetaMask not found! Please install MetaMask.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Check if we're on the correct network (Sepolia)
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(11155111)) {
        throw new Error("Please switch to Sepolia network in MetaMask");
    }

    return [provider, signer];
}

// Deployment Addresses
const POOL_FACTORY_CONTRACT_ADDRESS = '0x0227628f3F023bb0B980b67D528571c95c6DaC1c';
const QUOTER_CONTRACT_ADDRESS = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3';
const SWAP_ROUTER_CONTRACT_ADDRESS = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E';

// Token Configuration
const WETH: Token = {
    chainId: 11155111,
    address: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
    isToken: true,
    isNative: true,
    wrapped: true
};

const USDC: Token = {
    chainId: 11155111,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD//C',
    isToken: true,
    isNative: true,
    wrapped: false
};

async function approveToken(
    tokenAddress: string,
    tokenABI: any,
    amount: bigint,
    signer: ethers.JsonRpcSigner
): Promise<void> {
    try {
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

        // Check current allowance first
        const currentAllowance = await tokenContract.allowance(
            await signer.getAddress(),
            SWAP_ROUTER_CONTRACT_ADDRESS
        );

        if (currentAllowance >= amount) {
            console.log('Sufficient allowance already exists');
            return;
        }

        const approveTransaction = await tokenContract.approve.populateTransaction(
            SWAP_ROUTER_CONTRACT_ADDRESS,
            amount
        );

        const transactionResponse = await signer.sendTransaction(approveTransaction);
        console.log('-------------------------------');
        console.log('Sending Approval Transaction...');
        console.log('-------------------------------');
        console.log(`Transaction Sent: ${transactionResponse.hash}`);
        console.log('-------------------------------');
        const receipt = await transactionResponse.wait();
        console.log(`Approval Transaction Confirmed! https://sepolia.etherscan.io/txn/${receipt?.hash}`);
    } catch (error) {
        console.error("An error occurred during token approval:", error);
        throw new Error("Token approval failed");
    }
}

async function getPoolInfo(
    provider: ethers.BrowserProvider,
    tokenIn: Token,
    tokenOut: Token
): Promise<PoolInfo> {
    const factoryContract = new ethers.Contract(POOL_FACTORY_CONTRACT_ADDRESS, FACTORY_ABI, provider);
    const poolAddress = await factoryContract.getPool(tokenIn.address, tokenOut.address, 3000);
    if (!poolAddress) {
        throw new Error("Failed to get pool address");
    }
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
    const [token0, token1, fee] = await Promise.all([
        poolContract.token0(),
        poolContract.token1(),
        poolContract.fee(),
    ]);
    return { poolContract, token0, token1, fee };
}

async function quoteAndLogSwap(
    provider: ethers.BrowserProvider,
    fee: number,
    signer: ethers.JsonRpcSigner,
    amountIn: bigint
): Promise<bigint> {
    const quoterContract = new ethers.Contract(QUOTER_CONTRACT_ADDRESS, QUOTER_ABI, provider);
    const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall({
        tokenIn: USDC.address,
        tokenOut: WETH.address,
        fee: fee,
        recipient: await signer.getAddress(),
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
        amountIn: amountIn,
        sqrtPriceLimitX96: 0,
    });
    
    console.log('-------------------------------');
    console.log(`Token Swap will result in: ${ethers.formatEther(quotedAmountOut[0])} ${WETH.symbol} for ${ethers.formatUnits(amountIn, USDC.decimals)} ${USDC.symbol}`);
    
    return quotedAmountOut[0];
}

async function prepareSwapParams(
    poolContract: ethers.Contract,
    signer: ethers.JsonRpcSigner,
    amountIn: bigint,
    amountOutMinimum: bigint
): Promise<SwapParams> {
    return {
        tokenIn: USDC.address,
        tokenOut: WETH.address,
        fee: await poolContract.fee(),
        recipient: await signer.getAddress(),
        amountIn: amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0,
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from now
    };
}

async function executeSwap(
    signer: ethers.JsonRpcSigner,
    params: SwapParams
): Promise<string> {
    const swapRouter = new ethers.Contract(SWAP_ROUTER_CONTRACT_ADDRESS, SWAP_ROUTER_ABI, signer);
    
    try {
        // Check USDC balance
        const usdcContract = new ethers.Contract(USDC.address, TOKEN_IN_ABI, signer);
        const balance = await usdcContract.balanceOf(await signer.getAddress());
        if (balance < params.amountIn) {
            throw new Error(`Insufficient USDC balance. You have ${ethers.formatUnits(balance, USDC.decimals)} USDC but trying to swap ${ethers.formatUnits(params.amountIn, USDC.decimals)} USDC`);
        }

        // Check allowance
        const allowance = await usdcContract.allowance(await signer.getAddress(), SWAP_ROUTER_CONTRACT_ADDRESS);
        if (allowance < params.amountIn) {
            throw new Error("Insufficient allowance. Please approve the transaction first.");
        }

        const transaction = await swapRouter.exactInputSingle.populateTransaction(params);
        const receipt = await signer.sendTransaction(transaction);
        console.log('-------------------------------');
        console.log(`Receipt: https://sepolia.etherscan.io/tx/${receipt.hash}`);
        console.log('-------------------------------');
        
        const minedReceipt = await receipt.wait();
        if (!minedReceipt || minedReceipt.status === 0) {
            throw new Error("Swap transaction failed. Please check if you have enough USDC and try again.");
        }
        
        return ethers.formatEther(params.amountOutMinimum);
    } catch (error: any) {
        console.error("Swap execution error:", error);
        if (error.reason) {
            throw new Error(`Swap failed: ${error.reason}`);
        } else if (error.message) {
            throw new Error(`Swap failed: ${error.message}`);
        } else {
            throw new Error("Swap failed. Please check your balance and try again.");
        }
    }
}

async function swapUsdcToWeth(swapAmount: number): Promise<string> {
    try {
        // Get provider and signer from MetaMask
        const [provider, signer] = await getProviderAndSigner();

        // For USDC input, we want the exact amount since USDC has 6 decimals
        const amountIn = ethers.parseUnits(swapAmount.toString(), USDC.decimals);

        await approveToken(USDC.address, TOKEN_IN_ABI, amountIn, signer);
        const { poolContract, token0, token1, fee } = await getPoolInfo(provider, USDC, WETH);
        console.log('-------------------------------');
        console.log(`Fetching Quote for: ${USDC.symbol} to ${WETH.symbol}`);
        console.log('-------------------------------');
        console.log(`Swap Amount: ${ethers.formatUnits(amountIn, USDC.decimals)}`);

        const quotedAmountOut = await quoteAndLogSwap(provider, fee, signer, amountIn);
        
        // Apply a 1% slippage tolerance
        const minOutput = quotedAmountOut * BigInt(99) / BigInt(100);

        const params = await prepareSwapParams(poolContract, signer, amountIn, minOutput);
        const amountReceived = await executeSwap(signer, params);
        return amountReceived;
    } catch (error) {
        if (error instanceof Error) {
            console.error("An error occurred:", error.message);
            throw error;
        } else {
            console.error("An unknown error occurred");
            throw new Error("An unknown error occurred");
        }
    }
}

export default swapUsdcToWeth;