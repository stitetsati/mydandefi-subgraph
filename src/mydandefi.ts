import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  MembershipUpdated,
  DurationBonusRateUpdated,
  MembershipInserted,
  ReferralBonusRateUpdated,
  PassMinted,
  ReferralCodeCreated,
  ReferralRewardCreated,
  DepositCreated,
  MembershipTierChanged,
  InterestClaimed,
  ReferralBonusClaimed,
  ReferralBonusLevelCollectionActivated,
  ReferralBonusLevelCollectionDeactivated,
  DepositWithdrawn,
} from "../generated/MyDanDefi/MyDanDefi";
import { ReferralLevel, Duration, MembershipTier, Profile, User, Deposit } from "../generated/schema";
import { exponentToBigDecimal, loadUser, createProfile } from "./utils";

export function handleMembershipInserted(event: MembershipInserted): void {
  let insertedMembershipTier = event.params.insertedMembershipTier;
  let membershipTier = new MembershipTier(event.params.index.toHex());
  membershipTier.name = insertedMembershipTier.name;
  membershipTier.lowerAmountThreshold = insertedMembershipTier.lowerThreshold.toBigDecimal().div(exponentToBigDecimal(6)).truncate(6);
  membershipTier.upperAmountThreshold = insertedMembershipTier.upperThreshold.toBigDecimal().div(exponentToBigDecimal(6)).truncate(6);
  membershipTier.interestRate = insertedMembershipTier.interestRate.toBigDecimal();
  membershipTier.maxCollectableReferralLevel = insertedMembershipTier.referralBonusCollectibleLevelUpperBound;
  membershipTier.totalDeposits = BigDecimal.fromString("0");
  membershipTier.index = event.params.index;
  membershipTier.save();
  if (membershipTier.index == BigInt.fromI32(0)) {
    let genesisProfile = Profile.load("0x0");
    if (genesisProfile != null) {
      genesisProfile.membershipTier = membershipTier.id;
      genesisProfile.save();
    }
  }
}

export function handleMembershipUpdated(event: MembershipUpdated): void {
  let updatedMembershipTier = event.params.updatedMembershipTier;
  let membershipTier = MembershipTier.load(event.params.index.toHex())!;
  membershipTier.name = updatedMembershipTier.name;
  membershipTier.lowerAmountThreshold = updatedMembershipTier.lowerThreshold.toBigDecimal().div(exponentToBigDecimal(6)).truncate(6);
  membershipTier.upperAmountThreshold = updatedMembershipTier.upperThreshold.toBigDecimal().div(exponentToBigDecimal(6)).truncate(6);
  membershipTier.interestRate = updatedMembershipTier.interestRate.toBigDecimal();
  membershipTier.maxCollectableReferralLevel = updatedMembershipTier.referralBonusCollectibleLevelUpperBound;
  membershipTier.save();
}
export function handleDurationBonusRateUpdated(event: DurationBonusRateUpdated): void {
  let duration = Duration.load(event.params.duration.toHex());
  if (duration == null) {
    duration = new Duration(event.params.duration.toHex());
    duration.duration = event.params.duration;
  }
  duration.bonusDepositInterestRate = event.params.newRate.toBigDecimal();
  duration.save();
}

export function handleReferralBonusRateUpdated(event: ReferralBonusRateUpdated): void {
  let referralLevel = ReferralLevel.load(event.params.referralLevel.toHex());
  if (referralLevel == null) {
    referralLevel = new ReferralLevel(event.params.referralLevel.toHex());
    referralLevel.level = event.params.referralLevel;
  }
  referralLevel.referralBonusRate = event.params.bonusRate.toBigDecimal();
  referralLevel.save();
}

export function handlePassMinted(event: PassMinted): void {
  let profile = createProfile(event.params.mintedTokenId.toHex(), event.params.mintedTokenId);
  let referrerProfile = Profile.load(event.params.referrerTokenId.toHex())!;
  profile.referredBy = referrerProfile.id;
  let owner = loadUser(event.params.minter.toHex());
  profile.owner = owner.id;
  profile.save();
}
export function handleReferralCodeCreated(event: ReferralCodeCreated): void {
  let profile = Profile.load(event.params.tokenId.toHex())!;
  profile.referralCode = event.params.referralCode;
  profile.save();
}

export function handleDepositCreated(event: DepositCreated): void {
  let profile = Profile.load(event.params.tokenId.toHex())!;
  // create deposit
  let deposit = new Deposit(event.params.depositId.toHex());
  deposit.depositor = profile.id;
  deposit.principal = event.params.amount.toBigDecimal().div(exponentToBigDecimal(6)).truncate(6);
  deposit.duration = Duration.load(event.params.duration.toHex())!.id;
  deposit.startTime = event.block.timestamp;
  deposit.maturity = event.block.timestamp.plus(event.params.duration);
  let oneYear = BigDecimal.fromString("31536000");
  let interestReceivableScaled = event.params.interestReceivable.toBigDecimal().div(exponentToBigDecimal(6)).truncate(6);
  let annualizedInterestReceivable = interestReceivableScaled.times(oneYear).div(event.params.duration.toBigDecimal());
  deposit.annualizedInterestReceivable = annualizedInterestReceivable;
  deposit.interestReceivable = interestReceivableScaled;
  deposit.interestCollected = BigDecimal.fromString("0");
  deposit.lastClaimedAt = BigInt.fromI32(0);
  deposit.isWithdrawn = false;
  deposit.save();
  // effects to profile and membership
  let membershipTier = MembershipTier.load(profile.membershipTier)!;

  membershipTier.totalDeposits = membershipTier.totalDeposits.plus(deposit.principal);
  membershipTier.save();
  profile.totalDeposits = profile.totalDeposits.plus(deposit.principal);
  profile.save();
}
export function handleMembershipTierChanged(event: MembershipTierChanged): void {
  let profile = Profile.load(event.params.tokenId.toHex())!;
  let membershipTier = MembershipTier.load(event.params.membershipTierIndex.toHex())!;
  profile.membershipTier = membershipTier.id;
  profile.save();
}
export function handleReferralRewardCreated(event: ReferralRewardCreated): void {}
export function handleInterestClaimed(event: InterestClaimed): void {}
export function handleReferralBonusClaimed(event: ReferralBonusClaimed): void {}
export function handleReferralBonusLevelCollectionActivated(event: ReferralBonusLevelCollectionActivated): void {}
export function handleReferralBonusLevelCollectionDeactivated(event: ReferralBonusLevelCollectionDeactivated): void {}
export function handleDepositWithdrawn(event: DepositWithdrawn): void {}
