const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {

  let owner, addr1;  
  let lotteryContract;
  let lottery;
  let provider = ethers.getDefaultProvider();
  
  before(async function () {
    [owner, addr1] = await ethers.getSigners();  
    lotteryContract = await ethers.getContractFactory("Lottery");  
  });

  it("Should Set Entry Fee", async function () {

    lottery = await lotteryContract.deploy(1000000000000, 10);

    expect(await lottery.EntryFee()).to.equal(1000000000000);

    const setEntryFeeTx = await lottery.SetEntryFee(2000000000000);
    await setEntryFeeTx.wait();

    expect(await lottery.EntryFee()).to.equal(2000000000000);

    await expect(lottery.SetEntryFee(1)).to.be.revertedWith("Lottery is not cheap");

    await OpenLottery(lottery);
    await expect(lottery.SetEntryFee(1)).to.be.revertedWith("Lottery is not cheap").to.be.revertedWith("Lottery is not closed");
  });

  it("Should Set OwnerCut", async function () {   

    lottery = await lotteryContract.deploy(1000000000000, 10);
    expect(await lottery.OwnerCut()).to.equal(10);
    
    const setOwnerCutTx = await lottery.SetOwnerCutInPercent(5);
    await setOwnerCutTx.wait();

    expect(await lottery.OwnerCut()).to.equal(5);

    await OpenLottery(lottery);
    await expect(lottery.SetOwnerCutInPercent(1)).to.be.revertedWith("Lottery is not closed");
    await expect(lottery.SetOwnerCutInPercent(11)).to.be.revertedWith("Cant take more than 10%").to.be.revertedWith("Lottery is not closed");
  });

  it("Should Enter", async function () {   

    lottery = await lotteryContract.deploy(1000000000000, 10);
    await expect(owner.sendTransaction({to: lottery.Deposit(), value: 1000000000000})).to.be.revertedWith("Lottery is not OPEN yet");
    
    await OpenLottery(lottery);
    
    await expect(owner.sendTransaction({to: lottery.address, value: 5000000000000})).to.be.revertedWith("Please, pay the entry fee");
    await expect(await owner.sendTransaction({to: lottery.address, value: 1000000000000})).to.changeEtherBalance(lottery,1000000000000);
    
  });

  it("Should Start Lottery", async function () {   

    lottery = await lotteryContract.deploy(1000000000000, 10);   

    await OpenLottery(lottery);
    expect(await lottery.lottery_state()).to.equal(0);

    expect(lottery.StartLottery()).to.be.revertedWith("Can't start a new lottery yet");
    
  });

  it("Should PIck Winner", async function () {   

    lottery = await lotteryContract.deploy(1000000000000, 10);   

    await OpenLottery(lottery);

    expect(await owner.sendTransaction({to: lottery.address, value: 1000000000000})).to.changeEtherBalance(lottery,1000000000000);
    expect(await addr1.sendTransaction({to: lottery.address, value: 1000000000000})).to.changeEtherBalance(lottery,1000000000000);


    expect(await lottery.getContractBalance()).to.equal(2000000000000);

    expect(await lottery.PickWinner()).to.changeEtherBalance(owner,200000000000)
                                      .and.changeEtherBalance(lottery.recentWinner(),1800000000000);

    expect(await lottery.getContractBalance()).to.equal(0);

    expect(await lottery.lottery_state()).to.equal(1);    
  });
});

async function OpenLottery(lottery){
  const OpenLotteryTx = await lottery.StartLottery();
  await OpenLotteryTx.wait();
}