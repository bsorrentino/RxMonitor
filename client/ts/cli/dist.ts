
import * as fs from 'fs';
import * as path from 'path';
import * as fsx from 'fs-extra';


function _copyFile (src:string, dst:string , finish: (err: any) => void) {
    const opts = {
        flags:'w+',
        mode: 0o666
      }
    fs.createReadStream(src)
      .pipe(fs.createWriteStream(dst, opts))
      .once('error', finish)
      .once('finish', () => fs.chmod(dst, opts.mode, err => finish(err) ) )
  }

  const srcdir = path.join( 'ts', 'examples' );
  const destdir = path.join( 'dist' );

  function _copyFiles() {
    console.log( 'reading dir ', srcdir );

    fs.readdir( srcdir, ( err:any, files:string[] ) => {
    
        if( err ) {
            console.error( 'error reading dir', srcdir, err );
            return;
        }
        files.forEach( file => {
            
            const ext = path.extname( file );
    
            //console.log( 'process', file, ext );
            if( ext === '.ts' ) {
    
                const src = path.join( srcdir, file );
                const dest = path.join( destdir, file + '.txt');
    
                _copyFile( 
                    src, 
                    dest,
                    err => {
                        if( err )
                            console.error( 'error copying file', src, 'to', dest, err );
                        else 
                            console.error( 'file', src, 'copied to', dest, err );
                    });
    
            }
    
        } )
    
      }); 
  
  }
  
  async function main() {

    try {
        await fsx.ensureDir(  destdir ) ;        
    } catch (err) {
        console.error('error creating dir', destdir, err);
        return;
    }

    // try {

    //     await fsx.emptyDir(destdir);
        
    // } catch (err) {
    //     console.error( 'error cleaning dir', destdir, err );
    // }
  
  
  _copyFiles();

}

  
main();