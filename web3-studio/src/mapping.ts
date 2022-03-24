import { BigInt } from "@graphprotocol/graph-ts"
import {
  Masterchef,
  Deposit,
  EmergencyWithdraw,
  OwnershipTransferred,
  Withdraw
} from "../generated/Masterchef/Masterchef"
import { HistoryEntity } from "../generated/schema"

export function handleDeposit(event: Deposit): void {
  let historyEntity = new HistoryEntity(event.transaction.hash.toHex());
  historyEntity.amount = event.params.amount;
  historyEntity.user = event.params.user;
  historyEntity.time = event.block.timestamp;
  historyEntity.event = "Deposit";
  historyEntity.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void { }

export function handleOwnershipTransferred(event: OwnershipTransferred): void { }

export function handleWithdraw(event: Withdraw): void {
  let historyEntity = new HistoryEntity(event.transaction.hash.toHex());
  historyEntity.amount = event.params.amount;
  historyEntity.user = event.params.user;
  historyEntity.time = event.block.timestamp;
  historyEntity.event = "Withdraw";
  historyEntity.save();
}
