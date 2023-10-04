import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/MyDanPass/MyDanPass";
import { Profile } from "../generated/schema";
import { loadUser, createProfile, loadProtocol } from "./utils";

export function handleTransfer(event: Transfer): void {
  // genesis profile creation is handled here
  let profile = Profile.load(event.params.tokenId.toHex());
  let isGenesis = event.params.tokenId == BigInt.fromI32(0);
  if (isGenesis && profile == null) {
    profile = createProfile(event.params.tokenId.toHex(), event.params.tokenId);
  }
  if (profile == null) {
    // non genesisTokenId, handled creation in PassMinted event
    return;
  }
  let toUser = loadUser(event.params.to.toHex());
  profile.owner = toUser.id;
  profile.save();
  loadProtocol();
}
