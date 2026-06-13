load("@rules_java//java:defs.bzl", "java_test")
load("@contrib_rules_jvm//java:defs.bzl", "JUNIT5_RUNTIME_DEPS")

def junit5_test(
        name,
        test_class = None,
        runtime_deps = [],
        package_prefixes = [],
        jvm_flags = [],
        include_tags = [],
        exclude_tags = [],
        include_engines = [],
        exclude_engines = [],
        data = [],
        **kwargs):
    """Run junit5 tests using Bazel.

    This is designed to be a drop-in replacement for `java_test`, but
    rather than using a JUnit4 runner it provides support for using
    JUnit5 directly. The arguments are the same as used by `java_test`.

    By default Bazel, and by extension this rule, assumes you want to
    always run all of the tests in a class file.  The `include_tags`
    and `exclude_tags` allows for selectively running specific tests
    within a single class file based on your use of the `@Tag` Junit5
    annotations. Please see [the JUnit 5
    docs](https://junit.org/junit5/docs/current/user-guide/#running-tests-tags)
    for more information about using JUnit5 tag annotation to control
    test execution.

    The generated target does not include any JUnit5 dependencies. If
    you are using the standard `@maven` namespace for your
    `maven_install` you can add these to your `deps` using
    `JUNIT5_DEPS` or `JUNIT5_VINTAGE_DEPS` loaded from
    `//java:defs.bzl`

    **Note**: The junit5 runner prevents `System.exit` being called
    using a Java agent, which means that one test can't prematurely
    cause an entire test run to finish unexpectedly.

    Args:
      name: The name of the test.
      test_class: The Java class to be loaded by the test runner. If not
        specified, the class name will be inferred from a combination of
        the current bazel package and the `name` attribute.
      include_tags: Junit5 tag expressions to include execution of tagged tests.
      exclude_tags: Junit tag expressions to exclude execution of tagged tests.
      include_engines: A list of JUnit Platform test engine IDs to include.
      exclude_engines: A list of JUnit Platform test engine IDs to exclude.
    """

    java_test(
        name = name,
        main_class = "com.github.bazel_contrib.contrib_rules_jvm.junit5.JUnit5Runner",
        runtime_deps = runtime_deps + JUNIT5_RUNTIME_DEPS,
        **kwargs
    )