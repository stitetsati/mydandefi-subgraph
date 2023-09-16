import { newMockEvent } from "matchstick-as";
import { ethereum, Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/MyDanPass/MyDanPass";
import { BigInt } from "@graphprotocol/graph-ts";

export function createTransferEvent(fromAddress: Address, toAddress: Address, tokenId: BigInt): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent());

  transferEvent.parameters = new Array();
  transferEvent.parameters.push(new ethereum.EventParam("from", ethereum.Value.fromAddress(fromAddress)));
  transferEvent.parameters.push(new ethereum.EventParam("to", ethereum.Value.fromAddress(toAddress)));
  transferEvent.parameters.push(new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId)));

  return transferEvent;
}
