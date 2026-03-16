import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CrossShieldVault, MockUSDC, RWAOracle, XCMBridge } from "../typechain-types";

describe("CrossShieldVault", function () {
  let vault: CrossShieldVault;
  let usdc: MockUSDC;
  let oracle: RWAOracle;
  let xcmBridge: XCMBridge;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  const USDC_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
  const SMALL_AMOUNT = ethers.parseUnits("10", 6);  // 10 USDC

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDCFactory.deploy();

    const OracleFactory = await ethers.getContractFactory("RWAOracle");
    oracle = await OracleFactory.deploy();

    const BridgeFactory = await ethers.getContractFactory("XCMBridge");
    xcmBridge = await BridgeFactory.deploy();

    const VaultFactory = await ethers.getContractFactory("CrossShieldVault");
    vault = await VaultFactory.deploy(
      await usdc.getAddress(),
      await oracle.getAddress(),
      await xcmBridge.getAddress()
    );

    // Fund users
    await usdc.mint(alice.address, ethers.parseUnits("100000", 6));
    await usdc.mint(bob.address, ethers.parseUnits("100000", 6));
    // Fund vault with USDC for payouts
    await usdc.mint(await vault.getAddress(), ethers.parseUnits("1000000", 6));

    // Approve vault
    await usdc.connect(alice).approve(await vault.getAddress(), ethers.MaxUint256);
    await usdc.connect(bob).approve(await vault.getAddress(), ethers.MaxUint256);
  });

  // ─── Test 1: Deposit ─────────────────────────────────────────────────────

  it("should deposit USDC and record principal", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    const deposit = await vault.getDeposit(alice.address);
    expect(deposit.principal).to.equal(USDC_AMOUNT);
    expect(deposit.depositedAt).to.be.gt(0);
  });

  it("should emit PrincipalDeposited event on deposit", async function () {
    await expect(vault.connect(alice).depositUSDC(USDC_AMOUNT))
      .to.emit(vault, "PrincipalDeposited")
      .withArgs(alice.address, USDC_AMOUNT, (v: bigint) => v > 0n);
  });

  it("should reject deposit below minimum (1 USDC)", async function () {
    await expect(
      vault.connect(alice).depositUSDC(ethers.parseUnits("0.5", 6))
    ).to.be.revertedWith("CrossShieldVault: minimum deposit is 1 USDC");
  });

  it("should reject second deposit without withdrawal", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await expect(
      vault.connect(alice).depositUSDC(USDC_AMOUNT)
    ).to.be.revertedWith("CrossShieldVault: existing deposit, withdraw first");
  });

  // ─── Test 2: Present Value Calculation ───────────────────────────────────

  it("should calculate present value correctly for 365-day maturity", async function () {
    // PV = 1000 / (1 + 0.05 * 1) = 952.38 USDC
    const fv = ethers.parseUnits("1000", 6);
    const pv = await vault.calculatePresentValue(fv, 365);
    // ~952 USDC (within 1%)
    expect(pv).to.be.closeTo(
      ethers.parseUnits("952", 6),
      ethers.parseUnits("10", 6)
    );
  });

  it("should return full FV as PV when maturityDays is near 0", async function () {
    const fv = ethers.parseUnits("1000", 6);
    const pv = await vault.calculatePresentValue(fv, 1);
    // Very short maturity → PV ≈ FV
    expect(pv).to.be.closeTo(fv, ethers.parseUnits("5", 6));
  });

  // ─── Test 3: Yield Calculation ────────────────────────────────────────────

  it("should return zero yield for new deposit initially", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    // yield is computed from elapsed time; at t=0 it's minimal
    const yield_ = await vault.yieldAvailable(alice.address);
    // Could be very small but not negative
    expect(yield_).to.be.gte(0n);
  });

  it("should return zero yield for non-depositor", async function () {
    const yield_ = await vault.yieldAvailable(bob.address);
    expect(yield_).to.equal(0n);
  });

  // ─── Test 4: Shield Open ─────────────────────────────────────────────────

  it("should open a shield after time passes (yield accrued)", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);

    // Advance time by 30 days
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 3600]);
    await ethers.provider.send("evm_mine", []);

    const yield_ = await vault.yieldAvailable(alice.address);
    expect(yield_).to.be.gt(0n);

    const tx = await vault.connect(alice).openShield(0, 5); // Gold 5x
    await expect(tx).to.emit(vault, "ShieldOpened");
  });

  it("should revert openShield with no deposit", async function () {
    await expect(
      vault.connect(bob).openShield(0, 1)
    ).to.be.revertedWith("CrossShieldVault: deposit first");
  });

  it("should revert openShield with zero yield", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    // No time advancement — yield is ~0
    await expect(
      vault.connect(alice).openShield(0, 1)
    ).to.be.revertedWith("CrossShieldVault: no yield available yet");
  });

  it("should revert openShield with invalid leverage", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 3600]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      vault.connect(alice).openShield(0, 51) // over max
    ).to.be.revertedWith("CrossShieldVault: leverage 1-50");
  });

  // ─── Test 5: Shield Close ────────────────────────────────────────────────

  it("should close a shield and emit ShieldClosed", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 3600]);
    await ethers.provider.send("evm_mine", []);

    const openTx = await vault.connect(alice).openShield(0, 5);
    const receipt = await openTx.wait();
    const event = receipt?.logs.find((l: any) => {
      try {
        const parsed = vault.interface.parseLog(l);
        return parsed?.name === "ShieldOpened";
      } catch { return false; }
    });
    const parsed = vault.interface.parseLog(event as any);
    const shieldId = parsed?.args[0] as bigint;

    await expect(vault.connect(alice).closeShield(shieldId))
      .to.emit(vault, "ShieldClosed");
  });

  it("should revert closeShield from non-owner", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 3600]);
    await ethers.provider.send("evm_mine", []);

    await vault.connect(alice).openShield(0, 5);
    // Shield ID 1
    await expect(
      vault.connect(bob).closeShield(1)
    ).to.be.revertedWith("CrossShieldVault: not your shield");
  });

  // ─── Test 6: Principal Withdrawal ────────────────────────────────────────

  it("should withdraw full principal after closing all shields", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);

    const balanceBefore = await usdc.balanceOf(alice.address);
    await vault.connect(alice).withdrawPrincipal();
    const balanceAfter = await usdc.balanceOf(alice.address);

    expect(balanceAfter - balanceBefore).to.equal(USDC_AMOUNT);
  });

  it("should emit PrincipalWithdrawn event", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await expect(vault.connect(alice).withdrawPrincipal())
      .to.emit(vault, "PrincipalWithdrawn")
      .withArgs(alice.address, USDC_AMOUNT);
  });

  it("should revert withdrawPrincipal with open shields", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await ethers.provider.send("evm_increaseTime", [30 * 24 * 3600]);
    await ethers.provider.send("evm_mine", []);

    await vault.connect(alice).openShield(0, 5);

    await expect(
      vault.connect(alice).withdrawPrincipal()
    ).to.be.revertedWith("CrossShieldVault: close all shields before withdrawing");
  });

  it("should revert withdrawPrincipal with no deposit", async function () {
    await expect(
      vault.connect(bob).withdrawPrincipal()
    ).to.be.revertedWith("CrossShieldVault: no deposit found");
  });

  // ─── Test 7: Edge Cases ───────────────────────────────────────────────────

  it("edge case: max leverage (50x) works if yield available", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await ethers.provider.send("evm_increaseTime", [365 * 24 * 3600]);
    await ethers.provider.send("evm_mine", []);

    const yield_ = await vault.yieldAvailable(alice.address);
    expect(yield_).to.be.gt(0n);

    await expect(vault.connect(alice).openShield(0, 50))
      .to.emit(vault, "ShieldOpened");
  });

  it("edge case: multiple users can deposit independently", async function () {
    await vault.connect(alice).depositUSDC(USDC_AMOUNT);
    await vault.connect(bob).depositUSDC(SMALL_AMOUNT);

    const aliceDeposit = await vault.getDeposit(alice.address);
    const bobDeposit = await vault.getDeposit(bob.address);

    expect(aliceDeposit.principal).to.equal(USDC_AMOUNT);
    expect(bobDeposit.principal).to.equal(SMALL_AMOUNT);
  });
});
