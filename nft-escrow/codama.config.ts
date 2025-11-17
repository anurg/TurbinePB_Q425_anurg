import { createFromRoot } from "@codama/nodes";
import { renderVisitor } from "@codama/renderers-js";
import { rootNodeFromAnchor } from "@codama/nodes";

// Path to your IDL
const idlPath = "./target/idl/nft_escrow.json";

// Output directory for generated client
const outputDir = "../nft-escrow-frontend/src/lib/generated";

export default async function generate() {
  // Load the IDL and create a Codama root node
  const idl = await import(idlPath);
  const rootNode = rootNodeFromAnchor(idl);

  // Render the JavaScript/TypeScript client
  await renderVisitor(rootNode, outputDir, {
    // Configuration options
    prettierOptions: {
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
    },
  });
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
