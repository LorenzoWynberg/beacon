# Least reliable first

The header has a "Least reliable first" button. Off by default, cards follow the order in `status.json`. Turn it on and services are ordered by lowest 24 h uptime first; services with no uptime figure come last, and ties keep their `status.json` order. With groups, the sort applies inside each group.

Turning it off restores the original order. The choice is not remembered: reloading the page turns it off.
