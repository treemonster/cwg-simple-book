const simplebook=require('..')
const openurl=require('openurl')
simplebook({
  SVID_HTML: __dirname+'/svid.html',
  BOOK_DIR: __dirname+'/book',
  READWRITE: true,
  globals: {
    PACKAGE_SRC: __dirname+'/../',
  }
}).then(url=>{
  openurl.open(url)
})
