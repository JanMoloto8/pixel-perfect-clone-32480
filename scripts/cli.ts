/*
 * Argument parsing shared by the RL scripts.
 *
 * Why this exists: `npm run rl:train -- --episodes 5000` does not survive
 * PowerShell. It strips the "--"-prefixed tokens and splits comma lists on the
 * comma, so the script silently runs with its defaults and you get an
 * experiment you did not ask for. These helpers make that loud instead of
 * silent: unrecognised leftovers are reported, and the resolved config is
 * always printed before any work starts.
 *
 * Safe invocation on Windows PowerShell:
 *   npx tsx scripts/train.ts --episodes 5000 --eval-vs "random,ab1"
 */

const argv = process.argv.slice(2);
const seen = new Set<string>();

/** Reads --name <value>, remembering which flags were actually used. */
export function arg(name: string, def: string): string {
    const i = argv.indexOf(`--${name}`);
    if (i >= 0 && argv[i + 1] !== undefined) {
        seen.add(`--${name}`);
        seen.add(argv[i + 1]);
        return argv[i + 1];
    }
    return def;
}

/** Reads a boolean --flag. */
export function flag(name: string): boolean {
    const has = argv.includes(`--${name}`);
    if (has) seen.add(`--${name}`);
    return has;
}

/** Comma list that also tolerates PowerShell having split it into separate args. */
export function list(name: string, def: string): string[] {
    const i = argv.indexOf(`--${name}`);
    if (i < 0) return def.split(",").filter(Boolean);
    seen.add(`--${name}`);
    const parts: string[] = [];
    for (let j = i + 1; j < argv.length && !argv[j].startsWith("--"); j++) {
        seen.add(argv[j]);
        parts.push(...argv[j].split(",").filter(Boolean));
    }
    return parts.length ? parts : def.split(",").filter(Boolean);
}

/**
 * Prints the resolved config and warns about anything on the command line that
 * was not consumed - which is what a mangled "npm run -- --flag" looks like.
 */
export function reportConfig(cfg: Record<string, unknown>): void {
    const leftover = argv.filter((a) => !seen.has(a));
    console.log("config: " + Object.entries(cfg).map(([k, v]) => `${k}=${Array.isArray(v) ? v.join("|") : v}`).join("  "));
    if (leftover.length) {
        console.warn(
            `\nWARNING: ignored arguments: ${leftover.join(" ")}\n` +
            `These did not match any flag. If you used "npm run ... -- --flag value" on\n` +
            `PowerShell, the flag names were stripped and the values above are what\n` +
            `reached the script - so it is running with DEFAULTS, not your settings.\n` +
            `Call the script directly instead:  npx tsx <script> --flag value\n` +
            `and quote comma lists:             --eval-vs "random,ab1"\n`,
        );
    }
}
