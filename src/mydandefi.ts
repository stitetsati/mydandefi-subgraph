import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
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
import { ProfileReferralLevelData, ReferralBonus, ReferralLevel, Duration, MembershipTier, Profile, User, Deposit } from "../generated/schema";
import { exponentToBigDecimal, loadUser, createProfile, loadProtocol } from "./utils";
import { MyDanDefi as MyDanDefiContract } from "../generated/MyDanDefi/MyDanDefi";
import { BEP20 } from "../generated/MyDanDefi/BEP20";

export function handleMembershipInserted(event: MembershipInserted): void {
  let insertedMembershipTier = event.params.insertedMembershipTier;
  let membershipTier = new MembershipTier(event.params.index.toHex());
  let contract = MyDanDefiContract.bind(event.address);
  let targetTokenAddress = contract.targetToken();
  let targetToken = BEP20.bind(targetTokenAddress);
  let decimals = targetToken.decimals();

  membershipTier.name = insertedMembershipTier.name;
  membershipTier.lowerAmountThreshold = insertedMembershipTier.lowerThreshold.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
  membershipTier.upperAmountThreshold = insertedMembershipTier.upperThreshold.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
  membershipTier.interestRate = insertedMembershipTier.interestRate.toBigDecimal();
  membershipTier.maxCollectableReferralLevel = insertedMembershipTier.referralBonusCollectibleLevelUpperBound;
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
  let contract = MyDanDefiContract.bind(event.address);
  let targetTokenAddress = contract.targetToken();
  let targetToken = BEP20.bind(targetTokenAddress);
  let decimals = targetToken.decimals();
  membershipTier.name = updatedMembershipTier.name;
  membershipTier.lowerAmountThreshold = updatedMembershipTier.lowerThreshold.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
  membershipTier.upperAmountThreshold = updatedMembershipTier.upperThreshold.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
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
  let protocol = loadProtocol();
  protocol.totalMembers = protocol.totalMembers.plus(BigInt.fromI32(1));
  protocol.save();
}
export function handleReferralCodeCreated(event: ReferralCodeCreated): void {
  let profile = Profile.load(event.params.tokenId.toHex())!;
  profile.referralCode = event.params.referralCode;
  profile.save();
}

export function handleDepositCreated(event: DepositCreated): void {
  let profile = Profile.load(event.params.tokenId.toHex())!;
  let contract = MyDanDefiContract.bind(event.address);
  let targetTokenAddress = contract.targetToken();
  let targetToken = BEP20.bind(targetTokenAddress);
  let decimals = targetToken.decimals();

  // create deposit
  let deposit = new Deposit(event.params.depositId.toHex());
  deposit.depositId = event.params.depositId;
  deposit.depositor = profile.id;
  deposit.principal = event.params.amount.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
  deposit.duration = Duration.load(event.params.duration.toHex())!.id;
  deposit.startTime = event.block.timestamp;
  deposit.maturity = event.block.timestamp.plus(event.params.duration);

  let oneYear = BigDecimal.fromString("31536000");
  let interestReceivableScaled = event.params.interestReceivable.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
  let annualizedInterestReceivable = interestReceivableScaled.times(oneYear).div(event.params.duration.toBigDecimal());
  deposit.annualizedInterestReceivable = annualizedInterestReceivable;
  deposit.interestReceivable = interestReceivableScaled;
  deposit.interestCollected = BigDecimal.fromString("0");
  deposit.lastClaimedAt = BigInt.fromI32(0);
  deposit.isWithdrawn = false;
  deposit.save();
  // effects to profile
  profile.totalDeposits = profile.totalDeposits.plus(deposit.principal);
  profile.totalAnnualizedRewardsPlusReferralBonuses = profile.totalAnnualizedRewardsPlusReferralBonuses.plus(deposit.annualizedInterestReceivable);
  profile.save();

  let protocol = loadProtocol();
  protocol.totalDeposits = protocol.totalDeposits.plus(deposit.principal);
  protocol.totalRewardsPlusBonuses = protocol.totalRewardsPlusBonuses.plus(deposit.annualizedInterestReceivable);
  protocol.save();
}
export function handleMembershipTierChanged(event: MembershipTierChanged): void {
  let profile = Profile.load(event.params.tokenId.toHex())!;
  let membershipTier = MembershipTier.load(event.params.membershipTierIndex.toHex())!;
  profile.membershipTier = membershipTier.id;
  profile.save();
}
export function handleReferralBonusCreated(event: ReferralBonusCreated): void {
  let contract = MyDanDefiContract.bind(event.address);
  let targetTokenAddress = contract.targetToken();
  let targetToken = BEP20.bind(targetTokenAddress);
  let decimals = targetToken.decimals();
  let referralBonusOnContract = contract.referralBonuses(event.params.referrerTokenId, event.params.referralBonusId);
  let profile = Profile.load(event.params.referrerTokenId.toHex())!;
  let referralLevel = ReferralLevel.load(event.params.referralLevel.toHex())!;
  let referralBonusId = event.params.referralBonusId;
  let referralBonus = new ReferralBonus(referralBonusId.toHex());
  let duration = referralBonusOnContract.getMaturity().minus(referralBonusOnContract.getStartTime());
  referralBonus.referralBonusId = referralBonusId;
  referralBonus.beneficiary = profile.id;
  referralBonus.associatedDeposit = referralBonusOnContract.getDepositId().toHex();
  referralBonus.referralLevel = referralLevel.id;

  referralBonus.bonusReceivable = referralBonusOnContract.getReferralBonusReceivable().toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals);
  referralBonus.annualizedBonusReceivable = referralBonus.bonusReceivable.times(BigDecimal.fromString("31536000")).div(duration.toBigDecimal());
  referralBonus.bonusClaimed = BigDecimal.fromString("0");
  referralBonus.startTime = event.block.timestamp;
  referralBonus.maturity = referralBonusOnContract.getMaturity();
  referralBonus.duration = duration.toHex();
  referralBonus.lastClaimedAt = BigInt.fromI64(0);
  referralBonus.isFinished = false;
  // update profile stats
  profile.totalAnnualizedRewardsPlusReferralBonuses = profile.totalAnnualizedRewardsPlusReferralBonuses.plus(referralBonus.annualizedBonusReceivable);

  // effects to profile
  // TODO: see depositCount? or profileCount?

  let deposit = Deposit.load(event.params.depositId.toHex())!;
  let profileReferralLevelDataId = profile.id + "-" + referralLevel.id;
  let profileReferralLevelData = ProfileReferralLevelData.load(profileReferralLevelDataId);
  if (profileReferralLevelData == null) {
    profileReferralLevelData = new ProfileReferralLevelData(profileReferralLevelDataId);
    profileReferralLevelData.profile = profile.id;
    profileReferralLevelData.referralLevel = referralLevel.id;
    profileReferralLevelData.totalReferredPrincipals = BigDecimal.fromString("0");
    profileReferralLevelData.referredCount = BigInt.fromI32(0);
    profileReferralLevelData.totalAnnualizedReferralBonuses = BigDecimal.fromString("0");
  }
  profileReferralLevelData.totalAnnualizedReferralBonuses = profileReferralLevelData.totalAnnualizedReferralBonuses.plus(referralBonus.annualizedBonusReceivable);
  profileReferralLevelData.referredCount = profileReferralLevelData.referredCount.plus(BigInt.fromI32(1));
  profileReferralLevelData.totalReferredPrincipals = profileReferralLevelData.totalReferredPrincipals.plus(deposit.principal);
  profileReferralLevelData.save();
  referralBonus.profileReferralLevelData = profileReferralLevelData.id;
  referralBonus.save();
  profile.save();

  let protocol = loadProtocol();
  protocol.totalRewardsPlusBonuses = protocol.totalRewardsPlusBonuses.plus(referralBonus.annualizedBonusReceivable);
  protocol.save();
}
export function handleInterestClaimed(event: InterestClaimed): void {
  let contract = MyDanDefiContract.bind(event.address);
  let targetTokenAddress = contract.targetToken();
  let targetToken = BEP20.bind(targetTokenAddress);
  let decimals = targetToken.decimals();
  let deposit = Deposit.load(event.params.depositId.toHex())!;
  deposit.interestCollected = deposit.interestCollected.plus(event.params.interestCollectible.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals));
  deposit.lastClaimedAt = event.block.timestamp;
  let profile = Profile.load(deposit.depositor)!;
  profile.totalRewardsPlusBonusesWithdrawn = profile.totalRewardsPlusBonusesWithdrawn.plus(event.params.interestCollectible.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals));
  profile.save();
  deposit.save();
}
export function handleReferralBonusClaimed(event: ReferralBonusClaimed): void {
  let contract = MyDanDefiContract.bind(event.address);
  let targetTokenAddress = contract.targetToken();
  let targetToken = BEP20.bind(targetTokenAddress);
  let decimals = targetToken.decimals();

  let referralBonus = ReferralBonus.load(event.params.referralBonusId.toHex())!;
  let beneficiaryProfile = Profile.load(referralBonus.beneficiary)!;
  referralBonus.bonusClaimed = referralBonus.bonusClaimed.plus(event.params.rewardCollectible.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals));
  beneficiaryProfile.totalRewardsPlusBonusesWithdrawn = beneficiaryProfile.totalRewardsPlusBonusesWithdrawn.plus(
    event.params.rewardCollectible.toBigDecimal().div(exponentToBigDecimal(decimals)).truncate(decimals),
  );
  referralBonus.lastClaimedAt = event.block.timestamp;
  if (event.block.timestamp >= referralBonus.maturity) {
    referralBonus.isFinished = true;
    // effects to profile
    let profileReferralLevelDataId = event.params.tokenId.toHex() + "-" + referralBonus.referralLevel;
    let profileReferralLevelData = ProfileReferralLevelData.load(profileReferralLevelDataId)!;
    profileReferralLevelData.totalAnnualizedReferralBonuses = profileReferralLevelData.totalAnnualizedReferralBonuses.minus(referralBonus.annualizedBonusReceivable);
    profileReferralLevelData.referredCount = profileReferralLevelData.referredCount.minus(BigInt.fromI32(1));
    let deposit = Deposit.load(referralBonus.associatedDeposit)!;
    profileReferralLevelData.totalReferredPrincipals = profileReferralLevelData.totalReferredPrincipals.minus(deposit.principal);
    profileReferralLevelData.save();
    beneficiaryProfile.totalAnnualizedRewardsPlusReferralBonuses = beneficiaryProfile.totalAnnualizedRewardsPlusReferralBonuses.minus(referralBonus.annualizedBonusReceivable);

    let protocol = loadProtocol();
    protocol.totalRewardsPlusBonuses = protocol.totalRewardsPlusBonuses.minus(referralBonus.annualizedBonusReceivable);
    protocol.save();
  }
  beneficiaryProfile.save();
  referralBonus.save();
}
export function handleReferralBonusLevelCollectionActivated(event: ReferralBonusLevelCollectionActivated): void {}
export function handleReferralBonusLevelCollectionDeactivated(event: ReferralBonusLevelCollectionDeactivated): void {}
export function handleDepositWithdrawn(event: DepositWithdrawn): void {
  let deposit = Deposit.load(event.params.depositId.toHex())!;
  let profile = Profile.load(deposit.depositor)!;
  deposit.isWithdrawn = true;
  profile.totalAnnualizedRewardsPlusReferralBonuses = profile.totalAnnualizedRewardsPlusReferralBonuses.minus(deposit.annualizedInterestReceivable);
  profile.totalDeposits = profile.totalDeposits.minus(deposit.principal);
  deposit.save();
  profile.save();
  let protocol = loadProtocol();
  protocol.totalDeposits = protocol.totalDeposits.minus(deposit.principal);
  protocol.totalRewardsPlusBonuses = protocol.totalRewardsPlusBonuses.minus(deposit.annualizedInterestReceivable);
  protocol.save();
}
