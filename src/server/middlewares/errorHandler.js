import Error404 from '__app_modules__server_Error404Page__';
import Error500 from '__app_modules__server_Error500Page__';
import CSSProvider from '../../shared/components/CSSProvider';
import { renderLayout } from '../render';
import { renderToString } from 'react-dom/server';
import Helmet from 'react-helmet';


// TODO : Add a __PRODUCTION__ global variable, instead of NODE_ENV
const renderRawError = (status, renderingError) => (
    process.env.NODE_ENV === 'production' ?
            status
        : `
            <h2> Error while rendering the ${status} error page.</h2>
            <p>You might want to check the Error${status} component</p>
            <strong>${renderingError.name}: ${renderingError.message}</strong>
            <pre><code>${renderingError.stack}</pre></code>
            <hr>
        `
);

const renderErrorPage = (ErrorPage) => {
    const css = [];
    const insertCss = (styles) => css.push(styles._getCss());

    const app = (<CSSProvider insertCss={insertCss}>
        <ErrorPage />
    </CSSProvider>);

    return renderLayout({
        appHtmlString: renderToString(app),
        style: css.join(''),
        head: Helmet.rewind(),
    });
};

export default () => function *errorHandlerMiddleware(next) {
    let errorPage;
    try {
        yield next;
    } catch (err) {
        errorPage = () =>
            <Error500 error={process.env.NODE_ENV === 'production' ? null : err} />;
        this.status = 500;
        this.app.emit('error', err, this);
    }
    if (this.status === 404) {
        errorPage = Error404;
    }
    if (errorPage) {
        try {
            this.body = renderErrorPage(errorPage);
        } catch (renderingError) {
            this.body = renderRawError(this.status, renderingError);
        }
        this.type = 'html';
    }
};
