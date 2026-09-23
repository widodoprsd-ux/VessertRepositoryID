Place your photo binaries here.

Supported extensions: webp, avif, jpg, jpeg, png

The build script copies every file in this folder into
dist/assets/source/photo/ and adds a content hash.

PNG is also generated programmatically by build.js under
assets/raster/ for icons. Photos that require WebP or AVIF
must be supplied here because those encoders are not
implemented in pure Node.