import { assert, describe, test, clearStore, beforeAll, afterAll } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { MembershipInserted, MembershipUpdated } from "../generated/MyDanDefi/MyDanDefi";
import { handleMembershipInserted, handleMembershipUpdated } from "../src/mydandefi";
import { createMembershipInsertedEvent, createMembershipUpdatedEvent } from "./mydandefi-utils";

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
});
