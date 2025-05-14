export function generateUrlParams(queries) {
  let query = "?";

  Object.keys(queries)?.forEach((key) => {
    if (queries[key] !== null && queries[key] !== undefined) {
      query += `${key}=${queries[key]}&`;
    }
  });

  query = query.substring(0, query.lastIndexOf("&"));

  return query;
}
