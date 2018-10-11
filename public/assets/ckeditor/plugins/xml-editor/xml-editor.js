export function editorImportTranscription(transcription) {
  if (transcription!=="") {
    transcription = transcription
      .replace(/<lb *\/?>/ig,"<br>")
      .replace(/<address>/ig, "<addresstag>").replace(/<\/address>/ig, "</addresstag>")
      .replace(/<add>/ig, "<addtag>").replace(/<\/add>/ig, "</addtag>")
      .replace(/<unclear>/ig, "<uncleartag>").replace(/<\/unclear>/ig, "</uncleartag>")
      .replace(/<note>/ig, "<notetag>").replace(/<\/note>/ig, "</notetag>")
      .replace(/<sic>/ig, "<sictag>").replace(/<\/sic>/ig, "</sictag>")
      .replace(/<date>/ig, "<datetag>").replace(/<\/date>/ig, "</datetag>")
      ;
    return transcription;
  }
  else return false;
}

export function editorExportTranscription(transcription) {
  if (transcription!=="") {
    transcription = transcription
      .replace(/&nbsp;/g," ")
      .replace(/&#8203;/g,"")
      .replace(/^<br ?>/ig,"<lb/>").replace(/<br *\/?>/ig,"<lb/>")
      .replace(/<addresstag>/ig,"<address>").replace(/<\/addresstag>/ig,"</address>")
      .replace(/<addtag>/ig,"<add>").replace(/<\/addtag>/ig,"</add>")
      .replace(/<uncleartag>/ig,"<unclear>").replace(/<\/uncleartag>/ig,"</unclear>")
      .replace(/<notetag>/ig,"<note>").replace(/<\/notetag>/ig,"</note>")
      .replace(/<sictag>/ig,"<sic>").replace(/<\/sictag>/ig,"</sic>")
      .replace(/<datetag>/ig,"<date>").replace(/<\/datetag>/ig,"</date>")
      ;
    return transcription;
  }
  else return false;
}

export function replaceTag(text, tags) {
  let newText = text;
  for (let i=0;i<tags.length; i++) {
    let tag = tags[i];
    if (tag.source.name!=="") {
      let tagOpening = "<"+tag.source.name;
      let tagSelfClosing = "/>";
      let tagClosing = "</"+tag.source.name;
      let tagStart = newText.indexOf(tagOpening);

      if (tagStart>-1) {

        if (tagStart!==false) {
          // replace opening tag
          let selfClosingTagStart = tagStart + newText.substring(tagStart).indexOf(tagSelfClosing)+1;
          let tagStart2 = tagStart + newText.substring(tagStart).indexOf(">")+1;

          if (selfClosingTagStart<tagStart2) {
            let preOpeningStr = newText.substring(0, tagStart);
            let postOpeningStr = newText.substring(selfClosingTagStart, newText.length);

            let targetAttrs = "";
            for (let j=0; j<tag.target.attributes.length; j++) {
              let tagTargetAttr = tag.target.attributes[j];
              targetAttrs += " "+tagTargetAttr.name+"='"+tagTargetAttr.value+"'";
            }
            let newOpeningTag = "<"+tag.target.name+targetAttrs+">";
            newText = preOpeningStr+newOpeningTag+postOpeningStr;
          }
          else {
            let preOpeningStr = newText.substring(0, tagStart);
            let postOpeningStr = newText.substring(tagStart2, newText.length);

            let targetAttrs = "";
            for (let j=0; j<tag.target.attributes.length; j++) {
              let tagTargetAttr = tag.target.attributes[j];
              targetAttrs += " "+tagTargetAttr.name+"='"+tagTargetAttr.value+"'";
            }
            let newOpeningTag = "<"+tag.target.name+targetAttrs+">";
            newText = preOpeningStr+newOpeningTag+postOpeningStr;

            // replace closing tag
            let tagEnd = newText.indexOf(tagClosing);
            let tagEnd2 = tagEnd + newText.substring(tagEnd).indexOf(">")+1;
            let preClosingStr = newText.substring(0, tagEnd);
            let postClosingStr = newText.substring(tagEnd2, newText.length);
            let newClosingTag = "</"+tag.target.name+">";
            newText = preClosingStr+newClosingTag+postClosingStr;
          }

        }
      }

    }
  }
  return newText;
}

export function replaceText(text, start, end, replaceValue) {

}
