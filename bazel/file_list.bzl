def _file_list_impl(ctx):
    paths = []
    strip_prefix = ctx.attr.strip_prefix
    strip_suffix = ctx.attr.strip_suffix
    for f in ctx.files.srcs:
        path = f.short_path
        # Strip the specified prefix
        if strip_prefix and path.startswith(strip_prefix):
            path = path[len(strip_prefix):]
            if path.startswith("/"):
                path = path[1:]
        # Strip the specified suffix
        if strip_suffix and path.endswith(strip_suffix):
            path = path[:-len(strip_suffix)]
        paths.append(path)
    
    # Deterministically sort the file list
    sorted_paths = sorted(paths)
    
    # Write the recursively listed files to the output target
    out_file = ctx.outputs.out
    ctx.actions.write(
        output = out_file,
        content = "\n".join(sorted_paths) + "\n",
    )
    return [DefaultInfo(files = depset([out_file]))]

file_list = rule(
    implementation = _file_list_impl,
    attrs = {
        "srcs": attr.label_list(allow_files = True, doc = "Source files to list"),
        "strip_prefix": attr.string(doc = "Prefix to strip from the file paths"),
        "strip_suffix": attr.string(doc = "Suffix to strip from the file paths"),
    },
    outputs = {
        "out": "%{name}.txt",
    },
)
