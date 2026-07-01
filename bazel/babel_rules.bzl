def babel_preprocess(name, srcs):
    outs = []
    for src in srcs:
        if not src.startswith("node/lib/"):
            fail("Source file '%s' must start with 'node/lib/'" % src)
            
        # Strip "node/lib/" to output under "nodejs/" in the main package
        rel_path = src[len("node/lib/"):]
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
            cmd = "python $(location //bazel:compile.py) $(location @babel_deps//:node_modules/@babel/cli/bin/babel.js) $(location %s) $@ $(location //bazel:babel.config.json)" % src,
        )
        
    native.filegroup(
        name = name,
        srcs = outs,
    )
