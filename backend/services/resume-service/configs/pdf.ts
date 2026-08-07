
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

const extractPdfText = async (buffer: Buffer): Promise<string> => {
  const result = await pdfParse(buffer);
  return result.text;
};

export default extractPdfText;
