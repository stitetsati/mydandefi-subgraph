import { assert, describe, test, clearStore, beforeAll, afterAll, afterEach,beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DurationBonusRateUpdated, MembershipInserted, MembershipUpdated, ReferralBonusRateUpdated } from "../generated/MyDanDefi/MyDanDefi";
import { handleMembershipInserted, handleMembershipUpdated, handleDurationBonusRateUpdated, handleReferralBonusRateUpdated, handlePassMinted, handleReferralCodeCreated } from "../src/mydandefi";
import {
  createReferralCodeCreatedEvent,
  createPassMintedEvent,
  createDurationBonusRateUpdatedEvent,
  createMembershipInsertedEvent,
  createMembershipUpdatedEvent,
  createReferralBonusRateUpdatedEvent,
} from "./mydandefi-utils";
import { handleTransfer } from "../src/mydanpass";
import { createTransferEvent } from "./mydanpass-utils";

let zeroAddress: Address;
let toAddress: Address;
describe("test mydandefi event handlers", () => {
  beforeEach(() => {
    zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
    toAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    handleTransfer(createTransferEvent(zeroAddress, toAddress, BigInt.fromI32(0)));
  });

  afterEach(() => {
    clearStore();
  });

  test("test handleMembershipInserted", () => {
    let event: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(0), "test", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(event);
    assert.entityCount("MembershipTier", 1);
    assert.fieldEquals("MembershipTier", "0x0", "name", "test");
    assert.fieldEquals("Profile", "0x0", "membershipTier", "0x0");
  });
  test("test second handleMembershipInserted", () => {
    let fristEvent: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(0), "test", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(fristEvent);
    let secondEvent: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(1), "test2", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(secondEvent);
    assert.entityCount("MembershipTier", 2);
    assert.fieldEquals("MembershipTier", "0x1", "name", "test2");
  });
  test("test handleMembershipUpdated", () => {
    let membershipInsertedEvent: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(1), "test2", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(membershipInsertedEvent)
    let event: MembershipUpdated = createMembershipUpdatedEvent(BigInt.fromI32(1), "test3", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipUpdated(event);
    assert.entityCount("MembershipTier", 1);
    assert.fieldEquals("MembershipTier", "0x1", "name", "test3");
  });
  test("test handleDurationBonusRateUpdated", () => {
    let event: DurationBonusRateUpdated = createDurationBonusRateUpdatedEvent(BigInt.fromI32(1), BigInt.fromI32(1));
    handleDurationBonusRateUpdated(event);
    assert.entityCount("Duration", 1);
    assert.fieldEquals("Duration", "0x1", "bonusDepositInterestRate", "1");
  });
  test("test handleReferralBonusRateUpdated", () => {
    let event: ReferralBonusRateUpdated = createReferralBonusRateUpdatedEvent(BigInt.fromI32(1), BigInt.fromI32(1));
    handleReferralBonusRateUpdated(event);
    assert.entityCount("ReferralLevel", 1);
    assert.fieldEquals("ReferralLevel", "0x1", "referralBonusRate", "1");
  });
  test("test handlePassMinted", () => {
    // create non tier
    let noneTier: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(0), "None", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(noneTier);
    // create genesis user
    assert.entityCount("User", 1);
    let tokenId = BigInt.fromI32(1);
    let referrerTokenId = BigInt.fromI32(0);
    let minter = (toAddress = Address.fromString("0x0000000000000000000000000000000000000003"));
    let event = createPassMintedEvent(minter, tokenId, referrerTokenId);
    handlePassMinted(event);
    assert.entityCount("User", 2);
    assert.entityCount("Profile", 2);
    assert.fieldEquals("Profile", "0x1", "tokenId", "1");
  });
  test("test handleReferralCodeCreated", () => {
    // mint one user pass
    let tokenId = BigInt.fromI32(1);
    let referrerTokenId = BigInt.fromI32(0);
    let minter = (toAddress = Address.fromString("0x0000000000000000000000000000000000000003"));
    let passMintedEvent = createPassMintedEvent(minter, tokenId, referrerTokenId);
    handlePassMinted(passMintedEvent);
    let event = createReferralCodeCreatedEvent("hello", BigInt.fromI32(1));
    handleReferralCodeCreated(event);
    assert.fieldEquals("Profile", "0x1", "referralCode", "hello");
  });
});
