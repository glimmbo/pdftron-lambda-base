import { PDFNet } from "@pdftron/pdfnet-node";
import { readFileSync } from "fs";
import path from "path";

export const appendAllPagesToDoc = async (
  sourceDoc: PDFNet.PDFDoc,
  destDoc: PDFNet.PDFDoc,
  debug?: boolean
): Promise<{ pagesAddedToSourceDoc: number }> => {
  const pagesToAppend = await sourceDoc.getPageCount();
  for (let i = 1; i <= pagesToAppend; i++) {
    const page = await sourceDoc.getPage(i);
    await destDoc.pagePushBack(page);
  }

  return { pagesAddedToSourceDoc: pagesToAppend };
};

const office2PDFExtensions = ["docx", "xlsx", "pptx", "doc"];
const toPdfWithBufferExtensions = [
  "bmp",
  "emf",
  "jpg",
  "jpeg",
  "png",
  "tif",
  "xps",
];

export const convertDocument = async ({
  filePath,
  tempDoc,
  debug,
}: {
  filePath: string;
  tempDoc: PDFNet.PDFDoc;
  debug?: boolean;
}): Promise<{ unsupportedFileType?: string }> => {
  try {
    const fileExtension = filePath.substring(filePath.lastIndexOf(".") + 1);
    const file = readFileSync(filePath);

    if (office2PDFExtensions.includes(fileExtension)) {
      const options = new PDFNet.Convert.OfficeToPDFOptions(); // may not need this
      const convertedDoc = await PDFNet.Convert.office2PDF(file, options);
      await appendAllPagesToDoc(convertedDoc, tempDoc, debug);
    } else if (toPdfWithBufferExtensions.includes(fileExtension)) {
      await PDFNet.Convert.toPdfWithBuffer(tempDoc, file, fileExtension);
    } else if (fileExtension === "pdf") {
      const pdfDoc = await PDFNet.PDFDoc.createFromBuffer(file);
      await appendAllPagesToDoc(pdfDoc, tempDoc, debug);
    } else {
      return { unsupportedFileType: fileExtension };
    }

    return {};
  } catch (error) {
    console.error(error);
    throw new Error(`Unable to convert document with filePath: ${filePath}`);
  }
};

/* 
  Each step of this function is testing the 3 categories of the convertDocument function
*/

export async function testCombine() {
  await PDFNet.runWithCleanup(async () => {
    const pdf1 = await PDFNet.PDFDoc.createFromFilePath(
      path.resolve("./Droop1.pdf")
    );

    const tempDoc = await PDFNet.PDFDoc.create();

    const before = await pdf1.getPageCount();
    console.log({ before });

    console.log("TESTING PDFs");
    try {
      await convertDocument({
        filePath: path.resolve("./Droop2.pdf"),
        tempDoc,
      });
    } catch (error) {
      console.error("PDF");
      console.error(error);
    }

    console.log("TESTING IMAGES");
    try {
      const imagePath = path.resolve("./dragger.jpg");
      await convertDocument({ filePath: imagePath, tempDoc });
    } catch (error) {
      console.error("IMAGES");
      console.error(error);
    }

    console.log("TESTING DOCX");
    try {
      const docPath = path.resolve("./project_proposal.docx");

      await convertDocument({ filePath: docPath, tempDoc });
    } catch (error) {
      console.error("DOCX");
      console.error(error);
    }

    console.log("APPENDING ATTACHMENTS");
    await appendAllPagesToDoc(tempDoc, pdf1);

    const after = await pdf1.getPageCount();
    console.log({ after });
  }, "demo:mark.glimm@geocomply.com:7f7701620200000000fc0448df023485e562460369e46a6697f1f439b0");
}
