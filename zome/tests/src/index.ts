import { Orchestrator, Config, InstallAgentsHapps } from "@holochain/tryorama";
import path from "path";
import * as msgpack from "@msgpack/msgpack";

const conductorConfig = Config.gen();

// Construct proper paths for your DNAs
const commonDna = path.join(__dirname, "../../common.dna.gz");

// create an InstallAgentsHapps array with your DNAs to tell tryorama what
// to install into the conductor.
const installation: InstallAgentsHapps = [
  // agent 0
  [
    // happ 0
    [commonDna],
  ],
];

const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

const orchestrator = new Orchestrator();

orchestrator.registerScenario("create an entry and get it", async (s, t) => {
  const [alice] = await s.players([conductorConfig]);

  // install your happs into the coductors and destructuring the returned happ data using the same
  // array structure as you created in your installation array.
  const [[alice_common]] = await alice.installAgentsHapps(installation);

  let entryHash = await alice_common.cells[0].call("test_util", "create", null);
  t.ok(entryHash);
  await sleep(500);

  let entryDetails = await alice_common.cells[0].call(
    "common",
    "get_entry_details",
    entryHash
  );

  const entry = msgpack.decode(entryDetails.entry.entry);
  t.deepEqual(entry, { content: "test" });
});

orchestrator.run();
