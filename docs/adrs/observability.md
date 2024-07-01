# ADR: Observability Platform

## Context: 
We need some service for tracking basic observability signals that are produced by our deployments

## Options:
NewRelic:
- Pros:
  - Very generous free tier (100GB data)
  - Supports otel
  - Good UIs for all the observability we'd need in this app
  - 8 day retention
  - no limit on hosts
- Cons:
  - Can get expensive at scale

Datadog:
- Pros:
  - Also very popular, like NewRelic
- Cons:
  - Only 1 day retention
  - Only 5 hosts

Grafana Cloud:
- Pros:
  - Super good free tier, like NewRelic
  - More open source, uses OSS components
- Cons:
  - Maybe not as seamless as NewRelic. Loki, Prometheus, and Mimir are all separate tools

## Decision:
We will go with NewRelic, because it's free tier is unmatched, and it offers all the observability tools we'd need in 1 place. To keep us from being 100% locked in, however, we'll publish to NewRelic using opentelemetry.

## Impact:
NewRelic doesn't seem like it's going away any time soon. And if we get to the point where NewRelic's free tier is not enough for Mapo, we have much bigger problems.

Potential downside, if they get rid of this free tier, we'll have to move to something more OSS like Grafana.
