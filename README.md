# Linehaul

Linehaul is a courier company sim. You start with one van and a home country, and you build up a delivery network: depots, drivers, vans, trucks, trains, planes, all running on that country's real road, rail, and air infrastructure. Contracts come from a job board that regenerates over time. You accept a job, route a vehicle to pick it up, and get paid when it's delivered. Money buys more vehicles and staff; staff need wages; a hired manager will auto-accept and auto-dispatch jobs for you once you'd rather stop clicking Accept fifty times an hour.

The map is real. Roads, water, rail lines, and place names come from OpenStreetMap, clipped and simplified per country ahead of time. Where you place a hub, how far a van can reach before you need a truck relay, what a delivery pays: all of that is grounded in the country's real land area and economy, not a flat number picked to feel right.

What's live on GitHub Pages right now is this build: Luxembourg only, everything else stripped out so it's small enough to run from a web page. It's a demo, not a release, and it'll get swapped out for a newer one as the game moves forward. The list below is the full plan for the game, checked off against what this specific build actually has working.

## Playing it

Zoom into the highlighted country on the world map and click "Fly in to start." Click anywhere on the road network to place your HQ. From there:

- Open Jobs to see what's on the board and accept what your fleet can carry.
- Open Fleet to buy a van and Staff to hire a driver for it, or nothing moves.
- Open Build to place a depot, transit hub, rail terminal, or airport once you can afford one.
- Zones let you tell a van which part of the map is its territory, instead of it defaulting to whatever's near its home depot.
- Save and load from the pause menu. A save is a gzip-compressed file you keep yourself; there's no server storing anything.

## Roadmap

- [x] Real road/rail network per country, built from OpenStreetMap
- [x] Vans, trucks, trains, and planes, each on their own network
- [x] Job board with contracts that generate over time
- [x] Drivers, and a manager who auto-accepts and auto-dispatches jobs
- [x] Depots, transit hubs, rail terminals, airports you place and pay for
- [x] Zones, manual or auto-assigned, to keep a van working its own patch
- [x] Relay hand-offs, so a package can cross a country on more than one vehicle
- [x] Multi-stop pickups, so one vehicle can carry several jobs from the same depot
- [x] Save/load to a local file, no account or server involved
- [ ] More countries than Luxembourg (the full game already has several built; this build only ships one)
- [ ] International deliveries relayed across a real mapped border between two countries
- [ ] An installer with per-country downloads, instead of one web build carrying every country's data
- [ ] Multiplayer: companies sharing a country's network and competing for the same jobs
- [ ] AI-run rival companies, using the same commands a player's own clicks already go through

If you hit something broken in this build, it's a work in progress, not a finished product.
