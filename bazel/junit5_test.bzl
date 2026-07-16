load("@rules_java//java:defs.bzl", "java_test")

def junit5_test(
        name,
        test_class,
        runtime_deps = [],
        **kwargs):
    """Run junit5 tests using Bazel.

       This works the same way as java_test but uses the JUnit5 runner.
    """

    java_test(
        name = name,
        main_class = "org.brail.ithaca.JUnit5Runner",
        args = [test_class],
        runtime_deps = runtime_deps + [
            "@maven//:org_junit_platform_junit_platform_launcher",
            "@maven//:org_junit_platform_junit_platform_engine",
            "@maven//:org_junit_jupiter_junit_jupiter_engine",
            ":junit5_runner",
        ],
        test_class = "org.brail.ithaca.JUnit5Runner",
        **kwargs
    )
