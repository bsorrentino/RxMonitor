
import * as fs from 'fs';
import * as path from 'path';
import * as fsx from 'fs-extra';
import { promisify } from 'util'


const srcdir = path.join( 'packages', 'samples' )
const destdir = 'dist';

console.debug( srcdir )
const css = 'materialize.min.css'
const materialize_css = path.join( srcdir, 'node_modules', 'materialize-css', 'dist', 'css', css)


/**
 * 
 * @param src 
 * @param dst 
 * @param finish 
 */
async function copyFile (src:string, dst:string ) {

    return new Promise( (resolve,reject) => {
        
        const opts = {
            flags:'w+',
            mode: 0o666
          }
        fs.createReadStream(src)
          .pipe(fs.createWriteStream(dst, opts))
          .once('error', (err) => reject(err))
          .once('finish', () => fs.chmod(dst, opts.mode, err => {
            if( err ) {
                reject(err)
                return
            }
            resolve()
          }) )
    
    })
}

async function copy_TS_to_TXT( file:string ) {
    const src = path.join( srcdir, file );
    const dest = path.join( destdir, `${file}.txt`);

    try {
        await copyFile( src, dest )
        console.error( `file ${src} copied to ${dest}`);
    }
    catch( err ) {
        console.error( 'error copying file', src, 'to', dest, err );
    }
}

async function copyCSS( ) {
    const src = materialize_css;
    const dest = path.join( destdir, css);

    try {
        await copyFile( src, dest )
        console.error( `file ${src} copied to ${dest}`);
    }
    catch( err ) {
        console.error( 'error copying file', src, 'to', dest, err );
    }
}

/**
 * 
 */
async function copyTS() {
    const readdir = promisify( fs.readdir )

    console.log( 'reading dir ', srcdir );

    try {

        const files = await readdir( srcdir );

        files.filter( file => path.extname( file )==='.ts' ).forEach( copy_TS_to_TXT )
    }
    catch( err ) {
        console.error( 'error reading dir', srcdir, err );
    }
  }
  
  /**
   * 
   */
  async function main() {

    try {
        await fsx.ensureDir(  destdir ) ;        
    } catch (err) {
        console.error('error creating dir', destdir, err);
        return;
    }
    
 
    await copyCSS()
    await copyTS()

}

  
main();