import type { QuickJSContext, QuickJSRuntime } from "quickjs-emscripten";
import type { PyodideInterface } from "pyodide";

interface OutputLine {
  type: "log" | "error" | "warn" | "info";
  content: string;
  timestamp: Date;
}

let quickjsModulePromise:
  | Promise<import("quickjs-emscripten").QuickJSEmscriptenModule>
  | null = null;

let pyodidePromise: Promise<PyodideInterface> | null = null;

const getQuickJSModule = async () => {
  if (!quickjsModulePromise) {
    quickjsModulePromise = import("quickjs-emscripten").then(({ getQuickJS }) =>
      getQuickJS()
    );
  }

  return quickjsModulePromise;
};

const getPyodide = async () => {
  if (!pyodidePromise) {
    pyodidePromise = import("pyodide").then(({ loadPyodide }) =>
      loadPyodide({
        indexURL:
          import.meta.env.VITE_PYODIDE_URL ??
          "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
      })
    );
  }

  return pyodidePromise;
};

const stringifyValue = (value: unknown) => {
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const buildConsoleHandler =
  (
    context: QuickJSContext,
    output: OutputLine[],
    type: OutputLine["type"]
  ) =>
  (...args: import("quickjs-emscripten").QuickJSHandle[]) => {
    const content = args
      .map((arg) => {
        const value = context.dump(arg);
        arg.dispose();
        return stringifyValue(value);
      })
      .join(" ");

    output.push({ type, content, timestamp: new Date() });
  };

export const executeJavaScript = async (code: string): Promise<OutputLine[]> => {
  const output: OutputLine[] = [];
  const quickjs = await getQuickJSModule();
  const runtime: QuickJSRuntime = quickjs.newRuntime();
  const context: QuickJSContext = runtime.newContext();

  const consoleHandle = context.newObject();
  const logHandle = context.newFunction(
    "log",
    buildConsoleHandler(context, output, "log")
  );
  const errorHandle = context.newFunction(
    "error",
    buildConsoleHandler(context, output, "error")
  );
  const warnHandle = context.newFunction(
    "warn",
    buildConsoleHandler(context, output, "warn")
  );
  const infoHandle = context.newFunction(
    "info",
    buildConsoleHandler(context, output, "info")
  );

  context.setProp(consoleHandle, "log", logHandle);
  context.setProp(consoleHandle, "error", errorHandle);
  context.setProp(consoleHandle, "warn", warnHandle);
  context.setProp(consoleHandle, "info", infoHandle);
  context.setProp(context.global, "console", consoleHandle);

  try {
    const result = context.evalCode(code);

    if (result.error) {
      const errorValue = context.dump(result.error);
      output.push({
        type: "error",
        content:
          errorValue && typeof errorValue === "object"
            ? stringifyValue(errorValue)
            : String(errorValue),
        timestamp: new Date(),
      });
      result.error.dispose();
    } else if (result.value) {
      const value = context.dump(result.value);
      if (value !== undefined) {
        output.push({
          type: "log",
          content: `=> ${stringifyValue(value)}`,
          timestamp: new Date(),
        });
      }
      result.value.dispose();
    }
  } catch (error) {
    output.push({
      type: "error",
      content: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      timestamp: new Date(),
    });
  } finally {
    logHandle.dispose();
    errorHandle.dispose();
    warnHandle.dispose();
    infoHandle.dispose();
    consoleHandle.dispose();
    context.dispose();
    runtime.dispose();
  }

  return output;
};

export const executePython = async (code: string): Promise<OutputLine[]> => {
  const output: OutputLine[] = [];
  const pyodide = await getPyodide();

  pyodide.setStdout({
    batched: (text) => {
      const trimmed = text.replace(/\n$/, "");
      if (trimmed.length === 0) return;
      output.push({ type: "log", content: trimmed, timestamp: new Date() });
    },
  });

  pyodide.setStderr({
    batched: (text) => {
      const trimmed = text.replace(/\n$/, "");
      if (trimmed.length === 0) return;
      output.push({ type: "error", content: trimmed, timestamp: new Date() });
    },
  });

  try {
    const result = await pyodide.runPythonAsync(code);
    if (result !== undefined) {
      output.push({
        type: "log",
        content: `=> ${stringifyValue(result)}`,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    output.push({
      type: "error",
      content: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      timestamp: new Date(),
    });
  }

  return output;
};
