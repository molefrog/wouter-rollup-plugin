import { type Plugin } from "rollup";
import { RollupOptions } from "rollup";

import { folderPatternToWouterPath, compareRoutesBySpecificity } from "./fileSystemRouting";

import { parse as pathToRegex } from "regexparam";
import { dirname, isAbsolute, relative, basename, resolve, join as pathJoin } from "node:path";
import { glob } from "glob";
import { inspect } from "node:util";

interface Page {
  source: string;
  pattern: string;
  meta: {
    wild?: string;
    params: string[];
  };
}

async function fetchRoutes(routesDir: string) {
  const files = await glob("./**/page.{ts,js}?(x)", {
    cwd: routesDir,
    absolute: false,
    posix: true, // always use "/" as path separator
  });

  const pages: Page[] = files.map((file) => {
    const folder = dirname("/" + file);
    const source = resolve(pathJoin(routesDir, file));

    const [pattern, meta] = folderPatternToWouterPath(folder);
    const { keys: params, pattern: regexp } = pathToRegex(pattern);

    // if pattern has a wildcard, rename this parameter, e.g. [[name]]
    const wildIdx = params.findIndex((el) => el === "*");
    if (wildIdx !== -1 && meta.wild !== undefined) {
      params[wildIdx] = meta.wild;
    }

    return {
      source,
      pattern,
      regexp,
      meta: {
        ...meta,
        params,
      },
    };
  });

  const sortedPages = pages.sort((lhs, rhs) =>
    compareRoutesBySpecificity(lhs.pattern, rhs.pattern)
  );

  return sortedPages;
}

const ID = "\0wouter:routes";

interface PluginOptions {
  routesDir?: string;
}

export default function wouterRoutesPlugin({ routesDir }: PluginOptions = {}): Plugin {
  if (routesDir === undefined) {
    routesDir = "routes";
  }

  if (!isAbsolute(routesDir)) {
    routesDir = relative(process.cwd(), routesDir);
  }

  routesDir = resolve(routesDir);

  return {
    name: "wouter-routes-plugin",

    options(_options: RollupOptions) {
      this.debug(() => {
        const relDir = relative(process.cwd(), routesDir);
        return `Using "${relDir}" folder to locate the routes`;
      });
    },

    async buildStart() {
      // watch for new pages added
      this.addWatchFile(routesDir);
    },

    watchChange(id, change) {
      // TODO: if change is in routesDir, rebuild the route structure
    },

    resolveId(id, _importer) {
      if (id === "wouter:routes") {
        return ID;
      }
    },

    load: {
      order: "pre",
      async handler(id) {
        if (id !== ID) {
          return;
        }

        const pages = await fetchRoutes(routesDir);
        this.debug(`Discovered ${pages.length} pages`);
        this.debug(inspect(pages));

        const src = `
import { createElement } from "react";
import { Route, Switch } from "wouter";

${pages
  .map((page, key) => {
    return `import Page$${key} from ${JSON.stringify(page.source)}`;
  })
  .join(";\n")}

export default function Routes() {
  return createElement(Switch, {
    children: [
${pages
  .map((page, key) => {
    return `createElement(Route, { path: ${JSON.stringify(
      page.pattern
    )}, component: Page$${key} })`;
  })
  .join(",\n")}
    ],
  });
}
`;
        return src;
      },
    },
  };
}
