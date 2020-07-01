import neo4j from 'neo4j-driver';

import { JUMP_PROBABILITY } from '../constants/pagerank-constants';

export const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'a1208979946')
);

export const initNeo4j = async () => {
  const session = driver.session();

  try {
    await session.run(
      `
        load csv with headers from "http://localhost:4000/csv/person.csv"
        as line
        with line merge (:personAll{ name: line.personName })
        `
    );

    await session.run(
      `
        load csv with headers from "http://localhost:4000/csv/committee.csv"
        as line
        with line merge (:allCommittee{ name: line.committee })
        `
    );
  } catch (err) {
    console.log(err);
  } finally {
    await session.close();
  }
};

export const socialInfluence = async (billUuid: string) => {
  const session = driver.session();
  try {
    await session.run(`MATCH ()-[r:supportall]->() delete r`);

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
  } catch (err) {
    console.log(err);
  } finally {
    await session.close();
  }

  // // on application exit:
  // await driver.close();
};

export const committeeInfluence = async (billUuid: string) => {
  const session = driver.session();
  try {
    // 清除之前关系
    await session.run(`MATCH ()-[r: together]->() delete r`);

    // 关系导入
    await session.run(`
      load csv with headers from "http://localhost:4000/csv/committee-relationship.csv/${billUuid}"
      as line with line
      merge (n1: allCommittee{ name: line.committee1 })
      merge (n2: allCommittee{ name: line.committee2 })
      with *
      create (n1) - [r1: together{ weight: 1 }] -> (n2)
      create (n2) - [r2: together{ weight: 1 }] -> (n1)
    `);

    // 更新权重
    await session.run(`
      match (n1: allCommittee) - [r:together] -> (n2:allCommittee)
      with n1, n2, collect(r) as rr
      foreach(r in rr | set r.weight=length(rr))
    `);

    // 删除多余关系
    await session.run(`
      match (n1:allCommittee) - [r: together] -> (n2:allCommittee)
      with n1, n2, TAIL(collect(r)) as rr
      foreach(r in rr | delete r)
    `);

    // 计算影响力
    let res = await session.run(`
      CALL algo.pageRank.stream(
        'allCommittee',
        'together',
        {
          iterations:20,
          dampingFactor: 0.85,
          weightProperty: "weight"
        }
      ) YIELD nodeId,score RETURN algo.getNodeById(nodeId).name as committee, score ORDER BY score DESC
    `);

    const standRes: any[] = [];
    res.records.forEach(item => {
      standRes.push({
        [item.keys[0]]: item.get(item.keys[0]),
        [item.keys[1]]: item.get(item.keys[1]),
      });
    });

    return standRes;
  } catch (error) {
    console.log(error);
  } finally {
    await session.close();
  }
};
