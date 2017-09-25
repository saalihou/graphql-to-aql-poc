const { Database, aql } = require('arangojs');
const {
  set,
  omit,
  assign,
  isObject,
  keys,
  toArray,
  mapValues
} = require('lodash');

const db = new Database({
  url: 'http://root:openSesame@localhost:8529',
  databaseName: '_system'
});

const now = Date.now();

function treeToGraphQl(root, subfields = []) {
  return mapValues(root, (v, key) => {
    if (isObject(v)) {
      treeToGraphQl(v, subfields);
      if (subfields.includes(key)) {
        return toArray(v);
      } else {
        return v;
      }
    }
  });
}

async function run() {
  const subfields = ['departments', 'employees', 'payments'];
  const edges = subfields.map((s, i) => `${subfields[i]}_${subfields[i + 1]}`);
  edges.pop();
  const cursor = await db.query({
    query: `FOR v, e, p
        IN 0..2 OUTBOUND 'departments/d1'
        ${edges.join(', ')}
        OPTIONS { bfs: true }
        RETURN {edge: e, vertex: v, path: p}`
  });
  const result = await cursor.all();
  const resultTree = {};
  result.forEach(node => {
    const path = node.path.vertices
      .map(v => v._id)
      .join('/')
      .replace(/\//g, '.');
    set(
      resultTree,
      path,
      assign(
        {},
        omit(node.vertex, ['_id', '_rev']),
        omit(node.edge, ['_key', '_id', '_from', '_to', '_rev'])
      )
    );
  });
  const resultGraphQl = treeToGraphQl(resultTree, subfields);
  console.log(JSON.stringify(resultGraphQl, null, 2));
}

run();
