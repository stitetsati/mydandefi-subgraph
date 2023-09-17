import { User, Profile } from "../generated/schema";
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
  profile.referredProfileCount = 0;
  profile.deposits = [];
  profile.totalDeposits = BigDecimal.fromString("0");
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
