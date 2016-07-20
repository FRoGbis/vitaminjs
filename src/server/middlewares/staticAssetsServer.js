import serve from 'koa-static';
import mount from 'koa-mount';
import compose from 'koa-compose';
import send from 'koa-send';
import path from 'path';
import config from '../../../config';
export default () =>
    mount(
        config.build.client.publicPath,
        compose([
            function* serveClientBundle(next) {
                /* global __VITAMIN__CLIENT_BUNDLE_VERSION__ */
                const filename = config.build.client.filename.replace(
                    /\[hash\]/,
                    __VITAMIN__CLIENT_BUNDLE_VERSION__
                );
                if (this.url === `/${filename}`) {
                    yield send(this, filename, {
                        root: config.build.path,
                    });
                } else {
                    yield next;
                }
            },
            mount('/files', serve(path.join(config.build.path, 'files'))),
        ]),
    )
;
