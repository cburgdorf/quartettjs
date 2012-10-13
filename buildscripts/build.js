    // settings
    var FILE_ENCODING = 'utf-8',
        EOL = '\n',
        DIST_FILE_PATH = '../build/quartett.js';

    // setup
    var _fs = require('fs');

    function concat(fileList, distPath) {
        var out = fileList.map(function(filePath){
                return _fs.readFileSync(filePath, FILE_ENCODING);
            });
        _fs.writeFileSync(distPath, out.join(EOL), FILE_ENCODING);
        console.log(' '+ distPath +' built.');
    }

    concat([
        'LICENSE.txt',
        '../src/quartett.core.js',
        '../src/quartett.util.js',
        '../src/quartett.cardstack.js',
        '../src/quartett.defaultcardcomparer.js',
        '../src/quartett.game.js',
        '../src/quartett.player.js'
    ], DIST_FILE_PATH);