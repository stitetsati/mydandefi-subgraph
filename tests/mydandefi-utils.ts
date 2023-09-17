import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { MembershipInserted, MembershipUpdated, DurationBonusRateUpdated, ReferralBonusRateUpdated } from "../generated/MyDanDefi/MyDanDefi";

export function createMembershipInsertedEvent(
  index: BigInt,
  name: string,
  lowerThreshold: BigInt,
  upperThreshold: BigInt,
  interestRate: BigInt,
  referralBonusCollectibleLevelLowerBound: BigInt,
  referralBonusCollectibleLevelUpperBound: BigInt,
): MembershipInserted {
  let membershipInsertedEvent = changetype<MembershipInserted>(newMockEvent());

  membershipInsertedEvent.parameters = new Array();
  let insertedEvent = new ethereum.Tuple();
  insertedEvent.push(ethereum.Value.fromString(name));
  insertedEvent.push(ethereum.Value.fromSignedBigInt(lowerThreshold));
  insertedEvent.push(ethereum.Value.fromSignedBigInt(upperThreshold));
  insertedEvent.push(ethereum.Value.fromSignedBigInt(interestRate));
  insertedEvent.push(ethereum.Value.fromSignedBigInt(referralBonusCollectibleLevelLowerBound));
  insertedEvent.push(ethereum.Value.fromSignedBigInt(referralBonusCollectibleLevelUpperBound));
  membershipInsertedEvent.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromSignedBigInt(index)));
  membershipInsertedEvent.parameters.push(new ethereum.EventParam("insertedMembershipTier", ethereum.Value.fromTuple(insertedEvent)));
  return membershipInsertedEvent;
}

export function createMembershipUpdatedEvent(
  index: BigInt,
  name: string,
  lowerThreshold: BigInt,
  upperThreshold: BigInt,
  interestRate: BigInt,
  referralBonusCollectibleLevelLowerBound: BigInt,
  referralBonusCollectibleLevelUpperBound: BigInt,
): MembershipUpdated {
  let membershipUpdatedEvent = changetype<MembershipUpdated>(newMockEvent());

  membershipUpdatedEvent.parameters = new Array();
  let updatedEvent = new ethereum.Tuple();
  updatedEvent.push(ethereum.Value.fromString(name));
  updatedEvent.push(ethereum.Value.fromSignedBigInt(lowerThreshold));
  updatedEvent.push(ethereum.Value.fromSignedBigInt(upperThreshold));
  updatedEvent.push(ethereum.Value.fromSignedBigInt(interestRate));
  updatedEvent.push(ethereum.Value.fromSignedBigInt(referralBonusCollectibleLevelLowerBound));
  updatedEvent.push(ethereum.Value.fromSignedBigInt(referralBonusCollectibleLevelUpperBound));
  membershipUpdatedEvent.parameters.push(new ethereum.EventParam("index", ethereum.Value.fromSignedBigInt(index)));
  membershipUpdatedEvent.parameters.push(new ethereum.EventParam("updatedMembershipTier", ethereum.Value.fromTuple(updatedEvent)));
  return membershipUpdatedEvent;
}

export function createDurationBonusRateUpdatedEvent(duration: BigInt, newRate: BigInt): DurationBonusRateUpdated {
  let durationBonusRateUpdatedEvent = changetype<DurationBonusRateUpdated>(newMockEvent());

  durationBonusRateUpdatedEvent.parameters = new Array();
  durationBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("duration", ethereum.Value.fromSignedBigInt(duration)));
  durationBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("newRate", ethereum.Value.fromSignedBigInt(newRate)));
  return durationBonusRateUpdatedEvent;
}

export function createReferralBonusRateUpdatedEvent(referralLevel: BigInt, bonusRate: BigInt): ReferralBonusRateUpdated {
  let referralBonusRateUpdatedEvent = changetype<ReferralBonusRateUpdated>(newMockEvent());

  referralBonusRateUpdatedEvent.parameters = new Array();
  referralBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("referralLevel", ethereum.Value.fromSignedBigInt(referralLevel)));
  referralBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("bonusRate", ethereum.Value.fromSignedBigInt(bonusRate)));
  return referralBonusRateUpdatedEvent;
}
