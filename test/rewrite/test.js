const {OpenJTalk,HtsvoiceFiles} = require('../../rewrite.js');
const mei1 = new OpenJTalk(); // mei_normal を使用
const mei2 = new OpenJTalk({ htsvoice: './voice/mei/mei_angry.htsvoice' });
const mei3 = new OpenJTalk({ htsvoice: './voice/mei/mei_happy.htsvoice' });

(async () => {
  // console.log(HtsvoiceFiles);
  const result = await mei1.speak("これはテストです。");
  console.log(result);
  console.log(await mei1.speakStream("これはテストです。"));
})();
