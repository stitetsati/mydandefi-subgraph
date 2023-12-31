import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { createMockedFunction } from "matchstick-as/assembly/index";
import {
  MembershipUpdated,
  DurationBonusRateUpdated,
  MembershipInserted,
  ReferralBonusRateUpdated,
  PassMinted,
  ReferralCodeCreated,
  ReferralBonusCreated,
  DepositCreated,
  MembershipTierChanged,
  InterestClaimed,
  ReferralBonusClaimed,
  ReferralBonusLevelCollectionActivated,
  ReferralBonusLevelCollectionDeactivated,
  DepositWithdrawn,
} from "../generated/MyDanDefi/MyDanDefi";

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
  durationBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("duration", ethereum.Value.fromUnsignedBigInt(duration)));
  durationBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("newRate", ethereum.Value.fromUnsignedBigInt(newRate)));
  return durationBonusRateUpdatedEvent;
}

export function createReferralBonusRateUpdatedEvent(referralLevel: BigInt, bonusRate: BigInt): ReferralBonusRateUpdated {
  let referralBonusRateUpdatedEvent = changetype<ReferralBonusRateUpdated>(newMockEvent());

  referralBonusRateUpdatedEvent.parameters = new Array();
  referralBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("referralLevel", ethereum.Value.fromUnsignedBigInt(referralLevel)));
  referralBonusRateUpdatedEvent.parameters.push(new ethereum.EventParam("bonusRate", ethereum.Value.fromUnsignedBigInt(bonusRate)));
  return referralBonusRateUpdatedEvent;
}

export function createPassMintedEvent(minter: Address, tokenId: BigInt, referrerTokenId: BigInt): PassMinted {
  let passMintedEvent = changetype<PassMinted>(newMockEvent());

  passMintedEvent.parameters = new Array();
  passMintedEvent.parameters.push(new ethereum.EventParam("minter", ethereum.Value.fromAddress(minter)));
  passMintedEvent.parameters.push(new ethereum.EventParam("mintedTokenId", ethereum.Value.fromSignedBigInt(tokenId)));
  passMintedEvent.parameters.push(new ethereum.EventParam("referrerTokenID", ethereum.Value.fromSignedBigInt(referrerTokenId)));
  return passMintedEvent;
}

export function createReferralCodeCreatedEvent(referralCode: string, tokenId: BigInt): ReferralCodeCreated {
  let referralCodeCreatedEvent = changetype<ReferralCodeCreated>(newMockEvent());

  referralCodeCreatedEvent.parameters = new Array();
  referralCodeCreatedEvent.parameters.push(new ethereum.EventParam("referralCode", ethereum.Value.fromString(referralCode)));
  referralCodeCreatedEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId)));
  return referralCodeCreatedEvent;
}

export function createDepositCreatedEvent(tokenId: BigInt, depositId: BigInt, amount: BigInt, duration: BigInt, interestRate: BigInt, interestReceivable: BigInt): DepositCreated {
  let depositCreatedEvent = changetype<DepositCreated>(newMockEvent());

  depositCreatedEvent.parameters = new Array();
  depositCreatedEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId)));
  depositCreatedEvent.parameters.push(new ethereum.EventParam("depositId", ethereum.Value.fromSignedBigInt(depositId)));
  depositCreatedEvent.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount)));
  depositCreatedEvent.parameters.push(new ethereum.EventParam("duration", ethereum.Value.fromSignedBigInt(duration)));
  depositCreatedEvent.parameters.push(new ethereum.EventParam("interestRate", ethereum.Value.fromSignedBigInt(interestRate)));
  depositCreatedEvent.parameters.push(new ethereum.EventParam("interestReceivable", ethereum.Value.fromSignedBigInt(interestReceivable)));
  return depositCreatedEvent;
}

export function createReferralBonusCreatedEvent(referrerTokenId: BigInt, referralBonusId: BigInt, referralLevel: BigInt, depositId: BigInt): ReferralBonusCreated {
  let referralBonusCreatedEvent = changetype<ReferralBonusCreated>(newMockEvent());
  referralBonusCreatedEvent.parameters = new Array();
  referralBonusCreatedEvent.parameters.push(new ethereum.EventParam("referrerTokenId", ethereum.Value.fromSignedBigInt(referrerTokenId)));
  referralBonusCreatedEvent.parameters.push(new ethereum.EventParam("referralBonusId", ethereum.Value.fromSignedBigInt(referralBonusId)));
  referralBonusCreatedEvent.parameters.push(new ethereum.EventParam("referralLevel", ethereum.Value.fromSignedBigInt(referralLevel)));
  referralBonusCreatedEvent.parameters.push(new ethereum.EventParam("depositId", ethereum.Value.fromSignedBigInt(depositId)));
  let contractAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
  let zero = ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(0));
  let startTime = zero;
  let maturity = ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(365 * 60 * 60 * 24));
  let referralBonusReceivable = ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(6_000000));
  let rewardClaimed = zero;
  let lastClaimedAt = zero;
  let depositIdParam = ethereum.Value.fromUnsignedBigInt(depositId);
  let referralLevelParam = ethereum.Value.fromUnsignedBigInt(referralLevel);
  createMockedFunction(contractAddress, "referralBonuses", "referralBonuses(uint256,uint256):(uint256,uint256,uint256,uint256,uint256,uint256,uint256)")
    .withArgs([zero, zero])
    .returns([referralLevelParam, startTime, maturity, referralBonusReceivable, rewardClaimed, lastClaimedAt, depositIdParam]);

  return referralBonusCreatedEvent;
}
export function createInterestClaimedEvent(tokenId: BigInt, depositId: BigInt, interestCollectible: BigInt): InterestClaimed {
  let interestClaimedEvent = changetype<InterestClaimed>(newMockEvent());

  interestClaimedEvent.parameters = new Array();
  interestClaimedEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId)));
  interestClaimedEvent.parameters.push(new ethereum.EventParam("depositId", ethereum.Value.fromSignedBigInt(depositId)));
  interestClaimedEvent.parameters.push(new ethereum.EventParam("interestCollectible", ethereum.Value.fromSignedBigInt(interestCollectible)));
  return interestClaimedEvent;
}
export function createReferralBonusClaimedEvent(tokenId: BigInt, referralBonusId: BigInt, rewardCollectible: BigInt): ReferralBonusClaimed {
  let referralBonusClaimedEvent = changetype<ReferralBonusClaimed>(newMockEvent());

  referralBonusClaimedEvent.parameters = new Array();
  referralBonusClaimedEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId)));
  referralBonusClaimedEvent.parameters.push(new ethereum.EventParam("referralBonusId", ethereum.Value.fromSignedBigInt(referralBonusId)));
  referralBonusClaimedEvent.parameters.push(new ethereum.EventParam("rewardCollectible", ethereum.Value.fromSignedBigInt(rewardCollectible)));
  referralBonusClaimedEvent.block.timestamp = BigInt.fromU64(1_000_000_000_000);
  return referralBonusClaimedEvent;
}

export function createDepositWithdrawnEvent(tokenId: BigInt, depositId: BigInt, principal: BigInt): DepositWithdrawn {
  let depositWithdrawnEvent = changetype<DepositWithdrawn>(newMockEvent());

  depositWithdrawnEvent.parameters = new Array();
  depositWithdrawnEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId)));
  depositWithdrawnEvent.parameters.push(new ethereum.EventParam("depositId", ethereum.Value.fromSignedBigInt(depositId)));
  depositWithdrawnEvent.parameters.push(new ethereum.EventParam("principal", ethereum.Value.fromSignedBigInt(principal)));
  return depositWithdrawnEvent;
}

// event InterestClaimed(uint256 tokenId, uint256 depositId, uint256 interestCollectible);

// event ReferralBonusCreated(uint256 referrerTokenId, uint256 referralBonusId, uint256 referralLevel);
// event DepositCreated(uint256 tokenId, uint256 depositId, uint256 amount, uint256 duration, uint256 interestRate, uint256 interestReceivable);
// event MembershipTierChanged(uint256 tokenId, uint256 membershipTierIndex);
// event InterestClaimed(uint256 tokenId, uint256 depositId, uint256 interestCollectible);
// event ReferralBonusClaimed(uint256 tokenId, uint256 referralBonusId, uint256 rewardCollectible);
// event ReferralBonusLevelCollectionActivated(uint256 tokenId, uint256 referralLevel, uint256 logIndex, uint256 timestamp);
// event ReferralBonusLevelCollectionDeactivated(uint256 tokenId, uint256 referralLevel, uint256 logIndex, uint256 timestamp);
// event DepositWithdrawn(uint256 tokenId, uint256 depositId, uint256 principal);
// event ReferralBonusRateUpdated(uint256 referralLevel, uint256 bonusRate);
