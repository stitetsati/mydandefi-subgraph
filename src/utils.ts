import { User, Profile, Protocol } from "../generated/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function loadUser(id: string): User {
  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.save();
  }
  return user;
}

export function createProfile(id: string, tokenId: BigInt): Profile {
  let profile = new Profile(id);
  profile.tokenId = tokenId;
  profile.membershipTier = "0x0";
  profile.totalDeposits = BigDecimal.fromString("0");
  profile.totalAnnualizedRewardsPlusReferralBonuses = BigDecimal.fromString("0");
  profile.totalRewardsPlusBonusesWithdrawn = BigDecimal.fromString("0");
  let isGenesis = tokenId == BigInt.fromI32(0);
  if (isGenesis) {
    profile.referralCode = "mydandefi";
  }

  return profile;
}

export function exponentToBigDecimal(decimals: i32): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function createProtocol(): Protocol {
  let protocol = new Protocol("0");
  protocol.totalDeposits = BigDecimal.fromString("0");
  protocol.totalRewardsPlusBonuses = BigDecimal.fromString("0");
  protocol.totalMembers = BigInt.fromI32(0);
  return protocol;
}

export function loadProtocol(): Protocol {
  let protocol = Protocol.load("0");
  if (protocol == null) {
    protocol = createProtocol();
    protocol.save();
  }
  return protocol;
}
