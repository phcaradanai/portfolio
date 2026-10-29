import { inlineTokens } from "@/lib/inline-md";

export function InlineMd({ text }: { text: string }) {
  return <>{inlineTokens(text).map((k, i) => k.t === "strong" ? <strong key={i}>{k.v}</strong> : k.t === "code" ? <code key={i}>{k.v}</code> : <span key={i}>{k.v}</span>)}</>;
}
