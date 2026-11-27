import { describe, expect, it } from 'vitest';
import { runNetwork, type NetworkTopology, type Packet } from './packets';

describe('Packet Network Simulator Skeleton (W7)', () => {
  const topology: NetworkTopology = {
    nodes: [
      { id: 'client', kind: 'client', ip: '10.0.0.1', routes: { '*': 'r1' } },
      {
        id: 'r1',
        kind: 'router',
        ip: '10.0.0.254',
        routes: { '10.0.2.50': 'dns', '10.0.3.80': 'r2' },
      },
      {
        id: 'dns',
        kind: 'dns',
        ip: '10.0.2.50',
        routes: {},
        dnsTable: { 'mirzo.uz': '10.0.3.80' },
      },
      {
        id: 'r2',
        kind: 'router',
        ip: '10.0.3.1',
        routes: { '10.0.3.80': 'srv' },
      },
      { id: 'srv', kind: 'server', ip: '10.0.3.80', routes: {} },
    ],
    links: [
      { a: 'client', b: 'r1', latencyTicks: 1, up: true },
      { a: 'r1', b: 'dns', latencyTicks: 2, up: true },
      { a: 'r1', b: 'r2', latencyTicks: 2, up: true },
      { a: 'r2', b: 'srv', latencyTicks: 1, up: true },
    ],
  };

  it('resolves DNS and delivers HTTP packets across multi-hop network', () => {
    const packets: Packet[] = [
      {
        id: 'p-dns',
        seq: 1,
        kind: 'DNS',
        srcIp: '10.0.0.1',
        dstIp: '10.0.2.50',
        domain: 'mirzo.uz',
        payload: 'A? mirzo.uz',
        ttl: 8,
        currentNodeId: 'client',
        nextHopNodeId: null,
        remainingLinkTicks: 0,
        status: 'in_transit',
        hops: ['client'],
      },
      {
        id: 'p-http',
        seq: 2,
        kind: 'HTTP',
        srcIp: '10.0.0.1',
        dstIp: '10.0.3.80',
        payload: 'GET /',
        ttl: 8,
        currentNodeId: 'client',
        nextHopNodeId: null,
        remainingLinkTicks: 0,
        status: 'in_transit',
        hops: ['client'],
      },
    ];

    const res = runNetwork(packets, topology, 100);
    expect(res.timedOut).toBe(false);
    expect(res.snapshot.deliveredCount).toBe(2);
    expect(res.snapshot.droppedCount).toBe(0);
    expect(res.snapshot.resolvedIps['mirzo.uz']).toBe('10.0.3.80');
  });

  it('drops packets caught in routing loops cleanly via TTL', () => {
    const loopTopo: NetworkTopology = {
      nodes: [
        { id: 'a', kind: 'router', ip: '10.0.0.1', routes: { '*': 'b' } },
        { id: 'b', kind: 'router', ip: '10.0.0.2', routes: { '*': 'a' } },
      ],
      links: [{ a: 'a', b: 'b', latencyTicks: 1, up: true }],
    };

    const packet: Packet = {
      id: 'loop-1',
      seq: 1,
      kind: 'DATA',
      srcIp: '10.0.0.1',
      dstIp: '10.0.9.9',
      payload: 'ping',
      ttl: 5,
      currentNodeId: 'a',
      nextHopNodeId: null,
      remainingLinkTicks: 0,
      status: 'in_transit',
      hops: ['a'],
    };

    const res = runNetwork([packet], loopTopo, 1000);
    expect(res.timedOut).toBe(false);
    expect(res.snapshot.droppedCount).toBe(1);
    expect(res.snapshot.packets[0]?.status).toBe('dropped_ttl');
  });
});
