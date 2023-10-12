import { PDFDocument, PDFName, PDFHexString, PDFString } from 'pdf-lib';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface A3Options {
  author: string;
  title: string;
}

const addMetadataToDoc = (pdfDoc: PDFDocument, options: A3Options) => {
    const metadataXML = `
    <?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
      <x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.2-c001 63.139439, 2010/09/27-13:37:26        ">
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  
          <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:format>application/pdf</dc:format>
            <dc:creator>
              <rdf:Seq>
                <rdf:li>${options.author}</rdf:li>
              </rdf:Seq>
            </dc:creator>
            <dc:title>
              <rdf:Alt>
                  <rdf:li xml:lang="x-default">${options.title}</rdf:li>
              </rdf:Alt>
            </dc:title>
            <dc:subject>
              <rdf:Bag>
              </rdf:Bag>
            </dc:subject>
          </rdf:Description>
  
          <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
            <xmp:CreatorTool>Flick.</xmp:CreatorTool>
            <xmp:CreateDate>${new Date().toISOString()}</xmp:CreateDate>
            <xmp:ModifyDate>${new Date().toISOString()}</xmp:ModifyDate>
            <xmp:MetadataDate>${new Date().toISOString()}</xmp:MetadataDate>
          </rdf:Description>
  
          <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
            <pdf:Producer>Flick Netowrk</pdf:Producer>
          </rdf:Description>
  
          <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
            <pdfaid:part>3</pdfaid:part>
            <pdfaid:conformance>A</pdfaid:conformance>
          </rdf:Description>
        </rdf:RDF>
      </x:xmpmeta>
    <?xpacket end="w"?>
  `.trim();
  
          const metadataStream = pdfDoc.context.stream(metadataXML, {
                Type: 'Metadata',
                Subtype: 'XML',
                Length: metadataXML.length,
          });
  
          const metadataStreamRef = pdfDoc.context.register(metadataStream);
  
          pdfDoc.catalog.set(PDFName.of('Metadata'), metadataStreamRef);
  };

  export const makePDFA3 = async (base64: string, options: A3Options) => {
    try {
      let pdfDoc = await PDFDocument.load(base64);
  
      addMetadataToDoc(pdfDoc, options);
  
      const hash = crypto.createHash('sha256').update('DOCUMENTID' + new Date().toISOString).digest();
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      const permanentDocumentId = PDFHexString.of(hashHex);
      const changingDocumentID = permanentDocumentId;
      pdfDoc.context.trailerInfo.ID = pdfDoc.context.obj([permanentDocumentId, changingDocumentID]);
    
      const rootref = pdfDoc.context.obj({ Marked: true });
      pdfDoc.catalog.set(PDFName.of('MarkInfo'), rootref);
    
      const structTreedata = pdfDoc.context.obj({ Type: PDFName.of('StructTreeRoot') });
      const structTreeref = pdfDoc.context.register(structTreedata);
      pdfDoc.catalog.set(PDFName.of('StructTreeRoot'), structTreeref);
    
      const iccFilePath = path.join(__dirname, 'assets', 'sRGB2014.icc');
      const profile = fs.readFileSync(iccFilePath);
      const profileStream = pdfDoc.context.stream(profile, {
            Length: profile.length,
      });
      const profileStreamRef = pdfDoc.context.register(profileStream);
    
      const outputIntent = pdfDoc.context.obj({
            Type: 'OutputIntent',
            S: 'GTS_PDFA1',
            OutputConditionIdentifier: PDFString.of('sRGB'),
            DestOutputProfile: profileStreamRef,
      });
    
      const outputIntentRef = pdfDoc.context.register(outputIntent);
      pdfDoc.catalog.set(PDFName.of('OutputIntents'), pdfDoc.context.obj([outputIntentRef]));
  
      const pdfBytes = await pdfDoc.save();

      const base64String = Buffer.from(pdfBytes).toString('base64');
  
      return base64String;
    } catch (error) {
      throw error;
    }
  };