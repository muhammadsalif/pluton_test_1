const hre = require("hardhat");

async function main() {

  const Token = await hre.ethers.getContractFactory("MyToken");
  const token = await Token.deploy();
  await token.deployed();

  const Nft = await hre.ethers.getContractFactory("MyNft");
  const nft = await Nft.deploy([token.address]);
  await nft.deployed();

  console.log("Token address:", token.address);
  console.log("Nft address:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });