cat ./src/Emitter.js | sed "s/export //g" > ./BmEmitter/Emitter.js
cd ./BmEmitter
clasp push