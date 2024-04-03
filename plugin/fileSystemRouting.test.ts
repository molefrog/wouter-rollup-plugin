import { describe, test, expect } from "vitest";
import { folderPatternToWouterPath, compareRoutesBySpecificity } from "./fileSystemRouting"; // Adjust the import path as necessary

import shuffle from "lodash-es/shuffle";

describe("`folderPatternToWouterPath`", () => {
  const transform = folderPatternToWouterPath; // alias

  test("static paths", () => {
    expect(transform("/")).toEqual(["/", {}]);
    expect(transform("/home")).toEqual(["/home", {}]);
  });

  test("dynamic segments", () => {
    expect(transform("/[id]")).toEqual(["/:id", {}]);
    expect(transform("/users/[id]")).toEqual(["/users/:id", {}]);
    expect(transform("/пользователи/[айди]")).toEqual(["/пользователи/:айди", {}]);
  });

  test("wildcards", () => {
    expect(transform("/[[id]]")).toEqual(["/*", { wild: "id" }]);
    expect(transform("/user/[id]/profile[[rest]]")).toEqual([
      "/user/:id/profile*",
      { wild: "rest" },
    ]);
    expect(transform("/[[page]]/static/[number]")).toEqual(["/*/static/:number", { wild: "page" }]);
  });

  test("optional segments and wildcards", () => {
    expect(transform("/page/[...opt]/view")).toEqual(["/page/:opt?/view", {}]);
    expect(transform("/[[...rest]]")).toEqual(["/*?", { wild: "rest" }]);
    expect(transform("/[id]-[page]")).toEqual(["/:id-:page", {}]);
  });

  test("should handle mixed static and dynamic segments", () => {
    expect(transform("/user-[name]")).toEqual(["/user-:name", {}]);
    expect(transform("/user[name]")).toEqual(["/user:name", {}]);
  });

  test("mailformed strings are ignored", () => {
    expect(transform("/[[]]")).toEqual(["/[[]]", {}]);
    expect(transform("/[]]")).toEqual(["/[]]", {}]);
    expect(transform("/[[...]]")).toEqual(["/[[...]]", {}]);
  });
});

describe("sorting routes by specificity", () => {
  const sortRoutes = (routes: string[]) => routes.sort(compareRoutesBySpecificity);

  test("static segments are sorted alphabetically", () => {
    const sortedRoutes = ["/", "/00", "/about", "/www", "/роут"];
    const result = sortRoutes(shuffle(sortedRoutes));

    expect(result).toEqual(sortedRoutes);
  });

  test("dynamic segments are sorted by specificity (highest to lowest)", () => {
    const sortedRoutes = [
      "/",
      "/about",
      "/www",
      "/users/123",
      "/users/profile",
      "/users/1/*",
      "/users/:id",
      "/users/:id/profile",
      "/users/:id/*",
      "/users/:id?/profile",
      "/users/*",
      "/:id",
      "/:id?",
      "/*",
      "/*?",
    ];

    const result = sortRoutes(shuffle(sortedRoutes));

    expect(result).toEqual(sortedRoutes);
  });

  test.skip("sorts nested wildcards", () => {
    expect(
      sortRoutes([
        //
        "/foo/*",
        "/foo/*/baz",
        "/*/foo/bar",
        "/foo/bar/*",
        "/*",
        "/foo/bar/baz",
      ])
    ).toEqual([
      "/foo/bar/baz",
      "/foo/bar/*",
      "/foo/*/baz", // FIXME: this one has higher prio
      "/foo/*",
      "/*/foo/bar", // FIXME: this one has higher prio
      "/*",
    ]);
  });
});
