#!/bin/sh

bazel build //:googlejavaformat

all_java=$(find src -type f -name \*.java)
bazel-bin/googlejavaformat --dry-run --set-exit-if-changed ${all_java}
if [ $? -ne 0 ]
then
  echo "*** Java formatting failures detected. Run fixformat.sh ***"
fi

all_bazel="$(ls bazel/*.bzl) $(ls *.bazel)"
buildifier -mode check ${all_bazel}
if [ $? -ne 0 ]
then
  echo "*** Bazel formatting failures detected. Run fixformat.sh ***"
fi