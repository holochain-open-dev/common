export type Dictionary<T> = {
  [key: string]: T;
};

export type Hash = string;
export type AgentPubKey = string;

export type CellId = [AgentPubKey, Hash];

export function getAgentPubKey(cellId: CellId): AgentPubKey {
  return cellId[0];
}

export function getDnaHash(cellId: CellId): Hash {
  return cellId[1];
}
