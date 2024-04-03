import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { Switch, Route, Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { createElement } from 'react';

function Index$4() {
    return jsx(Fragment, { children: "Root Page" });
}

function About$3() {
    return jsx(Fragment, { children: "About s" });
}

function Index$3() {
    return jsx(Fragment, { children: "Index page" });
}

function Index$2() {
    return jsx(Fragment, { children: "Index page" });
}

function Index$1() {
    return jsx(Fragment, { children: "Index page" });
}

function Index() {
    return jsx(Fragment, { children: "Index page" });
}

function About$2() {
    return jsx(Fragment, { children: "Page with single segment [id]" });
}

function About$1({ params }) {
    return jsxs(Fragment, { children: ["Page ", params["*"], " not fofsdfn (404)"] });
}

function About() {
  return "Settings with wildcard ";
}

function Routes() {
  return createElement(Switch, {
    children: [
createElement(Route, { path: "/", component: Index$4 }),
createElement(Route, { path: "/about", component: About$3 }),
createElement(Route, { path: "/orders/:id", component: Index$3 }),
createElement(Route, { path: "/orders/:id-legacy", component: Index$2 }),
createElement(Route, { path: "/orders/:id.(json|mp3)", component: Index$1 }),
createElement(Route, { path: "/orders/*?", component: Index }),
createElement(Route, { path: "/:id", component: About$2 }),
createElement(Route, { path: "/*", component: About$1 }),
createElement(Route, { path: "/*/settings", component: About })
    ],
  });
}

const Main = () => {
    return (jsxs(Router, { hook: useHashLocation, children: [jsx("h1", { children: "App" }), jsx(Routes, {})] }));
};
console.log(jsx(Main, {}));
