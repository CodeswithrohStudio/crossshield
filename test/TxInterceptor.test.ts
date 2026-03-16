import { expect } from "chai";
import { ethers } from "hardhat";
import { TxInterceptor } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TxInterceptor", function () {
  let interceptor: TxInterceptor;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let target: SignerWithAddress;

  beforeEach(async function () {
    [owner, user, target] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TxInterceptor");
    interceptor = await Factory.deploy();
  });

  it("should analyze a simple ETH transfer as low risk", async function () {
    const [riskScore] = await interceptor.connect(user).analyzeTransaction.staticCall(
      target.address,
      "0x",
      ethers.parseEther("0.1")
    );
    expect(riskScore).to.be.lt(50);
  });

  it("should score unverified contracts higher", async function () {
    const [riskScore] = await interceptor.connect(user).analyzeTransaction.staticCall(
      target.address,
      "0x1234567890abcdef",
      0
    );
    // Unverified + some calldata
    expect(riskScore).to.be.gte(20);
  });

  it("should register verified contracts", async function () {
    await interceptor.registerVerifiedContract(target.address, "TestContract");
    expect(await interceptor.isContractVerified(target.address)).to.be.true;
  });

  it("should emit ContractVerified event", async function () {
    await expect(interceptor.registerVerifiedContract(target.address, "TestContract"))
      .to.emit(interceptor, "ContractVerified")
      .withArgs(target.address, "TestContract");
  });

  it("should emit TransactionAnalyzed on analysis", async function () {
    await expect(
      interceptor.connect(user).analyzeTransaction(target.address, "0x", 0)
    ).to.emit(interceptor, "TransactionAnalyzed");
  });

  it("should store risk history per user", async function () {
    await interceptor.connect(user).analyzeTransaction(target.address, "0x", 0);
    await interceptor.connect(user).analyzeTransaction(target.address, "0x1234", 0);
    const history = await interceptor.getRiskHistory(user.address);
    expect(history.length).to.equal(2);
  });

  it("should resolve ENS nodes set by owner", async function () {
    const node = ethers.keccak256(ethers.toUtf8Bytes("crossshield.eth"));
    await interceptor.setENS(node, target.address);
    expect(await interceptor.resolveENS(node)).to.equal(target.address);
  });
});
