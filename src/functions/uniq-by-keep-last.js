/*** Example for using

  data = [
    {a:1, u:1},
    {a:2, u:2},
    {a:3, u:3},
    {a:4, u:1},
    {a:5, u:2},
    {a:6, u:3},
  ];

  console.log(uniqByKeepLast(data, it => it.u))
  
***/

const uniqByKeepLast = (a, key) => {
  return [...new Map(a.map(x => [key(x), x])).values()]
}

export default uniqByKeepLast
