import { ethers } from 'ethers';
import { WETH_CONTRACT_ADDRESS, WETH_ABI } from './constants/Weth';

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

async function unwrapWeth(amount: number): Promise<string> {
    try {
        const [provider, signer] = await getProviderAndSigner();
        
        // Create WETH contract instance
        const wethContract = new ethers.Contract(WETH_CONTRACT_ADDRESS, WETH_ABI, signer);
        
        // Check WETH balance
        const wethBalance = await wethContract.balanceOf(await signer.getAddress());
        const unwrapAmount = ethers.parseEther(amount.toString());
        
        if (wethBalance < unwrapAmount) {
            throw new Error(`Insufficient WETH balance. You have ${ethers.formatEther(wethBalance)} WETH but trying to unwrap ${amount} WETH`);
        }

        // Call withdraw function
        console.log('-------------------------------');
        console.log('Unwrapping WETH to ETH...');
        console.log(`Amount: ${amount} WETH`);
        console.log('-------------------------------');

        const tx = await wethContract.withdraw(unwrapAmount);
        console.log(`Transaction sent: ${tx.hash}`);
        
        // Wait for transaction confirmation
        const receipt = await tx.wait();
        
        if (!receipt || receipt.status === 0) {
            throw new Error("Unwrap transaction failed");
        }

        console.log('-------------------------------');
        console.log(`Successfully unwrapped ${amount} WETH to ETH`);
        console.log(`Transaction: https://sepolia.etherscan.io/tx/${receipt.hash}`);
        console.log('-------------------------------');

        return amount.toString();
    } catch (error) {
        console.error("Error unwrapping WETH:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to unwrap WETH: ${error.message}`);
        } else {
            throw new Error("Failed to unwrap WETH");
        }
    }
}

export default unwrapWeth;
