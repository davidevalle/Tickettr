export type TicketStatus = "OPEN" | "CLAIMED" | "CLOSED";

export function transitionStatus(current: TicketStatus, action: "CLAIM" | "UNCLAIM" | "CLOSE" | "REOPEN"): TicketStatus {
  if (action === "CLOSE") return "CLOSED";
  if (action === "REOPEN") return "OPEN";
  if (action === "CLAIM" && current === "OPEN") return "CLAIMED";
  if (action === "UNCLAIM" && current === "CLAIMED") return "OPEN";
  return current;
}
