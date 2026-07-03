def babel_preprocess(name, srcs):
    outs = []
    for src in srcs:
        if src.startswith("node/lib"):
            rel_path = src[len("node/lib/"):]
        elif src.startswith("nodejs-local"):
            rel_path = src[len("nodejs-local/"):]
        else:
            fail("Source file '%s' must start with 'node/lib/' or '/nodejs-local'" % src)

        out = "nodejs/" + rel_path
        outs.append(out)

        # Unique target name per file to enable full parallelism and individual caching
        target_name = name + "_" + rel_path.replace("/", "_").replace(".", "_")

        # Compiled via Babel on a per-file basis using python helper
        native.genrule(
            name = target_name,
            srcs = [
                src,
                "//bazel:babel.config.json",
                "//bazel:compile.py",
                "@babel_deps//:node_modules",
                "@babel_deps//:node_modules/@babel/cli/bin/babel.js",
            ],
            outs = [out],
            cmd = "python3 $(location //bazel:compile.py) $(location @babel_deps//:node_modules/@babel/cli/bin/babel.js) $(location %s) $@ $(location //bazel:babel.config.json)" % src,
        )

    native.filegroup(
        name = name,
        srcs = outs,
    )
