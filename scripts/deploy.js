const hre = require("hardhat");

async function main() {
  const sweepFactory = await hre.ethers.getContractFactory("Sweep");
  const sweep = await sweepFactory.deploy();

  await sweep.deployed();

  console.log("Contract deployed to:", sweep.address);

  const [owner] = await ethers.getSigners();
  await sweep
    .connect(owner)
    .mint("0x44BA1e16BaA960FDE9A6e1DED5b46cAE08026C49", "12300000000000000000");
  await sweep
    .connect(owner)
    .mint("0xF5D1c85a17376D22A77699396275bcBf94e7f796", "20000000000000000000");

  console.log(
    `Balance of 0x44BA1e16BaA960FDE9A6e1DED5b46cAE08026C49 is ${parseInt(
      await sweep.balanceOf("0x44BA1e16BaA960FDE9A6e1DED5b46cAE08026C49")
    )}`
  );
  console.log(
    `Balance of 0xF5D1c85a17376D22A77699396275bcBf94e7f796 is ${parseInt(
      await sweep.balanceOf("0xF5D1c85a17376D22A77699396275bcBf94e7f796")
    )}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
