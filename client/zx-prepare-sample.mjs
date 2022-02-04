#!/usr/bin/env zx
import 'zx/globals'

const materialize_css = path.join( 'node_modules', 'materialize-css')
const destdir = path.join( 'packages', 'rxmarble-samples', materialize_css )


await fs.copy( materialize_css, destdir )


// async function copy_TS_to_TXT( file:string ) {
//     const src = path.join( srcdir, file );
//     const dest = path.join( destdir, `${file}.txt`);

//     try {
//         await copyFile( src, dest )
//         console.error( `file ${src} copied to ${dest}`);
//     }
//     catch( err ) {
//         console.error( 'error copying file', src, 'to', dest, err );
//     }
// }

// async function copyTS() {
//     const readdir = promisify( fs.readdir )

//     console.log( 'reading dir ', srcdir );

//     try {

//         const files = await readdir( srcdir );

//         files.filter( file => path.extname( file )==='.ts' ).forEach( copy_TS_to_TXT )
//     }
//     catch( err ) {
//         console.error( 'error reading dir', srcdir, err );
//     }
//   }
  
//   async function main() {

//     try {
//         await fsx.ensureDir(  destdir ) ;        
//     } catch (err) {
//         console.error('error creating dir', destdir, err);
//         return;
//     }
    
 
//     await copyCSS()
//     await copyTS()

// }

  
// main();