/**
 * Pure Discrete-Tick Packet Network Simulator Skeleton (`W7 Tarmoq va Internet`).
 * Models routers, DNS lookup nodes, servers, link latencies, routing tables,
 * TTL loop protection, and exact snapshot rewind.
 */

export type NetworkNodeKind = 'client' | 'router' | 'dns' | 'server';

export interface NetworkNode {
  id: string;
  kind: NetworkNodeKind;
  ip: string;
  routes: Record<string, string>; // targetIp -> nextHopNodeId
  dnsTable?: Record<string, string>; // domain -> resolvedIp
}

export interface NetworkLink {
  a: string;
  b: string;
  latencyTicks: number;
  up: boolean;
}

export interface NetworkTopology {
  nodes: readonly NetworkNode[];
  links: readonly NetworkLink[];
}

export type PacketStatus =
  | 'in_transit'
  | 'delivered'
  | 'dropped_ttl'
  | 'dropped_no_route'
  | 'dropped_link_down';

export interface Packet {
  id: string;
  seq: number;
  kind: 'DNS' | 'HTTP' | 'DATA';
  srcIp: string;
  dstIp: string;
  domain?: string;
  payload: string;
  ttl: number;
  currentNodeId: string;
  nextHopNodeId: string | null;
  remainingLinkTicks: number;
  status: PacketStatus;
  hops: string[];
}

export interface NetworkSnapshot {
  tick: number;
  packets: Packet[];
  resolvedIps: Record<string, string>;
  deliveredCount: number;
  droppedCount: number;
  completed: boolean;
}

export interface NetworkRunResult {
  snapshot: NetworkSnapshot;
  durationTicks: number;
  timedOut: boolean;
}

function findLink(
  links: readonly NetworkLink[],
  fromId: string,
  toId: string
): NetworkLink | undefined {
  return links.find(
    (l) => (l.a === fromId && l.b === toId) || (l.b === fromId && l.a === toId)
  );
}

function clonePacket(p: Packet): Packet {
  return { ...p, hops: [...p.hops] };
}

export function createInitialNetworkSnapshot(
  packets: readonly Packet[]
): NetworkSnapshot {
  return {
    tick: 0,
    packets: packets.map(clonePacket),
    resolvedIps: {},
    deliveredCount: 0,
    droppedCount: 0,
    completed: packets.every((p) => p.status !== 'in_transit'),
  };
}

export function stepNetwork(
  prev: NetworkSnapshot,
  topology: NetworkTopology
): NetworkSnapshot {
  if (prev.completed) return prev;

  const nodeMap = new Map<string, NetworkNode>();
  for (const node of topology.nodes) {
    nodeMap.set(node.id, node);
  }

  const nextResolved = { ...prev.resolvedIps };
  const nextPackets: Packet[] = [];

  for (const orig of prev.packets) {
    const p = clonePacket(orig);
    if (p.status !== 'in_transit') {
      nextPackets.push(p);
      continue;
    }

    // Currently travelling along a link
    if (p.nextHopNodeId !== null && p.remainingLinkTicks > 1) {
      p.remainingLinkTicks -= 1;
      nextPackets.push(p);
      continue;
    }

    // Arrive at nextHopNodeId if link countdown hits 0
    if (p.nextHopNodeId !== null && p.remainingLinkTicks <= 1) {
      p.currentNodeId = p.nextHopNodeId;
      p.nextHopNodeId = null;
      p.remainingLinkTicks = 0;
      p.hops.push(p.currentNodeId);
    }

    const currentNode = nodeMap.get(p.currentNodeId);
    if (!currentNode) {
      p.status = 'dropped_no_route';
      nextPackets.push(p);
      continue;
    }

    // DNS node resolves domain into dstIp if requested
    if (currentNode.kind === 'dns' && p.kind === 'DNS' && p.domain) {
      const resolved = currentNode.dnsTable?.[p.domain];
      if (resolved) {
        nextResolved[p.domain] = resolved;
        p.status = 'delivered';
        nextPackets.push(p);
        continue;
      }
    }

    // Reached destination IP
    if (currentNode.ip === p.dstIp) {
      p.status = 'delivered';
      nextPackets.push(p);
      continue;
    }

    // Decrement TTL at router/hop
    p.ttl -= 1;
    if (p.ttl <= 0) {
      p.status = 'dropped_ttl';
      nextPackets.push(p);
      continue;
    }

    const nextHop = currentNode.routes[p.dstIp] ?? currentNode.routes['*'];
    if (!nextHop) {
      p.status = 'dropped_no_route';
      nextPackets.push(p);
      continue;
    }

    const link = findLink(topology.links, p.currentNodeId, nextHop);
    if (!link || !link.up) {
      p.status = 'dropped_link_down';
      nextPackets.push(p);
      continue;
    }

    const latency = Math.max(1, link.latencyTicks);
    if (latency === 1) {
      p.currentNodeId = nextHop;
      p.hops.push(nextHop);
      const arrived = nodeMap.get(nextHop);
      if (arrived?.kind === 'dns' && p.kind === 'DNS' && p.domain && arrived.dnsTable?.[p.domain]) {
        const resolved = arrived.dnsTable[p.domain];
        if (resolved) nextResolved[p.domain] = resolved;
        p.status = 'delivered';
      } else if (arrived?.ip === p.dstIp) {
        p.status = 'delivered';
      }
    } else {
      p.nextHopNodeId = nextHop;
      p.remainingLinkTicks = latency;
    }

    nextPackets.push(p);
  }

  let deliveredCount = 0;
  let droppedCount = 0;
  let anyTransit = false;
  for (const p of nextPackets) {
    if (p.status === 'delivered') deliveredCount += 1;
    else if (p.status === 'in_transit') anyTransit = true;
    else droppedCount += 1;
  }

  return {
    tick: prev.tick + 1,
    packets: nextPackets,
    resolvedIps: nextResolved,
    deliveredCount,
    droppedCount,
    completed: !anyTransit,
  };
}

export function runNetwork(
  initialPackets: readonly Packet[],
  topology: NetworkTopology,
  maxTicks = 10_000
): NetworkRunResult {
  const cap = Math.max(1, maxTicks);
  let cur = createInitialNetworkSnapshot(initialPackets);
  while (!cur.completed && cur.tick < cap) {
    cur = stepNetwork(cur, topology);
  }
  return {
    snapshot: cur,
    durationTicks: cur.tick,
    timedOut: !cur.completed && cur.tick >= cap,
  };
}
