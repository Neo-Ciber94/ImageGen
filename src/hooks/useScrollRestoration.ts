import { useEffect } from 'react';
import Router, { type NextRouter } from 'next/router';

// Adapted from: https://gist.github.com/claus/992a5596d6532ac91b24abe24e10ae81

export function useScrollRestoration(router: NextRouter) {
    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            let shouldScrollRestore = false;
            window.history.scrollRestoration = 'manual';
            restoreScrollPos(router.asPath);

            const onBeforeUnload = () => {
                saveScrollPos(router.asPath);
            };

            const onRouteChangeStart = () => {
                saveScrollPos(router.asPath);
            };

            const onRouteChangeComplete = (url: string) => {
                if (shouldScrollRestore) {
                    shouldScrollRestore = false;
                    restoreScrollPos(url);
                }
            };

            window.addEventListener('beforeunload', onBeforeUnload);
            Router.events.on('routeChangeStart', onRouteChangeStart);
            Router.events.on('routeChangeComplete', onRouteChangeComplete);
            Router.beforePopState(() => {
                shouldScrollRestore = true;
                return true;
            });

            return () => {
                window.removeEventListener('beforeunload', onBeforeUnload);
                Router.events.off('routeChangeStart', onRouteChangeStart);
                Router.events.off('routeChangeComplete', onRouteChangeComplete);
                Router.beforePopState(() => true);
            };
        }
    }, [router]);
}

function saveScrollPos(url: string) {
    const scrollPos = { x: window.scrollX, y: window.scrollY };
    sessionStorage.setItem(url, JSON.stringify(scrollPos));
}

function restoreScrollPos(url: string) {
    const scrollPosJson = sessionStorage.getItem(url);

    if (scrollPosJson == null) {
        return;
    }

    const scrollPos = JSON.parse(scrollPosJson) as { x: number, y: number };

    if (scrollPos) {
        window.scrollTo(scrollPos.x, scrollPos.y);
    }
}
