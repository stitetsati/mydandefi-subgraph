import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { MembershipUpdated, DurationBonusRateUpdated, MembershipInserted, ReferralBonusRateUpdated } from "../generated/MyDanDefi/MyDanDefi";
import { ReferralLevel, Duration, MembershipTier, Profile } from "../generated/schema";
import { exponentToBigDecimal } from "./utils";

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
