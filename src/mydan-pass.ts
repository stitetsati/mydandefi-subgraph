import { BigInt } from "@graphprotocol/graph-ts";
import { Minted } from "../generated/MyDanPass/MyDanPass";
import { MembershipTier, Profile, User } from "../generated/schema";
export function handleMinted(event: Minted): void {
  let profile = new Profile(event.params.tokenId.toHex());

  let lowestMembershipTier = MembershipTier.load("0")!;

  let user = User.load(event.params.to.toHex());
  if (user == null) {
    user = new User(event.params.to.toHex());
    user.save();
  }
  profile.owner = user.id;
  profile.membershipTier = lowestMembershipTier.id;
  profile.save();
}
