def babel_preprocess(name, srcs):
    outs = []
    for src in srcs:
        if not src.startswith("node/lib/"):
            fail("Source file '%s' must start with 'node/lib/'" % src)

        # Strip "node/lib/" to output under "nodejs/" in the main package
        rel_path = src[len("node/lib/"):]
        out = "nodejs/" + rel_path
        outs.append(out)

        # If this is our custom preprocessed primordials.js, we don't copy it from external repo.
        # Instead, it is checked in as a source file.
        if rel_path == "internal/per_context/primordials.js":
            continue

        # Unique target name per file to enable full parallelism and individual caching
        target_name = name + "_" + rel_path.replace("/", "_").replace(".", "_")

        # Source file in external repo babel_preprocessed
        ext_src = "@babel_preprocessed//:nodejs/" + rel_path

        # Copied via standard, cross-platform MSYS 'cp' inside the sandbox
        native.genrule(
            name = target_name,
            srcs = [ext_src],
            outs = [out],
            cmd = "cp $< $@",
        )

    native.filegroup(
        name = name,
        srcs = outs,
    )
