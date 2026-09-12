import Link from "next/link";
import type { Block } from "@/core/domain";
import { SeedVisual } from "./SeedVisual";

function BlockHeading({ block }: { block: Block }) {
  return (
    <header className="block-heading">
      <p className="eyebrow">{block.type}</p>
      {block.title ? <h3>{block.title}</h3> : null}
    </header>
  );
}

export function BlockRenderer({ block, linked = true }: { block: Block; linked?: boolean }) {
  const content = (
    <article className={`block block-${block.type}`}>
      {block.payload.visual ? (
        <figure className="block-visual">
          <SeedVisual kind={block.payload.visual} />
          <figcaption>{block.payload.label}</figcaption>
        </figure>
      ) : null}
      <div className="block-copy">
        <BlockHeading block={block} />
        {block.type === "measurement" ? (
          <p className="measurement-value">
            {block.payload.value}
            <span>{block.payload.unit}</span>
          </p>
        ) : null}
        {block.type === "code" && block.payload.body ? (
          <pre>
            <code>{block.payload.body}</code>
          </pre>
        ) : block.payload.body ? (
          <p className={block.type === "question" ? "question-copy" : undefined}>
            {block.payload.body}
          </p>
        ) : null}
        {block.description ? <p className="muted-copy">{block.description}</p> : null}
      </div>
    </article>
  );

  return linked ? (
    <Link className="block-link" href={`/block/${block.id}`}>
      {content}
    </Link>
  ) : (
    content
  );
}
