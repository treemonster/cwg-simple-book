const getPort=require('get-port')
const server=require('cwg-pre-loader/simple-server')

module.exports=async ({port, globals, READWRITE, SVID_HTML, BOOK_DIR})=>{
  port=port || await getPort({port: getPort.makeRange(2e4, 4e4)})
  const url="http://127.0.0.1:"+port+"/"
  server({
    dir: __dirname,
    listen: port,
    globals: Object.assign({}, {SVID_HTML, BOOK_DIR, READWRITE}, globals||{}),
  })
  return url
}
