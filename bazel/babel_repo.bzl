def _babel_preprocess_repo_impl(repository_ctx):
    # Get the path to node/lib and configuration files in the workspace
    assert_js_path = repository_ctx.path(repository_ctx.attr.node_lib_dir)
    node_lib_dir = assert_js_path.dirname
    package_json = repository_ctx.path(repository_ctx.attr.package_json)
    package_lock = repository_ctx.path(repository_ctx.attr.package_lock)
    config_file = repository_ctx.path(repository_ctx.attr.config_file)

    # Let's find python
    python = repository_ctx.which("python") or repository_ctx.which("python3")
    if not python:
        fail("Python is required.")

    # We will write a python helper script "preprocess.py"
    repository_ctx.file("preprocess.py", """
import shutil
import subprocess
import sys
import os

def main():
    src_dir = sys.argv[1]
    pkg_json = sys.argv[2]
    pkg_lock = sys.argv[3]
    cfg_file = sys.argv[4]
    
    # Copy node/lib to local "node_lib"
    if os.path.exists("node_lib"):
        shutil.rmtree("node_lib")
    shutil.copytree(src_dir, "node_lib")
    
    # Copy package files and config
    shutil.copy2(pkg_json, "package.json")
    shutil.copy2(pkg_lock, "package-lock.json")
    shutil.copy2(cfg_file, "babel.config.json")
    
    # Run npm ci
    print("Running npm ci...")
    res = subprocess.run(["npm", "ci"], shell=True)
    if res.returncode != 0:
        print("npm ci failed with code", res.returncode)
        sys.exit(res.returncode)
        
    # Run babel compilation
    print("Running Babel...")
    if os.path.exists("nodejs"):
        shutil.rmtree("nodejs")
    res = subprocess.run(["npx", "babel", "node_lib", "--out-dir", "nodejs", "--config-file", "./babel.config.json", "--source-type", "script", "--copy-files"], shell=True)
    if res.returncode != 0:
        print("Babel compilation failed with code", res.returncode)
        sys.exit(res.returncode)
        
    print("Preprocessing completed successfully!")

if __name__ == "__main__":
    main()
""")

    # Now execute the Python script
    res = repository_ctx.execute([
        python,
        "preprocess.py",
        str(node_lib_dir),
        str(package_json),
        str(package_lock),
        str(config_file),
    ], timeout = 600)

    if res.return_code != 0:
        fail("Babel preprocessing repository rule failed:\n%s\n%s" % (res.stdout, res.stderr))

    # Print the output log so developers can see it
    print(res.stdout)

    # Create a BUILD.bazel file in the repository to expose the preprocessed files
    repository_ctx.file("BUILD.bazel", """
filegroup(
    name = "preprocessed_node_lib",
    srcs = glob(["nodejs/**/*.js"]),
    visibility = ["//visibility:public"],
)

exports_files(
    glob(["nodejs/**/*.js"]),
    visibility = ["//visibility:public"],
)
""")

babel_preprocess_repo = repository_rule(
    implementation = _babel_preprocess_repo_impl,
    attrs = {
        "node_lib_dir": attr.label(mandatory = True, allow_single_file = True),
        "package_json": attr.label(mandatory = True, allow_single_file = True),
        "package_lock": attr.label(mandatory = True, allow_single_file = True),
        "config_file": attr.label(mandatory = True, allow_single_file = True),
    },
)

def _babel_preprocess_extension_impl(module_ctx):
    babel_preprocess_repo(
        name = "babel_preprocessed",
        node_lib_dir = "//:node/lib/assert.js",
        package_json = "//bazel:package.json",
        package_lock = "//bazel:package-lock.json",
        config_file = "//bazel:babel.config.json",
    )

babel_preprocess_extension = module_extension(
    implementation = _babel_preprocess_extension_impl,
)
