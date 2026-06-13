# Agent Guidelines and Workspace Instructions (`AGENTS.md`)

Welcome, Agent! You are working on **Ithaca**, an implementation of the Node.js API runtime environment built on top of the **Mozilla Rhino JavaScript Engine** running in the Java Virtual Machine (JVM).

This document serves as your foundational instruction manual, system architectural map, and delegation guide. It is automatically loaded into your context by Gemini CLI when configured.

---

## 1. Project Overview & Architecture

Ithaca replaces the C++ layer of Node.js with a lightweight Java compatibility layer and hooks it up to the Rhino engine. It bootstraps the environment using standard Node.js core JavaScript modules.

### High-Level Architecture
```
┌─────────────────────────────────────────────────────┐
│  Java (JVM) Layer                                   │
│  - Bootstrapper, Environment, and Loader            │
│  - Java-to-JS shims & bindings (Process, Timers...)  │
│  - Mozilla Rhino Context and Scope management       │
├─────────────────────────────────────────────────────┤
│  Bootstrap Layer (JS/Java bindings)                 │
│  - nodejs/internal/per_context/primordials.js       │
│  - nodejs/internal/bootstrap/realm.js               │
│  - nodejs/internal/bootstrap/node.js                │
├─────────────────────────────────────────────────────┤
│  User Land / Core Modules                           │
│  - standard Node.js APIs (buffer.js, fs.js, etc.)   │
└─────────────────────────────────────────────────────┘
```

### Directory Map
* **`src/main/java/org/brail/ithaca/`**: Core Java source code.
  * `Main.java`: The entry point for the CLI. It initializes the Rhino context, creates the global scope, and invokes the bootstrapper.
  * `internal/Bootstrapper.java`: Orchestrates the bootstrap sequence (primordials → realm → node.js initialization).
  * `internal/Loader.java`: Loads JavaScript resources from the `nodejs/` directory.
  * `internal/Environment.java`: Maintains state across a single Realm/context.
  * `internal/bindings/`: The Java implementation of Node's standard C++ `internalBinding` and `linkedBinding` modules (e.g., `Process.java`, `Timers.java`, `Buffer.java`).
* **`nodejs/`**: JavaScript files from the Node.js project.
  * `internal/bootstrap/`: Node's internal startup JS scripts.
  * Standard library shims (e.g., `fs.js`, `path.js`, `buffer.js`).
* **`BUILD.bazel`**: The Bazel build file defining target `:ithaca` (java library) and `:ithaca-cli` (executable binary).

---

## 2. Command Reference

Use these commands to build, run, and test the project.

### Build the CLI
```powershell
bazel build :ithaca-cli
```

### Run the CLI
```powershell
bazel run :ithaca-cli
```

### Run with Custom File / Arguments
*(To execute custom scripts using the Ithaca runtime once user module running is implemented)*
```powershell
bazel run :ithaca-cli -- <path-to-js-file>
```

---

## 3. Gemini CLI Configuration

To ensure Gemini CLI loads this file as the primary workspace context and enables custom subagents, place the following configuration in your project's `.gemini/settings.json`:

```json
{
  "context": {
    "fileName": ["AGENTS.md", "GEMINI.md"]
  },
  "agents": {
    "overrides": {
      "node-compat-expert": { "enabled": true },
      "bazel-test-runner": { "enabled": true },
      "rhino-runtime-expert": { "enabled": true }
    }
  }
}
```

---

## 4. Specialized Subagents

We define three specialized subagents to assist with different facets of Ithaca's development. You can find or create their definitions in `.gemini/agents/`.

### A. Node compatibility Expert (`.gemini/agents/node-compat-expert.md`)
* **Role**: Resolves compatibility disparities between Node.js core JavaScript modules and Mozilla Rhino engine features.
* **When to delegate**: 
  - Script errors during bootstrap (e.g., `TypeError: Not callable as function (internal/buffer.js#8)`).
  - Unimplemented standard Node.js global properties or builtins.
  - ES6 feature support issues inside Rhino (e.g., transpilation issues, Symbol/Reflect shims).

### B. Bazel Test Runner (`.gemini/agents/bazel-test-runner.md`)
* **Role**: High-efficiency runner of builds, compilation checking, and dependency updates.
* **When to delegate**: 
  - Adding new dependencies to `MODULE.bazel` or `maven_install.json`.
  - Batch rebuilding and regression testing.
  - Adding resources to `BUILD.bazel`.

### C. Rhino Runtime Expert (`.gemini/agents/rhino-runtime-expert.md`)
* **Role**: Specializes in Rhino-specific Java APIs (`org.mozilla.javascript.*`), scope chain binding, context safety, and JVM-to-JS object translation.
* **When to delegate**:
  - Writing new native bindings in `src/main/java/org/brail/ithaca/internal/bindings/`.
  - Handling conversions between Java arrays/objects and JS arrays/objects.
  - Ensuring correct scope access rules and handling exceptions safely.

---

## 5. Development Guidelines for Agents

When implementing features or fixing bugs in Ithaca, adhere strictly to these principles:

### I. Correct Rhino Context Lifecycle
Always wrap your usage of standard Rhino `Context` objects in try-with-resources blocks to ensure they are properly entered and exited, avoiding context leakage:
```java
try (Context cx = Context.enter()) {
    // Perform JS execution
}
```

### II. Explicit Type Casting and Mapping
Rhino performs some implicit conversions, but when interacting with Node's expected types (like typed arrays or ArrayBuffers), you must implement explicit wrapping. 
* Use `org.mozilla.javascript.Undefined` when representing JS `undefined`.
* When passing objects back to JavaScript, wrap them in `org.mozilla.javascript.Scriptable` or inherit from `ScriptableObject`.

### III. Keep Transpiled JavaScript Clean
The `nodejs/` files are standard Node.js sources (sometimes lightly transpiled). Avoid modifying them unless absolutely necessary. If a standard JS file throws a syntax or prototype error under Rhino, prefer:
1. **Globals/Polyfill Shimming**: Implement the missing feature in Java or in `Bootstrapper.patchGlobals()`.
2. **Rhino Configuration Adjustments**: Check if a Rhino language version setting can enable the feature (e.g., `cx.setLanguageVersion(Context.VERSION_ES6)`).

### IV. Incremental Verification
Whenever you modify Java bindings:
1. Build the target to ensure Java compilation is successful.
2. Run `:ithaca-cli` and verify that the bootstrap process advances past your target module without error.
3. Check the SLF4J debug logs to trace the compilation and execution of files.
