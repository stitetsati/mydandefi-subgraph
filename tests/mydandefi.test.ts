import { assert, describe, test, clearStore, beforeAll, afterAll, afterEach, beforeEach } from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { DurationBonusRateUpdated, MembershipInserted, MembershipUpdated, ReferralBonusRateUpdated } from "../generated/MyDanDefi/MyDanDefi";
import {
  handleDepositWithdrawn,
  handleReferralBonusCreated,
  handleDepositCreated,
  handleMembershipInserted,
  handleMembershipUpdated,
  handleDurationBonusRateUpdated,
  handleReferralBonusRateUpdated,
  handlePassMinted,
  handleReferralCodeCreated,
  handleInterestClaimed,
  handleReferralBonusClaimed,
} from "../src/mydandefi";
import {
  createDepositWithdrawnEvent,
  createReferralBonusClaimedEvent,
  createReferralBonusCreatedEvent,
  createReferralCodeCreatedEvent,
  createPassMintedEvent,
  createDurationBonusRateUpdatedEvent,
  createMembershipInsertedEvent,
  createMembershipUpdatedEvent,
  createReferralBonusRateUpdatedEvent,
  createDepositCreatedEvent,
  createInterestClaimedEvent,
} from "./mydandefi-utils";
import { handleTransfer } from "../src/mydanpass";
import { createTransferEvent } from "./mydanpass-utils";

let zeroAddress: Address;
let toAddress: Address;
describe("test mydandefi event handlers without setup", () => {
  beforeEach(() => {
    zeroAddress = Address.fromString("0x0000000000000000000000000000000000000000");
    toAddress = Address.fromString("0x0000000000000000000000000000000000000001");
    handleTransfer(createTransferEvent(zeroAddress, toAddress, BigInt.fromI64(0)));
  });

  afterEach(() => {
    clearStore();
  });

  test("test handleMembershipInserted", () => {
    let event: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI64(0), "test", BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0));
    handleMembershipInserted(event);
    assert.entityCount("MembershipTier", 1);
    assert.fieldEquals("MembershipTier", "0x0", "name", "test");
    assert.fieldEquals("Profile", "0x0", "membershipTier", "0x0");
  });
  test("test second handleMembershipInserted", () => {
    let fristEvent: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI64(0), "test", BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0));
    handleMembershipInserted(fristEvent);
    let secondEvent: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI64(1), "test2", BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0));
    handleMembershipInserted(secondEvent);
    assert.entityCount("MembershipTier", 2);
    assert.fieldEquals("MembershipTier", "0x1", "name", "test2");
  });
  test("test handleMembershipUpdated", () => {
    let membershipInsertedEvent: MembershipInserted = createMembershipInsertedEvent(
      BigInt.fromI64(1),
      "test2",
      BigInt.fromI64(0),
      BigInt.fromI64(0),
      BigInt.fromI64(0),
      BigInt.fromI64(0),
      BigInt.fromI64(0),
    );
    handleMembershipInserted(membershipInsertedEvent);
    let event: MembershipUpdated = createMembershipUpdatedEvent(BigInt.fromI64(1), "test3", BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0));
    handleMembershipUpdated(event);
    assert.entityCount("MembershipTier", 1);
    assert.fieldEquals("MembershipTier", "0x1", "name", "test3");
  });
  test("test handleDurationBonusRateUpdated", () => {
    let event: DurationBonusRateUpdated = createDurationBonusRateUpdatedEvent(BigInt.fromI64(1), BigInt.fromI64(1));
    handleDurationBonusRateUpdated(event);
    assert.entityCount("Duration", 1);
    assert.fieldEquals("Duration", "0x1", "bonusDepositInterestRate", "1");
  });
  test("test handleReferralBonusRateUpdated", () => {
    let event: ReferralBonusRateUpdated = createReferralBonusRateUpdatedEvent(BigInt.fromI64(1), BigInt.fromI64(1));
    handleReferralBonusRateUpdated(event);
    assert.entityCount("ReferralLevel", 1);
    assert.fieldEquals("ReferralLevel", "0x1", "referralBonusRate", "1");
  });
  test("test handlePassMinted", () => {
    // create non tier
    let noneTier: MembershipInserted = createMembershipInsertedEvent(BigInt.fromI64(0), "None", BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0));
    handleMembershipInserted(noneTier);
    // create genesis user
    assert.entityCount("User", 1);
    let tokenId = BigInt.fromI64(1);
    let referrerTokenId = BigInt.fromI64(0);
    let minter = (toAddress = Address.fromString("0x0000000000000000000000000000000000000003"));
    let event = createPassMintedEvent(minter, tokenId, referrerTokenId);
    handlePassMinted(event);
    assert.entityCount("User", 2);
    assert.entityCount("Profile", 2);
    assert.fieldEquals("Profile", "0x1", "tokenId", "1");
  });
  test("test handleReferralCodeCreated", () => {
    // mint one user pass
    let tokenId = BigInt.fromI64(1);
    let referrerTokenId = BigInt.fromI64(0);
    let minter = (toAddress = Address.fromString("0x0000000000000000000000000000000000000003"));
    let passMintedEvent = createPassMintedEvent(minter, tokenId, referrerTokenId);
    handlePassMinted(passMintedEvent);
    let event = createReferralCodeCreatedEvent("hello", BigInt.fromI64(1));
    handleReferralCodeCreated(event);
    assert.fieldEquals("Profile", "0x1", "referralCode", "hello");
  });
});

let user: Address;
describe("test mydandefi event handlers with setup", () => {
  beforeAll(() => {
    // create genesis user
    user = Address.fromString("0x000000000000000000000000000000000000dead");
    handleTransfer(createTransferEvent(zeroAddress, user, BigInt.fromI64(0)));
    // create one user
    handlePassMinted(createPassMintedEvent(user, BigInt.fromI64(1), BigInt.fromI64(0)));
    // set tiers
    handleMembershipInserted(createMembershipInsertedEvent(BigInt.fromI64(0), "None", BigInt.fromI64(0), BigInt.fromI64(100), BigInt.fromI64(0), BigInt.fromI64(0), BigInt.fromI64(0)));
    handleMembershipInserted(
      createMembershipInsertedEvent(BigInt.fromI64(1), "Sapphire", BigInt.fromI64(100_000000), BigInt.fromI64(1000_000000), BigInt.fromI64(700), BigInt.fromI64(1), BigInt.fromI64(3)),
    );
    handleMembershipInserted(
      createMembershipInsertedEvent(BigInt.fromI64(2), "Emerald", BigInt.fromI64(1000_000000), BigInt.fromI64(10000_000000), BigInt.fromI64(750), BigInt.fromI64(4), BigInt.fromI64(5)),
    );
    handleMembershipInserted(
      createMembershipInsertedEvent(BigInt.fromI64(3), "Imperial", BigInt.fromI64(10000_000000), BigInt.fromI64(9_999_999_000000), BigInt.fromI64(800), BigInt.fromI64(6), BigInt.fromI64(7)),
    );
    // set duration bonus
    let oneMonth = 30 * 60 * 60 * 24;
    let oneYear = 365 * 60 * 60 * 24;
    handleDurationBonusRateUpdated(createDurationBonusRateUpdatedEvent(BigInt.fromI64(3 * oneMonth), BigInt.fromI64(0)));
    handleDurationBonusRateUpdated(createDurationBonusRateUpdatedEvent(BigInt.fromI64(6 * oneMonth), BigInt.fromI64(0)));
    handleDurationBonusRateUpdated(createDurationBonusRateUpdatedEvent(BigInt.fromI64(9 * oneMonth), BigInt.fromI64(0)));
    handleDurationBonusRateUpdated(createDurationBonusRateUpdatedEvent(BigInt.fromI64(oneYear), BigInt.fromI64(50)));
    handleDurationBonusRateUpdated(createDurationBonusRateUpdatedEvent(BigInt.fromI64(2 * oneYear), BigInt.fromI64(75)));
    handleDurationBonusRateUpdated(createDurationBonusRateUpdatedEvent(BigInt.fromI64(3 * oneYear), BigInt.fromI64(100)));
    // set referral bonus
    let referralBonusRates = [0, 600, 200, 200, 100, 100, 100, 100];
    for (let i = 0; i < referralBonusRates.length; i++) {
      handleReferralBonusRateUpdated(createReferralBonusRateUpdatedEvent(BigInt.fromI64(i), BigInt.fromI64(referralBonusRates[i])));
    }
  });
  afterAll(() => {
    clearStore();
  });
  test("test handleDepositCreated", () => {
    let tokenId = BigInt.fromI64(1);
    let depositId = BigInt.fromI64(0);
    let amount = BigInt.fromI64(100_000000);
    let duration = BigInt.fromI64(365 * 60 * 60 * 24);
    let durationId = duration.toHex();
    let interestRate = BigInt.fromI64(700);
    let interestReceivable = BigInt.fromI64(7_000000);
    let event = createDepositCreatedEvent(tokenId, depositId, amount, duration, interestRate, interestReceivable);
    handleDepositCreated(event);

    assert.entityCount("Deposit", 1);
    assert.fieldEquals("Deposit", "0x0", "depositor", "0x1");
    assert.fieldEquals("Deposit", "0x0", "principal", "100");
    assert.fieldEquals("Deposit", "0x0", "duration", durationId);
    assert.fieldEquals("Deposit", "0x0", "interestReceivable", "7");
    assert.fieldEquals("Deposit", "0x0", "annualizedInterestReceivable", "7");
    assert.fieldEquals("Deposit", "0x0", "interestCollected", "0");
    assert.fieldEquals("Deposit", "0x0", "lastClaimedAt", "0");
    assert.fieldEquals("Profile", "0x1", "totalDeposits", "100");
  });
  test("test handleReferralBonusCreated", () => {
    let referralTokenId = BigInt.fromI64(0);
    let referralBonusId = BigInt.fromI64(0);
    let referralLevel = BigInt.fromI64(1);
    let depositId = BigInt.fromI64(0);
    handleReferralBonusCreated(createReferralBonusCreatedEvent(referralTokenId, referralBonusId, referralLevel, depositId));
    assert.entityCount("ReferralBonus", 1);
    assert.fieldEquals("ReferralBonus", "0x0", "referralLevel", BigInt.fromU64(1).toHex());
    assert.fieldEquals("ReferralBonus", "0x0", "beneficiary", "0x0");
    assert.fieldEquals("ReferralBonus", "0x0", "associatedDeposit", "0x0");
    assert.fieldEquals("ReferralBonus", "0x0", "bonusReceivable", "6");
    assert.fieldEquals("ReferralBonus", "0x0", "annualizedBonusReceivable", "6");
    assert.fieldEquals("ReferralBonus", "0x0", "bonusClaimed", "0");
    // TODO: test ProfileReferralLevelData
    assert.entityCount("ProfileReferralLevelData", 1);
    assert.fieldEquals("ProfileReferralLevelData", "0x0-0x1", "totalAnnualizedReferralBonuses", "6");
  });
  test("test handleInterestClaimed", () => {
    let tokenId = BigInt.fromI64(1);
    let depositId = BigInt.fromI64(0);
    let interestCollectible = BigInt.fromI64(7_000000);
    let event = createInterestClaimedEvent(tokenId, depositId, interestCollectible);
    handleInterestClaimed(event);
    assert.fieldEquals("Deposit", "0x0", "interestCollected", "7");
  });
  test("test handledReferralBonusClaimed", () => {
    let tokenId = BigInt.fromI64(0);
    let referralBonusId = BigInt.fromI64(0);
    let rewardCollectible = BigInt.fromI64(6_000000);
    let event = createReferralBonusClaimedEvent(tokenId, referralBonusId, rewardCollectible);
    handleReferralBonusClaimed(event);
    assert.fieldEquals("ReferralBonus", "0x0", "bonusClaimed", "6");
  });
  test("test handleDepositWithdrawn", () => {
    let tokenId = BigInt.fromI64(1);
    let depositId = BigInt.fromI64(0);
    let principal = BigInt.fromI64(100_000000);
    let event = createDepositWithdrawnEvent(tokenId, depositId, principal);

    handleDepositWithdrawn(event);
    assert.entityCount("Deposit", 1);
    assert.fieldEquals("Deposit", "0x0", "isWithdrawn", "true");
    assert.fieldEquals("Profile", "0x1", "totalDeposits", "0");

    assert.fieldEquals("Profile", "0x1", "totalDeposits", "0");
  });
});
