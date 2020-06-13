import neo4j from 'neo4j-driver';

import { JUMP_PROBABILITY } from '../constants/pagerank-constants';

const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'a1208979946')
);

export const socialInfluence = async (billUuid: string) => {
  const session = driver.session();
  try {
    await session.run(`MATCH (n) DETACH DELETE n;`);

    await session.run(
      `
      load csv with headers from "http://localhost:4000/csv/person.csv/${billUuid}"
      as line
      with line merge (:personAll{ name: line.personName })
      `
    );

    await session.run(
      `
      load csv with headers from "http://localhost:4000/csv/person-relationship.csv/${billUuid}"
      as line with line
      merge (n1:personAll{ name: line.sponsor })
      merge(n2:personAll{ name: line.cosponsor })
      with * create (n2)-[r: supportall{ weight: 1 }] -> (n1)
      `
    );

    await session.run(
      'match (n1:personAll)-[r:supportall]->(n2:personAll) with n1,n2,collect(r) as rr foreach(r in rr| set r.weight=length(rr))'
    );
    await session.run(
      'match (n1:personAll)-[r:supportall]->(n2:personAll) with n1,n2,TAIL(collect(r)) as rr foreach(r in rr| delete r)'
    );
    let res = await session.run(
      `
      CALL algo.pageRank.stream(
        "personAll",
        "supportall",
        { iterations: 20,
          dampingFactor: ${JUMP_PROBABILITY},
          weightProperty:"weight"
        }
      ) YIELD nodeId, score
      RETURN algo.getNodeById(nodeId).name as personName,score 
      ORDER BY score DESC
      `
    );

    const standRes: any[] = [];
    res.records.forEach(item => {
      standRes.push({
        [item.keys[0]]: item.get(item.keys[0]),
        [item.keys[1]]: item.get(item.keys[1]),
      });
    });

    return standRes;

    // let str = JSON.stringify(standRes, null, '\t');

    // fs.writeFile(
    //   path.resolve(__dirname, '../../dist-test/data.json'),
    //   str,
    //   function (err) {
    //     if (err) {
    //       console.error(err);
    //     }
    //   }
    // );
  } catch (err) {
    console.log(err);
  } finally {
    await session.close();
  }

  // // on application exit:
  // await driver.close();
};
