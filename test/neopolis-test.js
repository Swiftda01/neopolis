const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Neopolis", function () {
  let contract;
  let neopolis;
  let owner;
  let addr1;
  let addr2;
  const initialOwnerBalance = 1000;

  beforeEach(async function () {
    contract = await ethers.getContractFactory("Neopolis");
    [owner, addr1, addr2] = await ethers.getSigners();

    neopolis = await contract.deploy(initialOwnerBalance);
  });

  describe("constructor", function () {
    it("should assign the total supply of tokens minus the height of initial tower to the owner", async function () {
      const ownerBalance = await neopolis.balanceOf(owner.address);
      const initialTowerHeight = await neopolis.initialTowerHeight();

      expect((await neopolis.totalSupply()) - initialTowerHeight).to.equal(
        ownerBalance
      );
    });

    it("should initialize a starting tower", async function () {
      const initialTowerHeight = await neopolis.initialTowerHeight();
      const initialTowerPosition = await neopolis.initialTowerPosition();

      expect(await neopolis.heightOf(initialTowerPosition)).to.equal(
        initialTowerHeight
      );
      expect(await neopolis.totalBalanceInPlay()).to.equal(initialTowerHeight);
    });
  });

  describe("totalSupply", function () {
    it("should return the total supply of tokens", async function () {
      const initialTowerHeight = await neopolis.initialTowerHeight();

      expect(await neopolis.totalSupply()).to.equal(
        initialOwnerBalance + parseInt(initialTowerHeight)
      );
    });
  });

  describe("balanceOf", function () {
    it("should return the balance of an account", async function () {
      expect(await neopolis.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("transfer", function () {
    it("should transfer tokens between accounts", async function () {
      const amountTransferredToAddr1 = 50;
      await neopolis.transfer(addr1.address, amountTransferredToAddr1);
      const ownerBalance = await neopolis.balanceOf(owner.address);
      let addr1Balance = await neopolis.balanceOf(addr1.address);
      expect(ownerBalance).to.equal(
        initialOwnerBalance - amountTransferredToAddr1
      );
      expect(addr1Balance).to.equal(amountTransferredToAddr1);

      const amountTransferredToAddr2 = 10;
      await neopolis
        .connect(addr1)
        .transfer(addr2.address, amountTransferredToAddr2);
      addr1Balance = await neopolis.balanceOf(addr1.address);
      const addr2Balance = await neopolis.balanceOf(addr2.address);
      expect(addr1Balance).to.equal(
        amountTransferredToAddr1 - amountTransferredToAddr2
      );
      expect(addr2Balance).to.equal(amountTransferredToAddr2);
    });

    it("should emit a Transfer event", async function () {
      const amountTransferredToAddr1 = 50;
      await neopolis.transfer(addr1.address, amountTransferredToAddr1);

      await expect(neopolis.transfer(addr1.address, amountTransferredToAddr1))
        .to.emit(neopolis, "Transfer")
        .withArgs(owner.address, addr1.address, amountTransferredToAddr1);
    });

    it("should fail if sender account doesn’t have enough tokens", async function () {
      await expect(
        neopolis.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Error: Transfer amount exceeds account balance");

      expect(await neopolis.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("approve", function () {
    it("should approve a withdrawable amount from one account to another", async function () {
      const ownerToAddr1AllowedAmount = 60;

      await neopolis.approve(addr1.address, ownerToAddr1AllowedAmount);

      expect(await neopolis.allowance(owner.address, addr1.address)).to.equal(
        ownerToAddr1AllowedAmount
      );
    });
  });

  describe("transferFrom", function () {
    it("should transfer approved withdrawable tokens between accounts", async function () {
      const ownerToAddr1AllowedAmount = 60;
      const allowedAmountTransferredToAddr2 = 50;

      await neopolis.approve(addr1.address, ownerToAddr1AllowedAmount);
      await neopolis
        .connect(addr1)
        .transferFrom(
          owner.address,
          addr2.address,
          allowedAmountTransferredToAddr2
        );

      expect(await neopolis.balanceOf(owner.address)).to.equal(
        initialOwnerBalance - allowedAmountTransferredToAddr2
      );
      expect(await neopolis.balanceOf(addr2.address)).to.equal(
        allowedAmountTransferredToAddr2
      );
      expect(await neopolis.allowance(owner.address, addr1.address)).to.equal(
        ownerToAddr1AllowedAmount - allowedAmountTransferredToAddr2
      );
    });

    it("should emit a Transfer event", async function () {
      const ownerToAddr1AllowedAmount = 60;
      const allowedAmountTransferredToAddr2 = 50;

      await neopolis.approve(addr1.address, ownerToAddr1AllowedAmount);

      await expect(
        neopolis
          .connect(addr1)
          .transferFrom(
            owner.address,
            addr2.address,
            allowedAmountTransferredToAddr2
          )
      )
        .to.emit(neopolis, "Transfer")
        .withArgs(
          owner.address,
          addr2.address,
          allowedAmountTransferredToAddr2
        );
    });

    it("should fail if approver account doesn’t have enough tokens", async function () {
      const ownerToAddr1AllowedAmount = initialOwnerBalance + 100;

      await neopolis.approve(addr1.address, ownerToAddr1AllowedAmount);

      await expect(
        neopolis
          .connect(addr1)
          .transferFrom(owner.address, addr2.address, ownerToAddr1AllowedAmount)
      ).to.be.revertedWith("Error: transfer amount exceeds account balance");

      expect(await neopolis.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("should fail if transfer from amount exceeds approved withdrawable amount", async function () {
      const ownerToAddr1AllowedAmount = 60;

      await neopolis.approve(addr1.address, ownerToAddr1AllowedAmount);

      await expect(
        neopolis
          .connect(addr1)
          .transferFrom(
            owner.address,
            addr2.address,
            ownerToAddr1AllowedAmount + 10
          )
      ).to.be.revertedWith(
        "Error: transfer amount exceeds approved withdrawal amount"
      );

      expect(await neopolis.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("totalBalanceInPlay", function () {
    it("should return the total number of tokens in play", async function () {
      const initialTowerHeight = await neopolis.initialTowerHeight();

      expect(await neopolis.totalBalanceInPlay()).to.equal(initialTowerHeight);
    });
  });

  describe("heightOf", function () {
    it("should return the height of a tower", async function () {
      const initialTowerHeight = await neopolis.initialTowerHeight();
      const initialTowerPosition = await neopolis.initialTowerPosition();

      expect(await neopolis.heightOf(initialTowerPosition)).to.equal(
        initialTowerHeight
      );
    });
  });

  describe("place", function () {
    it("should add to the height a tower if the tower doesn't topple", async function () {
      const position = 2;
      const initialTowerHeight = await neopolis.initialTowerHeight();

      await neopolis.place(position);

      const ownerBalance = await neopolis.balanceOf(owner.address);
      const towerHeight = await neopolis.heightOf(position);
      const totalBalanceInPlay = await neopolis.totalBalanceInPlay();

      expect(ownerBalance).to.equal(initialOwnerBalance - 1);
      expect(towerHeight).to.equal(1);
      expect(totalBalanceInPlay).to.equal(parseInt(initialTowerHeight) + 1);
    });

    it("should transfer tokens equal to the height of a tower to the placer if the tower topples", async function () {
      const position = await neopolis.initialTowerPosition();
      const initialTowerHeight = await neopolis.initialTowerHeight();

      await neopolis.transfer(addr1.address, 1);
      await neopolis.connect(addr1).place(position);

      const add1Balance = await neopolis.balanceOf(addr1.address);
      const towerHeight = await neopolis.heightOf(position);
      const totalBalanceInPlay = await neopolis.totalBalanceInPlay();

      expect(add1Balance).to.equal(parseInt(initialTowerHeight) + 1);
      expect(towerHeight).to.equal(0);
      expect(totalBalanceInPlay).to.equal(0);
    });

    it("should emit a Placement event", async function () {
      await expect(neopolis.place(2))
        .to.emit(neopolis, "Placement")
        .withArgs(2, 1);
    });

    it("should fail if placer account doesn’t have at least one token", async function () {
      await expect(neopolis.connect(addr1).place(2)).to.be.revertedWith(
        "Error: account has no available balance to place"
      );
    });

    it("should fail if placement position is less than zero", async function () {
      await expect(neopolis.place(-1)).to.be.reverted;
    });

    it("should fail if placement position is greater than twenty", async function () {
      await expect(neopolis.place(21)).to.be.reverted;
    });
  });
});
