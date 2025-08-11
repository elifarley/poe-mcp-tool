import { ChildProcessByStdio, spawn } from "child_process";
import { Readable, Writable } from "stream";
import { Logger } from "./logger.js";

export async function executeCommand(
  command: string,
  args: string[],
  onProgress?: (newOutput: string) => void,
  stdinData?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    Logger.commandExecution(command, args, startTime);

    let childProcess: ChildProcessByStdio<Writable | null, Readable, Readable>;
    let stdout = "";
    let stderr = "";
    let isResolved = false;
    let lastReportedLength = 0;
    
    // Only use shell on Windows to avoid injection risks on Unix-like systems
    const isWindows = process.platform === 'win32';

    if (stdinData) {
      childProcess = spawn(command, args, {
        env: process.env,
        shell: isWindows,
        stdio: ['pipe', 'pipe', 'pipe'],
      }) as ChildProcessByStdio<Writable, Readable, Readable>;

      if (childProcess.stdin) {
        childProcess.stdin.write(stdinData);
        childProcess.stdin.end();
      }
    } else {
      childProcess = spawn(command, args, {
        env: process.env,
        shell: isWindows,
        stdio: ['ignore', 'pipe', 'pipe'],
      }) as ChildProcessByStdio<null, Readable, Readable>;
    }

    childProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
      
      // Report new content if callback provided
      if (onProgress && stdout.length > lastReportedLength) {
        const newContent = stdout.substring(lastReportedLength);
        lastReportedLength = stdout.length;
        onProgress(newContent);
      }
    });

    // CLI level errors
    childProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
      // find RESOURCE_EXHAUSTED when gemini-2.5-pro quota is exceeded
      if (stderr.includes("RESOURCE_EXHAUSTED")) {
        const modelMatch = stderr.match(/Quota exceeded for quota metric '([^']+)'/);
        const statusMatch = stderr.match(/status["\s]*[:=]\s*(\d+)/);
        const reasonMatch = stderr.match(/"reason":\s*"([^"]+)"/);
        const model = modelMatch ? modelMatch[1] : "Unknown Model";
        const status = statusMatch ? statusMatch[1] : "429";
        const reason = reasonMatch ? reasonMatch[1] : "rateLimitExceeded";
        const errorJson = {
          error: {
            code: parseInt(status),
            message: `GMCPT: --> Quota exceeded for ${model}`,
            details: {
              model: model,
              reason: reason,
              statusText: "Too Many Requests -- > try using gemini-2.5-flash by asking",
            }
          }
        };
        Logger.error(`Gemini Quota Error: ${JSON.stringify(errorJson, null, 2)}`);
      }
    });
    childProcess.on("error", (error: Error) => {
      if (!isResolved) {
        isResolved = true;
        Logger.error(`Process error:`, error);
        reject(new Error(`Failed to spawn command: ${error.message}`));
      }
    });
    childProcess.on("close", (code: number | null) => {
      if (!isResolved) {
        isResolved = true;
        if (code === 0) {
          Logger.commandComplete(startTime, code, stdout.length);
          resolve(stdout.trim());
        } else {
          Logger.commandComplete(startTime, code);
          Logger.error(`Failed with exit code ${code}`);
          const errorMessage = stderr.trim() || "Unknown error";
          reject(
            new Error(`Command failed with exit code ${code}: ${errorMessage}`),
          );
        }
      }
    });
  });
}