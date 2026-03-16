import { expect } from "chai";
import { ethers } from "hardhat";
import { RWAOracle } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RWAOracle", function () {
  let oracle: RWAOracle;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    const OracleFactory = await ethers.getContractFactory("RWAOracle");
    oracle = await OracleFactory.deploy();
  });

  it("should return Gold price (asset 0)", async function () {
    const price = await oracle.getPrice(0);
    expect(price).to.equal(320000000000n); // $3200 * 1e8
  });

  it("should return correct asset names", async function () {
    expect(await oracle.assetName(0)).to.equal("Gold");
    expect(await oracle.assetName(4)).to.equal("Bitcoin");
    expect(await oracle.assetName(10)).to.equal("NYC RE");
  });

  it("should allow owner to update price", async function () {
    const newPrice = 350000000000n; // $3500
    await oracle.updatePrice(0, newPrice);
    expect(await oracle.getPrice(0)).to.equal(newPrice);
  });

  it("should emit PriceUpdated event", async function () {
    await expect(oracle.updatePrice(0, 350000000000n))
      .to.emit(oracle, "PriceUpdated")
      .withArgs(0, 320000000000n, 350000000000n);
  });

  it("should revert on invalid asset ID", async function () {
    await expect(oracle.getPrice(25)).to.be.revertedWith("RWAOracle: invalid asset ID");
  });

  it("should revert price update from non-owner", async function () {
    await expect(
      oracle.connect(user).updatePrice(0, 1000n)
    ).to.be.reverted;
  });

  it("should have correct ASSET_COUNT (25)", async function () {
    expect(await oracle.ASSET_COUNT()).to.equal(25);
  });
});
