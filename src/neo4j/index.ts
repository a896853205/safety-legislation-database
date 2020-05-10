import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'a1208979946')
);
const session = driver.session();

(async () => {
  try {
    await session.run(
      `load csv with headers from "http://localhost:4000/csv/person.csv" as line with line merge (:PersonAll{name:line.person_name})`
    );

    await session.run(
      'load csv with headers from "http://localhost:4000/csv/out.csv" as line with line merge (n1:PersonAll{name:line.sponsor}) merge(n2:PersonAll{name:line.cosponsor}) with * create (n2)-[r:supportall{weight:1}]->(n1)'
    );

    await session.run('match (n:PersonAll{name:"11"}) detach delete n');

    await session.run(
      'match (n1:PersonAll)-[r:supportall]->(n2:PersonAll) with n1,n2,collect(r) as rr foreach(r in rr| set r.weight=length(rr))'
    );
    await session.run(
      'match (n1:PersonAll)-[r:supportall]->(n2:PersonAll) with n1,n2,TAIL(collect(r)) as rr foreach(r in rr| delete r)'
    );
    let res = await session.run(
      'CALL algo.pageRank.stream("PersonAll","supportall",{iterations:20,dampingFactor:0.85,weightProperty:"weight"}) YIELD nodeId,score RETURN algo.getNodeById(nodeId).name as person_name,score ORDER BY score DESC'
    );
    console.table(res.records);
  } catch (err) {
    console.log(err);
  } finally {
    await session.close();
  }

  // on application exit:
  await driver.close();
})();
