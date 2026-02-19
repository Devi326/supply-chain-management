import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("SupplyChain", function () {
    let supplyChain;
    let owner;
    let seller;

    beforeEach(async function () {
        [owner, seller] = await ethers.getSigners();
        const SupplyChain = await ethers.getContractFactory("SupplyChain");
        supplyChain = await SupplyChain.deploy();
        await supplyChain.waitForDeployment();
    });

    it("Should record a sale correctly", async function () {
        const saleId = 101;
        const productId = 500;
        const productName = "EV Motor 900W";
        const qty = 2;
        const price = 120000; // 1200.00 in paise

        await expect(supplyChain.connect(seller).recordSale(saleId, productId, productName, qty, price))
            .to.emit(supplyChain, "SaleRecorded")
            .withArgs(saleId, productId, productName, qty, price, seller.address, (v) => true);

        const sale = await supplyChain.getSale(saleId);
        expect(sale._saleId).to.equal(saleId);
        expect(sale._productId).to.equal(productId);
        expect(sale._productName).to.equal(productName);
        expect(sale._qty).to.equal(qty);
        expect(sale._price).to.equal(price);
        expect(sale._seller).to.equal(seller.address);
    });

    it("Should fail if recording the same sale ID twice", async function () {
        await supplyChain.recordSale(1, 1, "P1", 1, 100);
        await expect(supplyChain.recordSale(1, 1, "P1", 1, 100))
            .to.be.revertedWith("SupplyChain: sale ID already recorded");
    });

    it("Should track total sales", async function () {
        await supplyChain.recordSale(1, 1, "P1", 1, 100);
        await supplyChain.recordSale(2, 2, "P2", 1, 200);
        expect(await supplyChain.totalSales()).to.equal(2);
        const ids = await supplyChain.getAllSaleIds();
        expect(ids.length).to.equal(2);
        expect(ids[0]).to.equal(1);
        expect(ids[1]).to.equal(2);
    });
});
