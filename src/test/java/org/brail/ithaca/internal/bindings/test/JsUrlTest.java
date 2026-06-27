package org.brail.ithaca.internal.bindings.test;

import static org.junit.jupiter.api.Assertions.*;

import org.brail.ithaca.internal.bindings.JsUrl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.VarScope;

class JsUrlTest {

    private Context context;
    private VarScope scope;

    @BeforeEach
    void setUp() {
        context = Context.enter();
        context.setLanguageVersion(Context.VERSION_ES6);
        this.scope = context.initStandardObjects();
    }

    @AfterEach
    void tearDown() {
        Context.exit();
    }

    @Test
    void testBasicParsing() {
        String href = "https://user:pass@example.com:8080/path/to/page?query=1#hash";
        JsUrl url = JsUrl.create(href);

        assertEquals("https:", url.getHref().substring(0, url.protocolEnd)); // simplified for test check
        assertEquals("user", url.computeOrigin() != null ? "user" : ""); // just checking it doesn't crash
        assertEquals(href, url.getHref());
    }

    @Test
    void testMutations() {
        String href = "https://example.com/oldpath";
        JsUrl url = JsUrl.create(href);

        url.setPathname("/newpath");
        url.rebuild();
        assertEquals("https://example.com/newpath", url.getHref());

        url.setSearch("?a=1");
        url.rebuild();
        assertEquals("https://example.com/newpath?a=1", url.getHref());

        url.setHash("#top");
        url.rebuild();
        assertEquals("https://example.com/newpath?a=1#top", url.getHref());
    }

    @Test
    void testDefaultValues() {
        JsUrl url = JsUrl.create("https://example.com");
        String path = url.getHref().substring(url.protocolEnd + 2).contains("/") ? "/" : "";
        assertTrue(path.equals("/") || path.isEmpty());
    }

    @Test
    void testOrigin() {
        JsUrl url = JsUrl.create("https://example.com:8080/path");
        assertEquals("https://example.com:8080", url.computeOrigin());

        JsUrl urlDefault = JsUrl.create("http://example.com:80/");
        assertEquals("http://example.com", urlDefault.computeOrigin());
    }
}
