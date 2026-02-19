import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("Deploying SupplyChain contract...");

    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();

    const contractAddress = await supplyChain.getAddress();
    console.log(`SupplyChain deployed to: ${contractAddress}`);

    // Copy ABI and address to frontend
    const artifact = await hre.artifacts.readArtifact("SupplyChain");
    const frontendDir = path.join(__dirname, "../../frontend/src/contracts");
    if (!fs.existsSync(frontendDir)) fs.mkdirSync(frontendDir, { recursive: true });

    fs.writeFileSync(
        path.join(frontendDir, "SupplyChain.json"),
        JSON.stringify({ address: contractAddress, abi: artifact.abi }, null, 2)
    );
    console.log("Contract ABI and address written to frontend/src/contracts/SupplyChain.json");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
