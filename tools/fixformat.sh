#!/bin/sh

bazel build //:googlejavaformat

all_files=$(find . -type f -name \*.java)
bazel-bin/googlejavaformat --replace ${all_files}

all_bazel="$(ls bazel/*.bzl) $(ls *.bazel)"
buildifier -mode fix ${all_bazel}
