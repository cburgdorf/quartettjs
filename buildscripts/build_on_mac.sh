#! /bin/bash

node build.js
uglifyjs -o ../build/quartett.min.js ../build/quartett.js
