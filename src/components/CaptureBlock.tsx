import type { Capture } from "@/content/schema";
import { sha7 } from "@/lib/view";

/** Real output of a command that was actually run for this exhibition. Labelled as a recording. */
export function CaptureBlock({ c }: { c: Capture }) {
  return (
    <figure className="capture" id={`c-${c.id}`}>
      <figcaption className="capture__head">
        <strong>Captured run</strong>
        <span>{c.capturedAt.slice(0, 16).replace("T", " ")} UTC</span>
        <span>exit {c.exitCode}</span>
        <span>{(c.durationMs / 1000).toFixed(1)} s</span>
        <span>{c.repo}@{sha7(c.sha)}</span>
      </figcaption>
      <pre tabIndex={0}><code><span className="capture__cmd">$ {c.command}</span>{"\n"}{c.output}{c.truncated ? "\n… output trimmed" : ""}</code></pre>
      <p className="capture__note">Recorded output of one real run on {c.environment}. It is a recording, not a live terminal.</p>
    </figure>
  );
}
