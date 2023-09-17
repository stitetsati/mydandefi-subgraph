import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DurationBonusRateUpdated, MembershipInserted, MembershipUpdated, ReferralBonusRateUpdated } from "../generated/MyDanDefi/MyDanDefi";
import { handleMembershipInserted, handleMembershipUpdated, handleDurationBonusRateUpdated, handleReferralBonusRateUpdated } from "../src/mydandefi";
import { createDurationBonusRateUpdatedEvent, createMembershipInsertedEvent, createMembershipUpdatedEvent, createReferralBonusRateUpdatedEvent } from "./mydandefi-utils";

describe("test mydandefi event handlers", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  test("test handleMembershipInserted", () => {
    let event: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(0), "test", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(event);
    assert.entityCount("MembershipTier", 1);
    assert.fieldEquals("MembershipTier", "0x0", "name", "test");
  });
  test("test second handleMembershipInserted", () => {
    let event: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI32(1), "test2", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipInserted(event);
    assert.entityCount("MembershipTier", 2);
    assert.fieldEquals("MembershipTier", "0x1", "name", "test2");
  });
  test("test handleMembershipUpdated", () => {
    let event: MembershipUpdated = createMembershipUpdatedEvent(BigInt.fromI32(1), "test3", BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0));
    handleMembershipUpdated(event);
    assert.entityCount("MembershipTier", 2);
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
    assert.fieldEquals("Duration", "0x1", "bonusDepositInterestRate", "1");
  });
});
