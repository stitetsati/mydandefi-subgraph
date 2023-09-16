import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address } from "@graphprotocol/graph-ts";
import { Transfer, TransferFromCall } from "../generated/MyDanPass/MyDanPass";
import { handleTransfer } from "../src/mydan-pass";
import { createTransferEvent } from "./mydanpass-utils";
import { BigInt } from "@graphprotocol/graph-ts";
// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0
let zeroAddress: Address;
let toAddress: Address;
describe("Test MyDanPass event handlers", () => {
  beforeAll(() => {
    zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
    toAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    let tokenId = BigInt.fromI64(0);
    let transferEvent = createTransferEvent(zeroAddress, toAddress, tokenId);
    handleTransfer(transferEvent);
  });

  afterAll(() => {
    clearStore();
  });
  test("GenesisToken creation check", () => {
    assert.entityCount("User", 1);
    assert.fieldEquals("User", toAddress.toHex(), "id", toAddress.toHex());
    assert.entityCount("Profile", 1);
    assert.fieldEquals("Profile", "0x0", "referralCode", "mydandefi");
    assert.fieldEquals("Profile", "0x0", "tokenId", "0");
  });

  describe("Test second tokenId minted", () => {
    beforeAll(() => {
      let tokenId = BigInt.fromI64(1);
      let transferEvent = createTransferEvent(zeroAddress, zeroAddress, tokenId);
      handleTransfer(transferEvent);
    });
    test("First user creation should not create new entities", () => {
      assert.entityCount("User", 1);
      assert.fieldEquals("User", toAddress.toHex(), "id", toAddress.toHex());
      assert.entityCount("Profile", 1);
      assert.fieldEquals("Profile", "0x0", "referralCode", "mydandefi");
      assert.fieldEquals("Profile", "0x0", "tokenId", "0");
    });
  });
});
